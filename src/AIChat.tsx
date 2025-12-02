// src/AIChat.tsx
import { useState, useRef, useEffect } from "react";
import { callIAForDual } from "./services/ia";

export default function AIChat() {
  const [messages, setMessages] = useState<
    { author: string; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  function addMessage(author: string, text: string) {
    setMessages((prev) => [...prev, { author, text }]);
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || loading) return;

    setInput("");
    addMessage("Você", content);
    setLoading(true);

    try {
      const dual = await callIAForDual(content);
      // Adiciona as duas respostas no histórico: cliente e depois closer (ou vice-versa)
      addMessage("Cliente (simulado)", dual.client.text);
      addMessage("Closer (o que dizer)", dual.closer.text);
    } catch (err) {
      console.error("Erro ao chamar IA:", err);
      addMessage("Erro", "Não foi possível conectar à IA.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Assistente Closer</h2>

        <div style={styles.chatBox}>
          {messages.map((m, i) => (
            <div key={i} style={styles.message}>
              <div style={styles.author}>{m.author}</div>
              <div style={styles.text}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={styles.typing}>Digitando...</div>}
          <div ref={bottomRef} />
        </div>

        <div style={styles.inputRow}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite o que você diria na ligação..."
            style={styles.textarea}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button onClick={handleSend} style={styles.sendBtn} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f1115",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    color: "#e6eef8",
  },
  container: {
    width: "100%",
    maxWidth: 900,
    borderRadius: 12,
    padding: 20,
    background: "linear-gradient(180deg, #0b0c0f 0%, #121416 100%)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
  },
  title: { margin: 0, marginBottom: 14, color: "#cfe8ff" },
  chatBox: {
    maxHeight: 520,
    overflowY: "auto",
    padding: 12,
    borderRadius: 8,
    background: "#0b0d11",
    border: "1px solid rgba(255,255,255,0.03)",
    marginBottom: 12,
  },
  message: { marginBottom: 12 },
  author: { fontWeight: "700", color: "#a7d1ff", marginBottom: 6 },
  text: {
    background: "rgba(255,255,255,0.03)",
    padding: 12,
    borderRadius: 8,
    lineHeight: 1.45,
    color: "#e6eef8",
  },
  typing: { fontStyle: "italic", opacity: 0.7, marginTop: 6, color: "#9fbff8" },
  inputRow: { display: "flex", gap: 10, marginTop: 8 },
  textarea: {
    flex: 1,
    minHeight: 72,
    padding: 12,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.04)",
    background: "#091014",
    color: "#e6eef8",
    resize: "vertical",
    fontSize: 15,
  },
  sendBtn: {
    minWidth: 110,
    background: "linear-gradient(180deg,#1f8ef1,#165db6)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    padding: "12px 14px",
    fontWeight: 700,
  },
};
