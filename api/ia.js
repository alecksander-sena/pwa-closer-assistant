// /api/ia.js
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

    // Variáveis CERTAS da Vercel
    const API_KEY = process.env.HF_API_KEY;
    const MODEL = process.env.HF_MODEL;

    if (!API_KEY) {
      console.error("❌ ERRO: HF_API_KEY não configurada.");
      return res.status(500).json({
        instruction: "Erro: HF_API_KEY não configurada."
      });
    }

    if (!MODEL) {
      console.error("❌ ERRO: HF_MODEL não configurado.");
      return res.status(500).json({
        instruction: "Erro: HF_MODEL não configurado."
      });
    }

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

🧠 CONTEXTO RECENTE
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
`.trim();

    // CHAMADA À HUGGING FACE
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          parameters: {
            max_new_tokens: 200,
            temperature: 0.3
          }
        })
      }
    );

    const data = await response.json();

    let texto =
      data?.generated_text ??
      data?.[0]?.generated_text ??
      "Não consegui gerar instrução agora.";

    texto = texto
      .replace(/^["“”]+|["“”]+$/g, "")
      .replace(/\n+/g, " ")
      .trim();

    return res.status(200).json({
      instruction: texto
    });

  } catch (err) {
    console.error("❌ ERRO NO /api/ia:", err);
    return res.status(500).json({
      instruction: "❌ Erro interno ao processar instrução."
    });
  }
}
