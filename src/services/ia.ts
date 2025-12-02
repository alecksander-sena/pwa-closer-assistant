export async function enviarMensagemIA(message: string) {
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
}
