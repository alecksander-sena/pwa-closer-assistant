// api/ia.js
import Groq from "groq-sdk";

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
        error: "API Key da IA não configurada no servidor."
      });
    }

    if (!MODEL) {
      console.error("❌ ERRO: GROQ_MODEL_CLOSER não configurado.");
      return res.status(500).json({
        error: "Modelo GROQ_MODEL_CLOSER não configurado."
      });
    }

    const client = new Groq({ apiKey: API_KEY });

    // 🧠 PROMPT QUE GERA APENAS A ORIENTAÇÃO DO CLOSER
    const systemPrompt = `
Você é um assistente de vendas (CLOSER) brasileiro extremamente experiente.
Sua função é orientar o vendedor exatamente sobre o que deve FALAR AGORA.

⚠️ IMPORTANTE:
- Não gere diálogos completos.
- Não gere JSON.
- Não simule cliente falando.
- Apenas diga ao vendedor O QUE FALAR.
- Responda sempre curto, direto e objetivo.
- Sempre baseado nos 7 passos fornecidos.
- O texto deve ser pronto para copiar e falar em uma ligação real.

O usuário irá te mandar:
- O nome do lead
- O que o cliente disse
- Ou a etapa em que está

Você retorna APENAS uma instrução clara, assim:

"📞 Agora diga ao cliente: '...texto...' "

Nada além disso.
    `;

    // 🔥 GERA APENAS A INSTRUÇÃO DA PRÓXIMA FALA
    const resposta = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 180
    });

    const texto =
      resposta.choices?.[0]?.message?.content ||
      "⚠️ Não consegui gerar instrução.";

    return res.status(200).json({
      instruction: texto
    });

  } catch (err) {
    console.error("❌ ERRO NO SERVER /api/ia:", err);
    return res.status(500).json({
      error: "Erro interno ao processar IA.",
      details: err.message
    });
  }
}
  
