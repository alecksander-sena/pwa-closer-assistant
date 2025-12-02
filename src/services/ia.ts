// src/services/ia.ts
export type IAResponse = {
  text: string;
  step?: string;
  suggestion?: string;
  actions?: string[];
};

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";

async function fetchJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    // tenta parsear JSON da resposta de erro, senão lança o texto cru
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.error || JSON.stringify(parsed));
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    // se não for JSON, retornar a string pura
    return text;
  }
}

export async function callIA(
  message: string,
  mode: "closer" | "simular" = "closer"
): Promise<IAResponse> {
  const url = `${API_URL}/api/ia`;

  const data = await fetchJson(url, { message, mode });

  // Normalização:
  if (typeof data === "string") {
    return {
      text: data,
      step: "unknown",
      suggestion: "",
      actions: [],
    };
  }

  return {
    text: (data && data.text) ?? "",
    step: (data && data.step) ?? "unknown",
    suggestion: (data && data.suggestion) ?? "",
    actions: Array.isArray(data?.actions) ? data.actions : [],
  };
}

// Exportações públicas (consistentes)
export async function enviarMensagem(texto: string): Promise<IAResponse> {
  return callIA(texto, "closer");
}

export async function enviarMensagemComMeta(texto: string): Promise<IAResponse> {
  return callIA(texto, "closer");
}

export async function enviarSimulacaoCliente(texto: string): Promise<IAResponse> {
  return callIA(texto, "simular");
}

export async function enviarMensagemTexto(texto: string): Promise<string> {
  const r = await callIA(texto, "closer");
  return r.text;
}
