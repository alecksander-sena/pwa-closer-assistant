// server/groq.js
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

// procura pela variável de ambiente (use GROQ_API_KEY ou VITE_GROQ_API_KEY)
const API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
if (!API_KEY) {
  console.error("ERRO: variável de ambiente GROQ_API_KEY (ou VITE_GROQ_API_KEY) não encontrada.");
  process.exit(1);
}

const client = new Groq({ apiKey: API_KEY });

// system prompts curtos (o contexto completo ficará no frontend/data)
const systemPromptCloserShort = `Você é um assistente especialista em VENDAS (closer).
Siga os 7 passos da venda, responda curto (1-6 linhas), objetivamente e de forma consultiva.`;

const systemPromptClienteShort = `Você é um cliente brasileiro comum. Responda natural, com pausas, dúvidas e sem citar preços.`;

/**
 * Função utilitária: tenta parsear JSON, senão devolve objeto com text bruto.
 */
function safeParseModelOutput(raw) {
  if (!raw || typeof raw !== "string") return { text: "" };
  // tenta detectar se o modelo já devolveu JSON
  try {
    const parsed = JSON.parse(raw);
    // se for objeto com text, step etc, retorna direto
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch (e) {
    // não é JSON — segue abaixo
  }

  // fallback: monta um JSON simples
  return {
    text: raw,
    step: null,
    suggestion: null,
    actions: []
  };
}

/**
 * Endpoint universal /api/ia
 * Body esperado:
 * { message: string, mode?: "closer"|"cliente" }
 *
 * Resposta: JSON com { text, step, suggestion, actions }
 */
app.post("/api/ia", async (req, res) => {
  try {
    const { message, mode } = req.body ?? {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Campo 'message' obrigatório (string)." });
    }

    const system = mode === "cliente" ? systemPromptClienteShort : systemPromptCloserShort;

    // escolha do modelo (use um modelo ativo / disponível)
    const model = mode === "cliente" ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: message }
      ],
      temperature: mode === "cliente" ? 0.85 : 0.25,
      max_tokens: mode === "cliente" ? 250 : 400
    });

    // tentar obter o texto de resposta
    const modelText = completion?.choices?.[0]?.message?.content;
    const jsonResponse = safeParseModelOutput(modelText);

    return res.json(jsonResponse);
  } catch (err) {
    console.error("Erro na rota /api/ia:", err);
    // devolve mensagem amigável pro frontend
    return res.status(500).json({ error: "Erro no servidor da IA" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor IA rodando na porta ${PORT}`));
