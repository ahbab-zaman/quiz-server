const express = require("express");
const multer = require("multer");
const router = express.Router();
const { processPDF } = require("../controllers/quizController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.post("/upload", upload.single("pdf"), processPDF);

module.exports = router;
