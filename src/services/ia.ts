// src/services/ia.ts
export type IAResponse = {
  text: string;
  step?: string;
  suggestion?: string;
  actions?: string[];
};

export type DualResponse = {
  closer: IAResponse;
  client: IAResponse;
};

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await res.text();

  if (!res.ok) {
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
    return text;
  }
}

export async function callIAForDual(message: string): Promise<DualResponse> {
  const url = `${API_URL}/api/ia`;
  const data = await postJSON(url, { message });

  // Normalizar
  return {
    closer: {
      text: (data?.closer?.text ?? String(data?.closer ?? "")) as string
    },
    client: {
      text: (data?.client?.text ?? String(data?.client ?? "")) as string
    }
  };
}
