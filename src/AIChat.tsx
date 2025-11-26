import { useState } from "react";
import { askAI } from "./lib/ai";

export default function AIChat() {
  const [input, setInput] = useState("");
  const [resposta, setResposta] = useState("");

  async function enviar() {
    const r = await askAI(input);
    setResposta(r);
  }

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Assistant IA</h1>

      <textarea
        className="w-full border p-2 rounded"
        rows={3}
        placeholder="Digite algo para a IA..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={enviar}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Enviar
      </button>

      {resposta && (
        <div className="p-3 border rounded bg-gray-100">
          <strong>Resposta da IA:</strong>
          <p>{resposta}</p>
        </div>
      )}
    </div>
  );
}
