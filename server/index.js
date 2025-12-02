// server/index.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama3-70b-8192";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

if (!GROQ_API_KEY) {
  console.warn("Warning: GROQ_API_KEY is not set. The server won't be able to call Groq.");
}

// System prompts — ajustáveis
const systemCloser = `Você é um especialista CLOSER. Seu objetivo: guiar o vendedor passo a passo pelo processo de venda (7 passos).
- Responda com instruções curtas e objetivas para o vendedor dizer ao cliente.
- Sempre siga a estrutura "Passo X - [descrição curta]" quando for sequenciar.
- Se for uma fala direta ao cliente, inicie com: Diga ao cliente: "..." 
- Se houver objeção, responda com: "Objeção — diga: '...'" 
- Mantenha cada resposta entre 1 e 3 frases, objetivo para fala em ligação.`;

const systemClient = `Você é um CLIENTE que será simulado. Responda como uma pessoa real (curta, natural, com dúvidas ou objeções possíveis). Seja variado: às vezes interessado, às vezes desconfiado, às vezes apressado. Responda coerentemente com a fala do vendedor.`;

async function callGroqChat({ system, userMessage, temperature = 0.2, max_tokens = 400 }) {
  if (!GROQ_API_KEY) {
    // fallback simples para desenvolvimento sem Groq
    return { text: fallbackResponse(system, userMessage) };
  }

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMessage }
    ],
    temperature,
    max_tokens,
    n: 1
  };

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status} ${text}`);
  }

  // A resposta tem formato compatível OpenAI — parse e retorne text
  const parsed = JSON.parse(text);
  const message =
    parsed?.choices?.[0]?.message?.content ??
    parsed?.choices?.[0]?.text ??
    JSON.stringify(parsed);

  return { text: message };
}

function fallbackResponse(system, userMessage) {
  const s = system.toLowerCase();
  const m = userMessage.toLowerCase();
  if (s.includes("closer")) {
    if (m.includes("oi") || m.includes("olá")) {
      return 'Diga ao cliente: "Oi, tudo bem? Me chamo [seu nome] — você tem um minuto?" (Passo 1 - Conexão)';
    }
    if (m.includes("valor") || m.includes("preço")) {
      return 'Diga ao cliente: "Entendo a preocupação com valor. Posso te explicar o formato e ver se faz sentido para a sua rotina?" (Passo 4 - Proposta)';
    }
    return 'Passo 1 - Conexão: Faça uma pergunta aberta pra identificar disponibilidade.';
  }
  // client fallback
  if (m.includes("oi") || m.includes("olá")) return "Oi, quem está falando?";
  if (m.includes("curso") || m.includes("inglês")) return "Depende... quanto custa?";
  return "Desculpa, pode repetir? Estou no trabalho agora.";
}

// API endpoint: retorna { closer: { text }, client: { text } }
app.post("/api/ia", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' in body" });
    }

    // Parallell calls: closer + client
    const [closerResp, clientResp] = await Promise.all([
      callGroqChat({ system: systemCloser, userMessage: message, temperature: 0.15, max_tokens: 200 })
        .catch((e) => ({ text: fallbackResponse(systemCloser, message) })),
      callGroqChat({ system: systemClient, userMessage: message, temperature: 0.6, max_tokens: 200 })
        .catch((e) => ({ text: fallbackResponse(systemClient, message) }))
    ]);

    return res.json({
      closer: { text: (closerResp.text || "").trim() },
      client: { text: (clientResp.text || "").trim() }
    });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
