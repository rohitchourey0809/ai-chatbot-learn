export const config = {
  runtime: "@vercel/node@2.0.0",
};

function parseBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  if (body instanceof Buffer) {
    try {
      return JSON.parse(body.toString("utf8"));
    } catch {
      return {};
    }
  }

  return body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const parsedBody = parseBody(req.body);
  const message = typeof parsedBody.message === "string" ? parsedBody.message.trim() : "";

  if (!message) {
    return res.status(400).json({ error: "Please enter a message." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Add it to Vercel environment variables.",
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Gemini API request failed.");
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") ||
      "Sorry, I could not generate a response.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini serverless function error:", error);
    return res.status(500).json({ error: "Failed to generate AI response." });
  }
}
