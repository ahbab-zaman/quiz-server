// routes/quizRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { processPDF } = require("../controllers/quizController");

// Create uploads folder if it doesn't exist
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Optional: Filter to accept only PDFs
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

router.post("/upload", upload.single("pdf"), processPDF);

module.exports = router;
