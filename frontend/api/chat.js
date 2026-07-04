import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { message } = req.body ?? {};
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedMessage) {
    return res.status(400).json({ error: "Please enter a message." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Add it to Vercel environment variables.",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: trimmedMessage,
    });

    const reply =
      response.text ||
      response.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") ||
      "Sorry, I could not generate a response.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini serverless function error:", error);
    return res.status(500).json({ error: "Failed to generate AI response." });
  }
}
