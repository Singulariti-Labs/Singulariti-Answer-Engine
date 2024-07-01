import { WebSocket } from "ws";
import { getAvailableProviders } from "../lib/providers";
import { getChatModel, getChatModelProvider } from "../config";
import { handleMessage } from "./messageHandler";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Embeddings } from "@langchain/core/embeddings";

export const handleConnection = async (ws: WebSocket) => {
  const models = await getAvailableProviders();
  const provider = getChatModelProvider();
  const chatModel = getChatModel();

  let llm: BaseChatModel | undefined;
  let embeddings: Embeddings | undefined;

  if (models[provider] && models[provider][chatModel]) {
    llm = models[provider][chatModel] as BaseChatModel | undefined;
    embeddings = models[provider].embeddings as Embeddings | undefined;
  }

  if (!llm || !embeddings) {
    ws.send(
      JSON.stringify({
        type: "error",
        data: "Invalid LLM or Embeddings model selected",
      }),
    );
    ws.close();
  }

  // ws.on(
  //     "message", async (message) => {
  //         console.log("test event")
  //        ws.send(
  //         JSON.stringify({
  //             type: "test",
  //             data: "this is a test event"
  //         })
  //     )
  //     }
  // );

  ws.on("message", async (message) => {
    console.log(message.toString());
    await handleMessage(message.toString(), ws, llm, embeddings);
  });

  ws.on("close", () => console.log("Connection Closed"));
};
