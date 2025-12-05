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

    // ============================
    // SYSTEM PROMPT PADRONIZADO
    // ============================
    const systemPrompt = `
Você é ALECKSANDER, um CLOSER PROFISSIONAL BRASILEIRO especialista em vendas de impacto,
onde a decisão é tomada durante a ligação.

Você SEMPRE segue exatamente os 7 PASSOS do método abaixo:

========================
### MÉTODO DO CLOSER
========================
${CONTEXTO_CLOSER}
========================

🎯 OBJETIVO
Responder SOMENTE com a frase exata que o vendedor deve falar AGORA,
de forma direta, objetiva, natural e alinhada ao ponto da conversa.

Adapte a frase conforme:
- nome da pessoa
- etapa atual dos 7 passos
- o que o cliente já falou
- objeções
- dúvidas
- intenção
- alinhamento emocional
- fluidez natural da ligação

🧠 CONTEXTO RECENTE
Aqui está o trecho final do histórico para manter coerência:

${history
  .slice(-10)
  .map(h => `• ${h.role.toUpperCase()}: ${h.content}`)
  .join("\n")}

⚠️ REGRAS ABSOLUTAS
- NÃO criar falas do cliente.
- NÃO criar diálogos.
- NÃO usar emojis.
- NÃO usar aspas.
- NÃO escrever explicações.
- NÃO escrever instruções do tipo “Diga ao cliente”.
- NÃO usar marcações como 📞.
- Responda APENAS com a frase limpa do vendedor.
`.trim();

    // ============================
    // CHAMADA AO MODELO
    // ============================
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
      resposta?.choices?.[0]?.message?.content?.trim() ??
      "Não consegui gerar instrução agora.";

    // ============================
    // LIMPEZA FINAL
    // ============================
    texto = texto
      .replace(/📞/gi, "")
      .replace(/Agora diga ao cliente[:,]?/gi, "")
      .replace(/^["“”]+|["“”]+$/g, "") // remove aspas
      .replace(/\n+/g, " ") // evita texto quebrado
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
