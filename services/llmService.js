const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const quizModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are a quiz question generator. Based on the given text, generate an array of multiple-choice questions in EXACT JSON format ONLY. Each question should have: 
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "answer": "one of the options"
  }
]`,
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.9,
  },
});

function sanitizeOption(opt) {
  // If option is already a string, just return it
  if (typeof opt === "string") return opt;

  // If it's an object, try to convert to string
  if (typeof opt === "object" && opt !== null) {
    // You can customize this if you know possible keys
    if ("amount" in opt && "explanation" in opt) {
      return `${opt.amount} - ${opt.explanation}`;
    }
    // fallback JSON stringify for unknown structures
    return JSON.stringify(opt);
  }

  // For other types, convert to string safely
  return String(opt);
}

exports.getStructuredQuestions = async (pdfText) => {
  try {
    const result = await quizModel.generateContent(pdfText);
    const response = await result.response;
    const text = await response.text();

    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    // Sanitize options: ensure all options are strings
    const sanitized = parsed.map((q) => ({
      question: q.question,
      options: q.options.map(sanitizeOption),
      answer:
        typeof q.answer === "string" ? q.answer : sanitizeOption(q.answer),
    }));

    return sanitized;
  } catch (err) {
    console.error("❌ Failed to parse or sanitize JSON:", err);
    throw new Error("AI response not in expected format");
  }
};
