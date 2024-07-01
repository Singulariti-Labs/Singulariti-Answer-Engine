import express, { Request, Response } from "express";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { getAvailableProviders } from "../lib/providers";
import { getChatModel, getChatModelProvider } from "../config";
import handleImageSearch from "../controllers/imageSearchController";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { query, chat_history } = req.body;

    const models = await getAvailableProviders();
    const provider = getChatModelProvider();
    const chatModel = getChatModel();

    let llm: BaseChatModel | undefined;

    if (models[provider] && models[provider][chatModel]) {
      llm = models[provider][chatModel] as BaseChatModel | undefined;
    }

    if (!llm) {
      res.status(500).json({ message: "Invalid LLM model selected" });
      return;
    }

    const images = await handleImageSearch({ query, chat_history }, llm);

    res.status(200).json({ images });
  } catch (error) {
    res.status(500).json({ message: "AN error has occured." });
    console.log(error.message);
  }
});

export default router;
