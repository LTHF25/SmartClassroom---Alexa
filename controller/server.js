const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve semua file statis
app.use(express.static(path.join(__dirname, "../"))); // index.html
app.use("/css", express.static(path.join(__dirname, "../css"))); // style.css
app.use("/controller", express.static(path.join(__dirname, "../controller"))); // script.js
app.use("/image", express.static(path.join(__dirname, "../image"))); // gambar

// Endpoint generate
app.post("/generate", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan saat menghubungi API." });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
