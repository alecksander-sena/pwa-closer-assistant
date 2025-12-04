export default async function enviarMensagemIA(message: string) {
  const response = await fetch("/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar mensagem para IA");
  }

  return await response.json();
}
