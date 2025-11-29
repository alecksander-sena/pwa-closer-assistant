// server/groq.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Rota universal da IA
app.post("/api/ia", async (req, res) => {
  try {
    const { message, system } = req.body;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system || "Você é uma IA útil." },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    res.json({
      text: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("Erro na API:", err);
    res.status(500).json({ error: "Erro no servidor da IA" });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Servidor IA rodando na porta " + PORT));
