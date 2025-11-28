// src/App.tsx
import { useState } from "react";
import { enviarMensagemIA } from "./services/ia";

function App() {
  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState("");

  async function handleEnviar() {
    if (!mensagem.trim()) return;
    setResposta("Carregando...");

    try {
      const respostaIA = await enviarMensagemIA(mensagem);
      setResposta(respostaIA);
    } catch (error) {
      console.error(error);
      setResposta("Erro ao conectar com a IA.");
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assistente IA – Simulação de Cliente</h1>

      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Digite o que você falaria na ligação..."
        rows={4}
        className="w-full p-3 border rounded"
      />

      <button
        onClick={handleEnviar}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Enviar
      </button>

      <h3 className="mt-6 font-semibold">Resposta do Cliente:</h3>
      <div className="p-4 bg-gray-50 rounded mt-2 min-h-[120px] whitespace-pre-wrap">
        {resposta}
      </div>
    </div>
  );
}

export default App;
