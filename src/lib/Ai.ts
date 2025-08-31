import OpenAI from "openai";


 export const client = new OpenAI({
  baseURL: "https://api.sambanova.ai/v1", 
  apiKey: process.env.SAMBANOVA_API_KEY,  
});