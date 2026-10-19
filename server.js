import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({ ready: Boolean(process.env.GEMINI_API_KEY) });
});

app.post("/api/ask", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key belum dipasang di file .env."
      });
    }

    const question = String(req.body.question || "").trim();

    if (!question) {
      return res.status(400).json({
        error: "Tulis pertanyaan dulu, bro."
      });
    }

    if (question.length > 6000) {
      return res.status(400).json({
        error: "Pertanyaan terlalu panjang. Maksimal 6000 karakter."
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text:
                "Kamu adalah AI PINTAR BY KENZ, tutor ramah berbahasa Indonesia. " +
                "Bantu siswa memahami pelajaran, mengerjakan soal latihan, " +
                "dan memeriksa jawaban dengan penjelasan yang mudah dipahami. " +
                "Jangan mengerjakan atau mengirimkan jawaban secara otomatis " +
                "ke ujian aktif atau portal ujian. Untuk konteks ujian aktif, " +
                "arahkah siswa memahami konsep dan berlatih dengan soal serupa."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: question }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data.error?.message || response.status);
      return res.status(502).json({
        error: "Gemini belum bisa menjawab. Periksa API key, kuota, dan akses model."
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return res.status(502).json({
        error: "Gemini tidak memberikan jawaban. Coba pertanyaan lain."
      });
    }

    res.json({ answer });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({
      error: "Server bermasalah. Coba lagi sebentar."
    });
  }
});

app.listen(port, () => {
  console.log(`AI PINTAR BY KENZ berjalan di port ${port}`);
});
