// src/services/ia.ts

export async function enviarMensagem(texto: string) {
  const res = await fetch("http://localhost:3001/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: texto,
      system: "Você é um assistente especialista em vendas."
    })
  });

  const data = await res.json();
  return data.text;
}

export async function enviarSimulacaoCliente(texto: string) {
  const res = await fetch("http://localhost:3001/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: texto,
      system: "Você é um cliente sendo simulado."
    })
  });

  const data = await res.json();
  return data.text;
}
