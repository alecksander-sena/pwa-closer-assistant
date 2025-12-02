// src/AIChat.tsx
import { useState } from "react";
import type { IAResponse } from "./services/ia";
import { enviarMensagemComMeta, enviarSimulacaoCliente } from "./services/ia";

export default function AIChat() {
  const [messages, setMessages] = useState<{ author: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"closer" | "simular">("closer");

  function addMessage(author: string, text: string) {
    setMessages((p) => [...p, { author, text }]);
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    addMessage("👤 Você", userText);
    setLoading(true);

    try {
      let respostaIA: IAResponse;

      if (mode === "closer") {
        respostaIA = await enviarMensagemComMeta(userText);
      } else {
        respostaIA = await enviarSimulacaoCliente(userText);
      }

      addMessage("🤖 IA", respostaIA.text ?? "Sem resposta.");
    } catch (err) {
      console.error("AIChat error:", err);
      addMessage("⚠️ Erro", "Não foi possível conectar à IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2>Assistente IA</h2>

      <div style={styles.modeSwitch}>
        <button
          onClick={() => setMode("closer")}
          style={{
            ...styles.modeBtn,
            background: mode === "closer" ? "#2ecc71" : "#bdc3c7",
          }}
        >
          Modo Closer
        </button>
        <button
          onClick={() => setMode("simular")}
          style={{
            ...styles.modeBtn,
            background: mode === "simular" ? "#3498db" : "#bdc3c7",
          }}
        >
          Simular Cliente
        </button>
      </div>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={styles.message}>
            <strong>{m.author}: </strong>
            <span>{m.text}</span>
          </div>
        ))}

        {loading && <div style={styles.loading}>Digitando...</div>}
      </div>

      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} style={styles.sendBtn}>
          Enviar
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "600px", margin: "0 auto", padding: "20px" },
  chatBox: {
    height: "400px",
    overflowY: "auto",
    background: "#f4f4f4",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    border: "1px solid #ddd",
  },
  message: { marginBottom: "10px" },
  loading: { fontStyle: "italic", opacity: 0.7 },
  inputRow: { display: "flex", gap: "10px" },
  input: { flex: 1, padding: "10px", fontSize: 16, borderRadius: 8, border: "1px solid #ccc" },
  sendBtn: { padding: "10px 20px", background: "#27ae60", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  modeSwitch: { display: "flex", gap: "10px", marginBottom: 12 },
  modeBtn: { flex: 1, padding: 10, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
};
