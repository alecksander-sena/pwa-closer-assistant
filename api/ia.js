// api/ia.js
import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Campo 'message' é obrigatório." });
    }

    const API_KEY = process.env.GROQ_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY não configurada." });
    }

    const client = new Groq({ apiKey: API_KEY });

    // ----------------------------------------
    // System prompts — ajustáveis
    // ----------------------------------------
    const systemCloser = `Você é um especialista CLOSER. Seu objetivo: guiar o vendedor passo a passo exatamente pelo processo de venda (7 passos: Apresentação; Conexão; Decisão Imediata; Speech; Fechamento; Referidos e Validação).
    - Não perguntar nem mensionar algo sobre tempo ou duração da ligação.
    - Não se apresente, nem apresente a empresa.
    - Não faça perguntas fechadas ao cliente.
    - Responda com instruções curtas e objetivas para o vendedor dizer ao cliente.
    - Sempre siga a estrutura "Passo X - [descrição curta]".
    - Se for uma fala direta ao cliente, comece com: Diga ao cliente: "..."
    - Em caso de objeção, use: Objeção — diga: "..."
    - Respostas curtas (1 a 5 frases), práticas para ligação.`;
    const systemClient = `Você é um CLIENTE simulado. Responda como uma pessoa real (curto, direto, com dúvidas ou objeções naturais). 
    Às vezes interessado, às vezes desconfiado, às vezes apressado. Siga a coerência da fala do vendedor.`;


    const [closerReply, clientReply] = await Promise.all([
      client.chat.completions.create({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemCloser },
          { role: "user", content: message }
        ],
        temperature: 0.25,
        max_tokens: 200
      }),
      client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemClient },
          { role: "user", content: message }
        ],
        temperature: 0.85,
        max_tokens: 150
      })
    ]);

    return res.status(200).json({
      closer: closerReply.choices?.[0]?.message?.content?.trim(),
      client: clientReply.choices?.[0]?.message?.content?.trim()
    });

  } catch (err) {
    console.error("Erro API IA:", err);
    return res.status(500).json({ error: "Erro interno da IA" });
  }
}
