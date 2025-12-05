// === Resposta da IA corrigida: sempre retorna SOMENTE o texto do CLOSER ===
export interface IAResposta {
  text: string;   // apenas UMA resposta
}

/**
 * Garante que nunca quebre o app caso venha algo inesperado
 */
const safe = (txt: unknown): string => {
  if (typeof txt === "string" && txt.trim() !== "") return txt;
  return "Resposta indisponível.";
};

/**
 * Envia uma mensagem ao backend /api/ia
 * e retorna apenas uma instrução para o closer
 */
export async function enviarMensagemIA(message: string): Promise<IAResposta> {
  // timeout de 12s
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
      return { text: "⚠️ Erro ao gerar instrução da IA." };
    }

    const data = await res.json().catch(() => {
      console.error("Erro ao interpretar JSON");
      return null;
    });

    // === AQUI ESTÁ A CORREÇÃO PRINCIPAL ===
    // A IA agora retorna APENAS UMA MENSAGEM
    return {
      text: safe(data?.instruction || data?.closer?.text)
    };

  } catch (err: any) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      console.error("Timeout da IA.");
      return { text: "⏳ A IA demorou para responder." };
    }

    console.error("Falha de conexão:", err);
    return { text: "❌ Erro de conexão com o servidor." };
  }
}
