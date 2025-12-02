// src/services/ia.ts

export type IAResponse = {
  text: string;
  step?: string;
  suggestion?: string;
  actions?: string[];
};

// -----------------------------
// Função principal que chama o servidor e retorna JSON estruturado
// -----------------------------
export async function callIA(
  message: string,
  mode: "closer" | "simular" = "closer"
): Promise<IAResponse> {
  const res = await fetch("http://localhost:3001/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error("API error: " + t);
  }

  const data = await res.json();

  // Normalizar para evitar erros no frontend
  return {
    text: data.text ?? "",
    step: data.step ?? "unknown",
    suggestion: data.suggestion ?? "",
    actions: data.actions ?? []
  };
}

// -----------------------------
// MODOS ESPECÍFICOS
// -----------------------------

// Modo Closer – retorna OBJETO COMPLETO
export async function enviarMensagemComMeta(texto: string) {
  return await callIA(texto, "closer");
}

// Modo Closer – retorna apenas o texto (retrocompatibilidade)
export async function enviarMensagem(texto: string) {
  const result = await callIA(texto, "closer");
  return result.text;
}

// Modo Simular Cliente – retorna apenas texto
export async function enviarSimulacaoCliente(texto: string) {
  const result = await callIA(texto, "simular");
  return result.text;
}
