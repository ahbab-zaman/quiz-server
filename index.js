require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://digitalize-client.vercel.app",
      "https://bucolic-sundae-2653c6.netlify.app",
    ],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.use("/api/quiz", require("./routes/quizRoutes"));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
