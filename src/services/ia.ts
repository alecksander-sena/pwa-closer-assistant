// === Interface padrão única ===
export interface IAResposta {
  instruction: string;
}

// === Função segura ===
const safe = (txt: unknown): string => {
  if (typeof txt === "string" && txt.trim() !== "") return txt;
  return "Resposta indisponível.";
};

// === Envio da mensagem para a IA ===
export async function enviarMensagemIA(message: string): Promise<IAResposta> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch("/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error("Erro ao chamar IA:", res.status);
      return { instruction: "Erro ao gerar instrução da IA." };
    }

    const data = await res.json().catch(() => null);

    return {
      instruction: safe(data?.instruction)
    };

  } catch (err: any) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      return { instruction: "A IA demorou para responder." };
    }

    return { instruction: "Erro de conexão com o servidor." };
  }
}
