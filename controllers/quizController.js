const fs = require("fs");
const path = require("path");
const Quiz = require("../models/Quiz");
const { extractTextFromPDF } = require("../services/ocrService");
const { getStructuredQuestions } = require("../services/llmService");
const { extractDiagrams } = require("../services/diagramService");

exports.processPDF = async (req, res) => {
  const filePath = req.file.path;

  try {
    const extractedText = await extractTextFromPDF(filePath);
    const structuredQuestions = await getStructuredQuestions(extractedText);
    const diagramPaths = await extractDiagrams(filePath);

    const enrichedQuestions = structuredQuestions.map((q, idx) => ({
      ...q,
      diagram: diagramPaths[idx]
        ? diagramPaths[idx].replace(/^.*diagrams\//, "")
        : null,
    }));

    const quiz = new Quiz({
      title: req.file.originalname,
      questions: enrichedQuestions,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Failed to process quiz" });
  }
};
