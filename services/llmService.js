const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const quizModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are a quiz question generator. Based on the given text, generate an array of multiple-choice questions in EXACT JSON format ONLY. Each question should have: 
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "answer": "one of the options"
}]`,
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.9,
  },
});

exports.getStructuredQuestions = async (pdfText) => {
  try {
    const result = await quizModel.generateContent(pdfText);
    const response = await result.response;
    const text = await response.text();
    console.log("Raw AI response:", text);
    // Optional: remove markdown code block if AI adds it
    const cleaned = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err);
    throw new Error("AI response not in expected format");
  }
};
