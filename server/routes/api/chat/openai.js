import dotenv from "dotenv";
import OpenAI from "openai";
const env = dotenv.config().parsed;

// The name of your Azure OpenAI Resource.
// https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/create-resource?pivots=web-portal#create-a-resource
const resource = "hkust.azure-api.net";

// Corresponds to your Model deployment within your OpenAI resource, e.g. my-gpt35-16k-deployment
// Navigate to the Azure OpenAI Studio to deploy a model.
export const model = {
  profe: "gpt-4o", // Professor E,
  dusty: "gpt-4o", // Dusty
  dustyEQ: "gpt-4o", // Dusty EQ
};

// https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#rest-api-versioning
const apiVersion = "2023-05-15";

const apiKey = env["API_KEY"];
if (!apiKey) {
  throw new Error("API_KEY environment variable is missing or empty.");
}

// const openaiApiKey = env['OPENAI_API_KEY']
// if (!openaiApiKey) {
//   throw new Error('OPENAI_API_KEY environment variable is missing or empty.');
// }

// Azure OpenAI requires a custom baseURL, api-version query param, and api-key header.
export const dustyOpenAI = new OpenAI({
  apiKey,
  baseURL: `https://${resource}/openai/deployments/${model.dusty}`,
  defaultQuery: { "api-version": apiVersion },
  defaultHeaders: { "api-key": apiKey },
});
