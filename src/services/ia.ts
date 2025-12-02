export async function enviarMensagemIA(message: string) {
  try {
    const res = await fetch("/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      console.error("Erro ao chamar IA:", await res.text());
      return { closer: "Erro", client: "Erro" };
    }

    return res.json();
  } catch (err) {
    console.error("Falha de conexão:", err);
    return { closer: "Erro de conexão", client: "Erro de conexão" };
  }
}
