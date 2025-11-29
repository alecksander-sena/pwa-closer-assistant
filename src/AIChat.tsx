// src/AIChat.tsx
import { useEffect, useRef, useState } from "react";
import { enviarMensagem, enviarSimulacaoCliente } from "./services/ia";

type Msg = { id: string; author: "user" | "ia"; text: string; time: string };

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem("chat_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"simular" | "closer">("simular");
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function pushMessage(author: Msg["author"], text: string) {
    const m: Msg = {
      id: String(Date.now()) + Math.random(),
      author,
      text,
      time: new Date().toISOString()
    };
    setMessages((s) => [...s, m]);
    return m;
  }

  async function sendMessageText(text: string) {
    if (!text.trim()) return;
    pushMessage("user", text);
    setInput("");
    setLoading(true);

    try {
      const resposta =
        mode === "simular"
          ? await enviarSimulacaoCliente(text)
          : await enviarMensagem(text);

      pushMessage("ia", resposta);
    } catch (err) {
      pushMessage("ia", "Erro ao conectar com a IA.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageText(input);
    }
  }

  function clearHistory() {
    setMessages([]);
    localStorage.removeItem("chat_history");
  }

  function downloadHistory() {
    const blob = new Blob([JSON.stringify(messages, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold flex-1">Assistente IA — Teste</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setMode("simular")}
            className={`px-3 py-1 rounded ${mode === "simular" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Simular Cliente
          </button>
          <button
            onClick={() => setMode("closer")}
            className={`px-3 py-1 rounded ${mode === "closer" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Modo Closer
          </button>
        </div>
      </div>

      <div ref={boxRef} className="h-[60vh] overflow-y-auto p-4 bg-white border rounded">
        {messages.length === 0 && <div className="text-gray-400">Nenhuma mensagem — comece digitando.</div>}
        {messages.map((m) => (
          <div key={m.id} className={`mb-3 flex ${m.author === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`p-3 rounded-lg max-w-[75%] ${
                m.author === "user" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(m.time).toLocaleString()}</div>
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500">IA respondendo...</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessageText(input);
        }}
        className="mt-4 flex gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Digite sua fala... (Enter envia, Shift+Enter nova linha)"
          className="flex-1 border p-2 rounded resize-none"
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Enviar
        </button>
      </form>

      <div className="mt-3 flex gap-2">
        <button onClick={clearHistory} className="px-3 py-1 bg-gray-200 rounded">
          Limpar histórico
        </button>
        <button onClick={downloadHistory} className="px-3 py-1 bg-gray-200 rounded">
          Exportar (JSON)
        </button>
      </div>
    </div>
  );
}
