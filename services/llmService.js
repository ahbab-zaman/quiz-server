const axios = require("axios");

exports.getStructuredQuestions = async (rawText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${apiKey}`;

  const prompt = `
Extract multiple choice questions from the following text. Return JSON with this format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "...",
    "diagram": "diagram1.png" // if any, otherwise null
  }
]
Text:
${rawText}
`;

  try {
    const res = await axios.post(
      endpoint,
      {
        prompt: {
          text: prompt,
        },
        temperature: 0,
        maxOutputTokens: 1024,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const textResponse = res.data?.candidates?.[0]?.text;
    if (!textResponse) {
      throw new Error("No valid response text from Gemini API");
    }

    try {
      const parsed = JSON.parse(textResponse);
      return parsed;
    } catch (jsonError) {
      throw new Error(
        "Failed to parse JSON from Gemini response: " + jsonError.message
      );
    }
  } catch (error) {
    throw new Error("Error calling Gemini API: " + error.message);
  }
};
