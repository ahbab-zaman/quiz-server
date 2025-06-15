const fs = require("fs");
const path = require("path");
const pdfPoppler = require("pdf-poppler");
const Tesseract = require("tesseract.js");
const { getStructuredQuestions } = require("../services/llmService");

async function pdfToImages(pdfPath) {
  const outputDir = path.resolve(__dirname, "..", "uploads");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const outputName = path.basename(pdfPath, path.extname(pdfPath));

  const opts = {
    format: "png",
    out_dir: outputDir,
    out_prefix: outputName,
    page: null,
  };

  await pdfPoppler.convert(pdfPath, opts);

  const files = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith(outputName) && f.endsWith(".png"))
    .map((f) => path.join(outputDir, f));

  return files;
}

async function ocrImage(imagePath) {
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, "eng");
  return text;
}

exports.processPDF = async (req, res) => {
  try {
    const filePath = req.file.path;

    const images = await pdfToImages(filePath);
    if (images.length === 0) {
      return res.status(400).json({ error: "No images extracted from PDF" });
    }

    const host = req.get("host");
    const protocol = req.protocol;
    const uploadsDir = path.resolve(__dirname, "..", "uploads");

    const ocrResults = await Promise.all(images.map(ocrImage));
    const finalResult = [];

    for (let i = 0; i < images.length; i++) {
      const imgPath = images[i];
      const text = ocrResults[i];

      if (!text.trim()) continue;

      const questions = await getStructuredQuestions(text);
      const relativePath = path
        .relative(uploadsDir, imgPath)
        .replace(/\\/g, "/");
      const imageUrl = `${protocol}://${host}/uploads/${relativePath}`;

      // Push each question individually with same image
      for (let q of questions) {
        finalResult.push({
          image: imageUrl,
          question: q.question,
          options: q.options,
          answer: q.answer,
        });
      }
    }

    if (finalResult.length === 0) {
      return res
        .status(400)
        .json({ error: "No text/questions generated from PDF" });
    }

    res.json(finalResult);
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Error processing PDF" });
  }
};
