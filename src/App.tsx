// src/App.tsx
import { useState } from "react";
import { enviarMensagemComMeta, enviarMensagem } from "./services/ia";
import type { IAResponse } from "./services/ia";

function App() {
  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState<IAResponse | string>("");
  const [modo, setModo] = useState<"simular" | "closer">("simular");

  async function handleEnviar() {
    if (!mensagem.trim()) return;

    setResposta("Carregando...");

    try {
      let respostaIA: IAResponse | string;

      if (modo === "simular") {
        // retorna SOMENTE texto
        respostaIA = await enviarMensagem(mensagem);
      } else {
        // retorna OBJETO IAResponse
        respostaIA = await enviarMensagemComMeta(mensagem);
      }

      setResposta(respostaIA);
    } catch (error) {
      console.error(error);
      setResposta("Erro ao conectar com a IA.");
    }
  }

  // Se for objeto, extrair o text
  const textoFinal =
    typeof resposta === "string" ? resposta : resposta.text ?? "Sem resposta.";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assistente IA</h1>

      {/* Seletor de modo */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded text-white ${
            modo === "simular" ? "bg-blue-600" : "bg-gray-400"
          }`}
          onClick={() => setModo("simular")}
        >
          Simular Cliente
        </button>

        <button
          className={`px-4 py-2 rounded text-white ${
            modo === "closer" ? "bg-green-600" : "bg-gray-400"
          }`}
          onClick={() => setModo("closer")}
        >
          Modo Closer
        </button>
      </div>

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

      <h3 className="mt-6 font-semibold">Resposta da IA:</h3>
      <div className="p-4 bg-gray-50 rounded mt-2 min-h-[120px] whitespace-pre-wrap">
        {textoFinal}
      </div>
    </div>
  );
}

export default App;
