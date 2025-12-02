// src/App.tsx
import { useState } from "react";
import type { IAResponse } from "./services/ia";
import { enviarMensagemComMeta, enviarSimulacaoCliente } from "./services/ia";

function App() {
  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState<IAResponse | null>(null);
  const [modo, setModo] = useState<"simular" | "closer">("simular");
  const [loading, setLoading] = useState(false);

  async function handleEnviar() {
    if (!mensagem.trim()) return;
    setLoading(true);
    setResposta(null);

    try {
      let r: IAResponse;
      if (modo === "simular") {
        r = await enviarSimulacaoCliente(mensagem);
      } else {
        r = await enviarMensagemComMeta(mensagem);
      }
      setResposta(r);
    } catch (err) {
      console.error("App handleEnviar error:", err);
      setResposta({ text: "Erro ao conectar com a IA.", step: "error", suggestion: "" });
    } finally {
      setLoading(false);
    }
  }

  const textoFinal = resposta ? resposta.text : loading ? "Carregando..." : "";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assistente IA – Simulação</h1>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setModo("simular")} className={modo === "simular" ? "bg-blue-600 text-white px-4 py-2 rounded" : "bg-gray-200 px-4 py-2 rounded"}>Simular Cliente</button>
        <button onClick={() => setModo("closer")} className={modo === "closer" ? "bg-green-600 text-white px-4 py-2 rounded" : "bg-gray-200 px-4 py-2 rounded"}>Modo Closer</button>
      </div>

      <textarea
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Digite o que você falaria na ligação..."
        rows={4}
        className="w-full p-3 border rounded"
      />

      <button onClick={handleEnviar} disabled={loading} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? "Carregando..." : "Enviar"}
      </button>

      <h3 className="mt-6 font-semibold">Resposta da IA:</h3>
      <div className="p-4 bg-gray-50 rounded mt-2 min-h-[120px] whitespace-pre-wrap">
        {textoFinal}
      </div>
    </div>
  );
}

export default App;
