const fs = require("fs");
const path = require("path");
const pdfPoppler = require("pdf-poppler");
const Tesseract = require("tesseract.js");
const { getStructuredQuestions } = require("../services/llmService");

async function pdfToImages(pdfPath) {
  const outputDir = path.dirname(pdfPath);
  const outputName = path.basename(pdfPath, path.extname(pdfPath));

  const opts = {
    format: "png",
    out_dir: outputDir,
    out_prefix: outputName,
    page: null,
  };

  await pdfPoppler.convert(pdfPath, opts);

  // Return array of image paths generated from PDF
  const files = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith(outputName) && f.endsWith(".png"))
    .map((f) => path.join(outputDir, f));

  return files;
}

async function ocrImage(imagePath) {
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, "eng"); // No logger to reduce noise
  return text;
}

exports.processPDF = async (req, res) => {
  try {
    const filePath = req.file.path;

    // 1. Convert PDF pages to images
    const images = await pdfToImages(filePath);
    if (images.length === 0) {
      return res.status(400).json({ error: "No images extracted from PDF" });
    }

    const host = req.get("host"); // e.g. localhost:3000
    const protocol = req.protocol; // http or https

    const results = [];

    for (const imgPath of images) {
      // 2. OCR text from each image
      const text = await ocrImage(imgPath);
      if (!text.trim()) {
        // Skip pages with no text or handle as needed
        continue;
      }

      // 3. Generate questions from this page's text
      const questions = await getStructuredQuestions(text);

      // 4. Build image URL
      const relativePath = imgPath.replace(/\\/g, "/").split("/uploads/").pop();
      const imageUrl = `${protocol}://${host}/uploads/${relativePath}`;

      // 5. Add to results array
      results.push({
        image: imageUrl,
        questions,
      });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ error: "No text/questions generated from PDF" });
    }

    res.json(results);
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Error processing PDF" });
  }
};
