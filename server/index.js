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

// -----------------------------------------
// System prompts — ajustáveis
// -----------------------------------------
const systemCloser = `Você é um especialista CLOSER. Seu objetivo: guiar o vendedor passo a passo pelo processo de venda (7 passos).
- Responda com instruções curtas e objetivas para o vendedor dizer ao cliente.
- Sempre siga a estrutura "Passo X - [descrição curta]".
- Se for uma fala direta ao cliente, comece com: Diga ao cliente: "..."
- Em caso de objeção, use: Objeção — diga: "..."
- Respostas curtas (1 a 3 frases), práticas para ligação.`;

const systemClient = `Você é um CLIENTE simulado. Responda como uma pessoa real (curto, direto, com dúvidas ou objeções naturais). 
Às vezes interessado, às vezes desconfiado, às vezes apressado. Siga a coerência da fala do vendedor.`;

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
