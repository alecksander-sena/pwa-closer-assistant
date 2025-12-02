// server/groq.js
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  console.error("GROQ_API_KEY missing. Set environment variable GROQ_API_KEY.");
  process.exit(1);
}

const client = new Groq({ apiKey: API_KEY });

/**
 * Rota que recebe:
 * { message: string, mode: "closer" | "simular" }
 * Retorna JSON com esquema:
 * { text, step, suggestion, actions }
 */
app.post("/api/ia", async (req, res) => {
  try {
    const { message = "", mode = "closer" } = req.body;

    // system prompts (closer uses contexto completo)
    const systemCloser = `
Você é um assistente especialista em VENDAS, CLOSING e no roteiro de 7 passos da Wise Up.
(use o contexto de vendas e sempre guie passo-a-passo).
IMPORTANTE: Responda **somente** como JSON (sem comentário adicional). O JSON precisa ter as chaves:
{
  "text": "<resposta curta que o closer deve dizer ao cliente>",
  "step": "<número ou nome do passo atual - ex: 1 | APRESENTAÇÃO>",
  "suggestion": "<uma frase curta: O QUE eu devo dizer AGORA (1-5 linhas)>",
  "actions": ["ask_decisor","ask_schedule","present_product","ask_price_opinion", ...] // opcional
}
Use linguagem natural e curta. Use o contexto (o closer já sabe o produto).
`;

    const systemCliente = `
Você é um cliente brasileiro comum em uma ligação. Responda naturalmente (gírias leves, pausas).
Não gere JSON — para simulação, retorne texto simples de cliente (vai ser mostrado como "cliente falou").
`;

    const system = mode === "closer" ? systemCloser : systemCliente;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message }
      ],
      temperature: mode === "closer" ? 0.25 : 0.8,
      max_tokens: 350
    });

    const raw = completion?.choices?.[0]?.message?.content;
    if (!raw) return res.status(500).json({ error: "Empty response from model" });

    // If mode is closer, model must return JSON. Try parse; otherwise send raw.
    if (mode === "closer") {
      try {
        // make sure we extract JSON block if model wrapped it inside backticks or text
        const firstBrace = raw.indexOf("{");
        const lastBrace = raw.lastIndexOf("}");
        const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? raw.slice(firstBrace, lastBrace + 1) : raw;
        const parsed = JSON.parse(jsonText);
        return res.json(parsed);
      } catch (err) {
        console.error("Failed to parse JSON from model:", err, "raw:", raw);
        // fallback: wrap raw into expected shape
        return res.json({
          text: typeof raw === "string" ? raw : String(raw),
          step: "unknown",
          suggestion: "Repita a pergunta ou peça mais informações.",
          actions: []
        });
      }
    } else {
      // simulação cliente -> just return text
      return res.json({ text: raw });
    }
  } catch (err) {
    console.error("Erro na API:", err);
    res.status(500).json({ error: "Erro no servidor da IA" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Servidor IA rodando na porta " + PORT));
