import { EventEmitter, WebSocket } from "ws";
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Embeddings } from "@langchain/core/embeddings";
import { string } from "zod";
import handleImageSearch from "../controllers/imageSearchController";
import handleWebSearch from "../controllers/webSearchController";
import handleWolframAlphaSearch from "../controllers/wolframAlphaSearchController";
import handleYoutubeSearch from "../controllers/youtubeSearchController";
import handleRedditSearch from "../controllers/redditSearchController";
import handleAcademiceSearch from "../controllers/academicSearchController";
import crypto from 'crypto';
type Message = {
  messageId: string;
  chatId: string;
  content: string;
};

type WsMessage = {
  message: Message;
  type: string;
  focusMode: string;
  history: Array<[string, string]>;
}

const searchHandlers = {
  academicSearch: handleAcademiceSearch,
  redditSearch: handleRedditSearch,
  webSearch: handleWebSearch,
  wolframAlphaSearch: handleWolframAlphaSearch,
  youtubeSearch: handleYoutubeSearch,
};

const handleEmitterEvents = (
  emitter: EventEmitter,
  ws: WebSocket,
  messageId: string,
  chatId: string,
) => {
  let recievedMessage = '';
  let sources = [];

  emitter.on("data", (data) => {
    const parsedData = JSON.parse(data);

    if (parsedData.type === "response") {
      ws.send(
        JSON.stringify({
          type: "message",
          data: parsedData.data,
          messageId: messageId,
        }),
      );
      recievedMessage += parsedData.data
    } else if (parsedData.type === "sources") {
      ws.send(
        JSON.stringify({
          type: "sources",
          data: parsedData.data,
          messageId: messageId,
        }),
      );
      sources = parsedData.data;
    }
  });
  emitter.on("end", () => {
    ws.send(JSON.stringify({ type: "messageEnd", messageId: messageId }));
  });
  emitter.on("error", (data) => {
    const parsedData = JSON.parse(data);
    ws.send(JSON.stringify({ type: "error", data: parsedData.dat, key: 'CHAIN_ERROR' }));
  });
};

export const handleMessage = async (
  message: string,
  ws: WebSocket,
  llm: BaseChatModel,
  embeddings: Embeddings,
) => {
  try {
    const parsedWsMessage = JSON.parse(message) as WsMessage;
    const parsedMessage = parsedWsMessage.message;
    console.log("parsedMessage:", parsedMessage);
    const id = crypto.randomBytes(7).toString('hex');

    // new added for test
    console.log(parsedMessage.content);

    if (!parsedMessage.content) {
      return ws.send(
        JSON.stringify({ type: "error", data: "Invaild message format", key: 'INVALID_MESSAGE_FORMAT' }),
      );
    }
     
    // new added for test
    // parsedMessage.history.map((msg) => {
    //   console.log(msg[0],msg[1]);
    // })

    const history: BaseMessage[] = parsedWsMessage.history.map((msg) => {
      if (msg[0] === "human") {
        return new HumanMessage({
          content: msg[1],
        });
      } else {
        return new AIMessage({
          content: msg[1],
        });
      }
    });

    if (parsedWsMessage.type === "message") {
      console.log(parsedWsMessage.focusMode);
      const handler = searchHandlers[parsedWsMessage.focusMode];
      console.log("handler: ", handler);
      if (handler) {
        const emitter = handler(
          parsedMessage.content,
          history,
          llm,
          embeddings,
        );
        console.log("emitter: ", emitter);
        handleEmitterEvents(emitter, ws, id, parsedMessage.chatId);
      } else {
        ws.send(JSON.stringify({ type: "error", data: "Invalid focus mode",  key: 'INVALID_FOCUS_MODE', }));
      }
    }
  } catch (error) {
    console.error("Failed to handle message", error);
    ws.send(JSON.stringify({ type: "error", data: "Invalid message format", key: 'INVALID_MESSAGE_FORMAT' }));
  }
};
