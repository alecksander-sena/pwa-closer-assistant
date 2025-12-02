// server/index.js
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("❌ ERRO: Faltando GROQ_API_KEY no .env.");
  process.exit(1);
}

const client = new Groq({ apiKey: GROQ_API_KEY });

// Prompts
const systemCloser = `
Você é um especialista CLOSER profissional.
Siga sempre os 7 passos da venda.
Responda curto, claro, objetivo e aplicável a uma ligação real.
`;

const systemClient = `
Você é um cliente brasileiro comum.
Responda de forma natural, com dúvidas, receios e curiosidade.
`;

// Função para chamar modelo
async function callGroq(system, userMessage, model, temperature) {
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMessage }
    ],
    temperature,
    max_tokens: 350
  });

  return completion?.choices?.[0]?.message?.content || "";
}

// Endpoint único
app.post("/api/ia", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Campo 'message' obrigatório." });
    }

    const [closerResp, clientResp] = await Promise.all([
      callGroq(systemCloser, message, "llama-3.3-70b-versatile", 0.25),
      callGroq(systemClient, message, "llama-3.1-8b-instant", 0.85)
    ]);

    return res.json({
      closer: { text: closerResp.trim() },
      client: { text: clientResp.trim() }
    });
  } catch (err) {
    console.error("Erro /api/ia:", err);
    return res.status(500).json({ error: "Erro interno da IA" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend IA rodando em http://localhost:${PORT}`);
});
