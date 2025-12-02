import { useState } from "react";
import { enviarMensagem, enviarSimulacaoCliente } from "./services/ia";

// Tipagem da resposta da IA
type IAResponse =
  | string
  | {
      text: string;
      step?: string;
      suggestion?: string;
      actions?: string[];
    };

export default function AIChat() {
  const [messages, setMessages] = useState<
    { author: string; text: string }[]
  >([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"closer" | "simular">("closer");

  // Adiciona mensagens ao chat
  function addMessage(author: string, text: string) {
    setMessages((prev) => [...prev, { author, text }]);
  }

  // Envia mensagem para IA
  async function handleSend() {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");

    addMessage("👤 Você", userText);
    setLoading(true);

    try {
      let respostaIA: IAResponse;

      if (mode === "closer") {
        respostaIA = await enviarMensagem(userText);
      } else {
        respostaIA = await enviarSimulacaoCliente(userText);
      }

      // A resposta pode vir string ou objeto
      const textoIA =
        typeof respostaIA === "string"
          ? respostaIA
          : respostaIA?.text ?? "Sem resposta.";

      addMessage("🤖 IA", textoIA);
    } catch (error) {
      addMessage("⚠️ Erro", "Não foi possível conectar à IA.");
    }

    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <h2>Assistente IA</h2>

      {/* Seletor de modo */}
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

      {/* Área de mensagens */}
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={styles.message}>
            <strong>{m.author}: </strong> {m.text}
          </div>
        ))}

        {loading && (
          <div style={styles.loading}>
            Digitando...
          </div>
        )}
      </div>

      {/* Input */}
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

// ---------------------
// Estilos inline
// ---------------------
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  chatBox: {
    height: "400px",
    overflowY: "auto",
    background: "#f4f4f4",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    border: "1px solid #ddd",
  },
  message: {
    marginBottom: "10px",
  },
  loading: {
    fontStyle: "italic",
    opacity: 0.7,
  },
  inputRow: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  sendBtn: {
    padding: "10px 20px",
    background: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  modeSwitch: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
  },
  modeBtn: {
    flex: 1,
    padding: "10px",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
