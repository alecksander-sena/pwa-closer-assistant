// src/services/ia.ts

// Tipagem pública da resposta da IA
export type IAResponse = {
  text: string;
  step?: string;
  suggestion?: string;
  actions?: string[];
};

// -----------------------------
// Função principal que chama o servidor e retorna um objeto normalizado IAResponse
// -----------------------------
export async function callIA(
  message: string,
  mode: "closer" | "simular" = "closer"
): Promise<IAResponse> {
  const res = await fetch("http://localhost:3001/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error("API error: " + t);
  }

  const data = await res.json();

  // Se a API por algum motivo retornar só uma string (retrocompatibilidade),
  // normalizamos para o formato IAResponse.
  if (typeof data === "string") {
    return {
      text: data,
      step: "unknown",
      suggestion: "",
      actions: [],
    };
  }

  // Se vier um objeto, normalizamos campos ausentes.
  return {
    text: (data && data.text) ?? "",
    step: (data && data.step) ?? "unknown",
    suggestion: (data && data.suggestion) ?? "",
    actions: (data && Array.isArray(data.actions) ? data.actions : []),
  };
}

// -----------------------------
// Exportações para uso no frontend
// -----------------------------

// Retorna o objeto completo (com metadata) — recomendado para o modo "closer".
export async function enviarMensagemComMeta(
  texto: string
): Promise<IAResponse> {
  return await callIA(texto, "closer");
}

// Retorna o objeto completo também — mantém consistência (antes isso retornava só string).
// No frontend você pode usar .text, .step, .suggestion, .actions diretamente.
export async function enviarMensagem(texto: string): Promise<IAResponse> {
  return await callIA(texto, "closer");
}

// Para simular o cliente: também retorna o objeto completo com text (diálogo) e possíveis metadados.
export async function enviarSimulacaoCliente(
  texto: string
): Promise<IAResponse> {
  return await callIA(texto, "simular");
}

// Utilitário opcional: se em algum lugar você realmente precisar só do texto (string),
// pode usar essa função. Mas prefira usar o objeto para tipagem consistente.
export async function enviarMensagemTexto(texto: string): Promise<string> {
  const r = await callIA(texto, "closer");
  return r.text;
}
