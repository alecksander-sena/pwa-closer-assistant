// Tipagem das respostas da IA
export interface IAResposta {
  closer: { text: string };
  client: { text: string };
}

/**
 * Função segura para garantir que sempre retorne texto válido
 */
const safe = (txt: unknown): string => {
  if (typeof txt === "string" && txt.trim() !== "") return txt;
  return "Resposta indisponível.";
};

/**
 * Envia uma mensagem ao backend /api/ia
 * com timeout, validação e fallback automático.
 */
export async function enviarMensagemIA(message: string): Promise<IAResposta> {
  // Timeout de 12 segundos
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
      const errText = await res.text();
      console.error("Erro ao chamar IA:", res.status, errText);

      return {
        closer: { text: "Erro ao gerar resposta do closer." },
        client: { text: "Erro ao gerar resposta do cliente." }
      };
    }

    const data = await res.json().catch(() => {
      console.error("Erro ao interpretar JSON da IA");
      return null;
    });

    return {
      closer: {
        text: safe(data?.closer?.text)
      },
      client: {
        text: safe(data?.client?.text)
      }
    };

  } catch (err: any) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      console.error("Timeout: Servidor demorou demais.");
      return {
        closer: { text: "O servidor demorou para responder." },
        client: { text: "O servidor demorou para responder." }
      };
    }

    console.error("Falha de conexão:", err);

    return {
      closer: { text: "Erro de conexão com o servidor." },
      client: { text: "Erro de conexão com o servidor." }
    };
  }
}
