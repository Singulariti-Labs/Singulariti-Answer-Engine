import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { getOpenaiApiKey } from "../config";

export const getAvailableProviders = async () => {
  const openAIApiKey = getOpenaiApiKey();

  const models = {};

  if (openAIApiKey) {
    try {
      models["openai"] = {
        "gpt-3.5-turbo": new ChatOpenAI({
          openAIApiKey,
          modelName: "gpt-3.5-turbo",
          temperature: 0.7,
        }),
        "gpt-4": new ChatOpenAI({
          openAIApiKey,
          modelName: "gpt-4",
          temperature: 0.7,
        }),
        embeddings: new OpenAIEmbeddings({
          openAIApiKey,
          modelName: "text-embedding-3-large",
        }),
      };
    } catch (err) {
      console.log(`Error loading OpenAI models: ${err}`);
    }
  }

  return models;
};

export const getAvailableChatModelProviders = async () => {
  const openAIApiKey = getOpenaiApiKey();

  const models = {};

  if (openAIApiKey) {
    try {
      models['openai'] = {
        'GPT-3.5 turbo': new ChatOpenAI({
          openAIApiKey,
          modelName: 'gpt-3.5-turbo',
          temperature: 0.7,
        }),
        'GPT-4': new ChatOpenAI({
          openAIApiKey,
          modelName: 'gpt-4',
          temperature: 0.7,
        }),
        'GPT-4 turbo': new ChatOpenAI({
          openAIApiKey,
          modelName: 'gpt-4-turbo',
          temperature: 0.7,
        }),
        'GPT-4 omni': new ChatOpenAI({
          openAIApiKey,
          modelName: 'gpt-4o',
          temperature: 0.7,
        }),
      };
    } catch (err) {
      console.log(`Error loading OpenAI models: ${err}`);
    }
  }

  models['custom_openai'] = {};

  return models;
};

export const getAvailableEmbeddingModelProviders = async () => {
  const openAIApiKey = getOpenaiApiKey();

  const models = {};

  if (openAIApiKey) {
    try {
      models['openai'] = {
        'Text embedding 3 small': new OpenAIEmbeddings({
          openAIApiKey,
          modelName: 'text-embedding-3-small',
        }),
        'Text embedding 3 large': new OpenAIEmbeddings({
          openAIApiKey,
          modelName: 'text-embedding-3-large',
        }),
      };
    } catch (err) {
      console.log(`Error loading OpenAI embeddings: ${err}`);
    }
  }

  return models;
};



