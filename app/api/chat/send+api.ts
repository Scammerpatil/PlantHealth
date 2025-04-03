import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { message: "Messages array is required" },
        { status: 400 }
      );
    }

    const systemPrompt = {
      role: "system",
      text: "You are an AI chatbot for an application that predicts leaf diseases. Provide accurate and helpful responses based on leaf disease symptoms, causes, and remedies.",
    };

    const chatHistory = [systemPrompt, ...messages];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: chatHistory,
    });

    return Response.json({ message: response.text }, { status: 200 });
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return Response.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
