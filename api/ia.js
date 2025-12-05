// /api/ia.js
import Groq from "groq-sdk";
import { CONTEXTO_CLOSER } from "../src/data/contexto.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { message, history = [] } = req.body;

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

    // PROMPT ajustado: modelo lembra do contexto e responde limpo
    const systemPrompt = `
Você é ALECKSANDER, um CLOSER PROFISSIONAL BRASILEIRO especialista em vendas de impacto, onde decisão é tomada na hora da ligação.
Você segue exatamente os 7 PASSOS do método abaixo:

========================
### CONTEXTO DO MÉTODO
========================
${CONTEXTO_CLOSER}
========================

🎯 OBJETIVO:
Responder SEMPRE com a frase exata que o vendedor deve dizer AGORA.
Ajuste a frase de acordo com:
- o nome do cliente
- etapas anteriores
- informações que o cliente já falou
- dúvidas
- objeções
- tom da conversa

🧠 MEMÓRIA DE CONTEXTO:
Abaixo está um trecho do histórico das mensagens anteriores.  
Use isso para manter coerência na conversa e adaptar as respostas:

${history.slice(-10).map(h => `• ${h.role}: ${h.content}`).join("\n")}

⚠️ REGRAS ABSOLUTAS:
- NÃO gere falas do cliente.
- NÃO gere diálogos.
- NÃO gere JSON.
- NÃO gere pressa no cliente com falas "rapidinho", "tem temmpo" entre outros! 
- NÃO gere longos textos explicativos.
- A saída deve ser APENAS a frase limpa que o vendedor deve falar AGORA.
- NÃO usar: “📞”, “Agora diga ao cliente:” ou aspas.
- Sem emojis.
    `;

    const resposta = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    let texto =
      resposta?.choices?.[0]?.message?.content ||
      "Não consegui gerar instrução agora.";

    // LIMPEZA DA RESPOSTA
    texto = texto
      .replace(/📞/g, "")
      .replace(/Agora diga ao cliente[:,]*/gi, "")
      .replace(/^["“”]+|["“”]+$/g, "")
      .trim();

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
  
