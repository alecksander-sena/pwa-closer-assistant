// src/services/ia.ts
import { contextoVendas } from "../data/contexto";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function getApiKey() {
  return import.meta.env.VITE_GROQ_API_KEY;
}

/**
 * Simulador de CLIENTE humano (usa system prompt estilo conversa que você mandou)
 */
export async function enviarMensagemIA(mensagem: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("VITE_GROQ_API_KEY não encontrada em env.");

  const systemPrompt = `
Você é um cliente brasileiro comum conversando com um closer por ligação.

Seu papel:
- Responder como uma pessoa comum e desconhecida.
- Falar com naturalidade: risadas, pausas, gírias leves e reações humanas.
- Mostrar emoção, insegurança, curiosidade e dúvidas reais.
- Não parecer especialista, não dar aula e não citar preços ou informações exatas sobre escolas.
- Apenas responder como o CLIENTE.
- Sempre seguir o fluxo iniciado pelo closer.
- Não finalize a conversa sozinho; sempre deixe espaço para continuidade.

Estilo: respostas curtas e naturais, ex: "Hahaha sério?", "Uhum, entendi", "Meu inglês tá meio parado kkk", etc.
  `;

  const body = {
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: mensagem }
    ],
    temperature: 0.8,
    max_tokens: 300
  };

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "Erro ao gerar resposta da IA.";
}

/**
 * Assistente CLOSER que segue os 7 passos usando o contextoVendas (para uso em fluxo real)
 */
export async function enviarParaIA(mensagemDoCliente: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("VITE_GROQ_API_KEY não encontrada em env.");

  const promptSystem = `
Você é um closer profissional altamente treinado.
Sua missão é seguir rigorosamente os 7 passos da venda (Wise Up) presentes no contexto abaixo.
Seja humano, consultivo e avance passo a passo. Não invente preços sem instrução.
Contexto: 
${contextoVendas}
  `;

  const body = {
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: promptSystem },
      { role: "user", content: mensagemDoCliente }
    ],
    temperature: 0.4,
    max_tokens: 350
  };

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "❌ Erro ao conectar com a IA.";
}
