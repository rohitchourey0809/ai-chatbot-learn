import 'dotenv/config';
import { GoogleGenAI } from './node_modules/@google/genai/dist/node/index.mjs';

const apiKey = process.env.GEMINI_API_KEY;
console.log('keyLoaded', !!apiKey);

const ai = new GoogleGenAI({ apiKey });

try {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Hello from test.',
  });
  console.log('responseText', response.text);
} catch (err) {
  console.error('FAIL', err?.message || err);
  if (err?.response) {
    console.error('response', JSON.stringify(err.response.data || err.response));
  }
}
