// src/services/ia.ts
export type IAResponse = {
  text: string;
  step?: string;
  suggestion?: string;
  actions?: string[];
};

export async function callIA(message: string, mode: "closer" | "simular" = "closer"): Promise<IAResponse> {
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
  // normalize
  return {
    text: data.text ?? String(data),
    step: data.step ?? "unknown",
    suggestion: data.suggestion ?? "",
    actions: data.actions ?? []
  };
}

// wrappers for compatibility
export async function enviarMensagem(texto: string) {
  return (await callIA(texto, "closer")).text;
}
export async function enviarSimulacaoCliente(texto: string) {
  return (await callIA(texto, "simular")).text;
}
export async function enviarMensagemComMeta(texto: string) {
  return await callIA(texto, "closer"); // returns full object
}
