// /api/ia.js
import Groq from "groq-sdk";
import { CONTEXTO_CLOSER } from "../src/data/contexto.js"; // <── IMPORTA O SEU CONTEXTO COMPLETO

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "O campo 'message' é obrigatório e deve ser uma string."
      });
    }

    const API_KEY = process.env.GROQ_API_KEY;
    const MODEL = process.env.GROQ_MODEL_CLOSER;

    if (!API_KEY) {
      console.error("❌ ERRO: GROQ_API_KEY não configurada.");
      return res.status(500).json({
        instruction: "Erro: API Key da IA não configurada."
      });
    }

    if (!MODEL) {
      console.error("❌ ERRO: GROQ_MODEL_CLOSER não configurado.");
      return res.status(500).json({
        instruction: "Erro: Modelo GROQ_MODEL_CLOSER não configurado."
      });
    }

    const client = new Groq({ apiKey: API_KEY });

    // 🎯 SYSTEM PROMPT — agora com TODO seu contexto integrado
    const systemPrompt = `
Você é ALECKSANDER, um CLOSER PROFISSIONAL BRASILEIRO.
Você segue EXATAMENTE os 7 PASSOS do método abaixo:

========================
### CONTEXTO DO MÉTODO
========================
${CONTEXTO_CLOSER}
========================

⚠️ REGRAS ABSOLUTAS:
- Você NUNCA gera diálogo.
- Você NUNCA cria falas do cliente.
- Você NUNCA retorna JSON.
- Você NÃO devolve análise longa.
- Você **só devolve a frase que o vendedor (closer) deve falar AGORA**.
- A resposta deve ser SEMPRE assim:

📞 Agora diga ao cliente: "…texto…"

Somente isso. Sempre nesse formato. Sem exceções.
    `;

    // 🧠 Gera apenas a instrução do closer
    const resposta = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.4,
      max_tokens: 200
    });

    const texto =
      resposta?.choices?.[0]?.message?.content ||
      "⚠️ Não consegui gerar instrução agora.";

    return res.status(200).json({
      instruction: texto
    });

  } catch (err) {
    console.error("❌ ERRO NO /api/ia.js:", err);

    return res.status(500).json({
      instruction: "❌ Erro interno ao processar instrução."
    });
  }
}
