const { exec } = require("child_process");
const path = require("path");

exports.extractDiagrams = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve("python/extract_diagrams.py");
    exec(`python3 "${scriptPath}" "${pdfPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Error running Python:", stderr);
        return reject(error);
      }
      const diagramPaths = stdout
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.endsWith(".png"));
      resolve(diagramPaths);
    });
  });
};
