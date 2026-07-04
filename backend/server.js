import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://ai-chatbot-learn.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running 🚀",
  });
});

app.post("/chat", async (req, res) => {
  const message = req.body?.message?.trim();

  if (!message) {
    return res.status(400).json({ error: "Please enter a message." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Add it to the backend .env file.",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    const reply =
      response.text ||
      response.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") ||
      "Sorry, I could not generate a response.";

    return res.json({ reply });
  } catch (error) {
    console.error("Gemini request failed:", error);
    return res.status(500).json({ error: "Failed to generate AI response." });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});