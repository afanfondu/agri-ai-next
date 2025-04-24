import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI SDK
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};
