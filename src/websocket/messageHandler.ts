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

type Message = {
  type: string;
  content: string;
  copilot: boolean;
  focusMode: string;
  history: Array<[string, string]>;
};

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
  id: string,
) => {
  emitter.on("data", (data) => {
    const parsedData = JSON.parse(data);
    if (parsedData.type === "response") {
      ws.send(
        JSON.stringify({
          type: "message",
          data: parsedData.data,
          messageId: id,
        }),
      );
    } else if (parsedData.type === "sources") {
      ws.send(
        JSON.stringify({
          type: "sources",
          data: parsedData.data,
          messageId: id,
        }),
      );
    }
  });
  emitter.on("end", () => {
    ws.send(JSON.stringify({ type: "messageEnd", messageId: id }));
  });
  emitter.on("error", (data) => {
    const parsedData = JSON.parse(data);
    ws.send(JSON.stringify({ type: "error", data: parsedData.data }));
  });
};

export const handleMessage = async (
  message: string,
  ws: WebSocket,
  llm: BaseChatModel,
  embeddings: Embeddings,
) => {
  try {
    const parsedMessage = JSON.parse(message) as Message;
    console.log("parsedMessage:", parsedMessage);
    const id = Math.random().toString(36).substring(7);

    // new added for test
    console.log(parsedMessage.content);

    if (!parsedMessage.content) {
      return ws.send(
        JSON.stringify({ type: "error", data: "Invaild message format" }),
      );
    }
     
    // new added for test
    parsedMessage.history.map((msg) => {
      console.log(msg[0],msg[1]);
    })

    const history: BaseMessage[] = parsedMessage.history.map((msg) => {
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

    if (parsedMessage.type === "message") {
      console.log(parsedMessage.focusMode);
      const handler = searchHandlers[parsedMessage.focusMode];
      console.log("handler: ", handler);
      if (handler) {
        const emitter = await handler(
          parsedMessage.content,
          history,
          llm,
          embeddings,
        );
        console.log("emitter: ", emitter);
        handleEmitterEvents(emitter, ws, id);
      } else {
        ws.send(JSON.stringify({ type: "error", data: "Invalid focus mode" }));
      }
    }
  } catch (error) {
    console.error("Failed to handle message", error);
    ws.send(JSON.stringify({ type: "error", data: "Invalid message format" }));
  }
};
