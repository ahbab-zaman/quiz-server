const Tesseract = require("tesseract.js");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

exports.extractTextFromPDF = async (filePath) => {
  const outputImagePath = filePath.replace(".pdf", "-page.jpg");

  // Convert first page of PDF to image
  return new Promise((resolve, reject) => {
    exec(
      `pdftoppm -jpeg -f 1 -singlefile ${filePath} ${outputImagePath.replace(
        ".jpg",
        ""
      )}`,
      async (err) => {
        if (err) return reject(err);

        // OCR the image
        const {
          data: { text },
        } = await Tesseract.recognize(outputImagePath, "eng");
        resolve(text);
      }
    );
  });
};
