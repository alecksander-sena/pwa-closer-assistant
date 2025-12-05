// src/AIChat.tsx
import { useState, useRef, useEffect } from "react";
import { enviarMensagemIA } from "./services/ia";
import { upsertLead, saveMessage } from "./services/firebaseService";

export default function AIChat() {
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);

  const [messages, setMessages] = useState<
    { author: string; text: string }[]
  >([]);

  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [connecting, setConnecting] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMessage(author: string, text: string) {
    setMessages((prev) => [...prev, { author, text }]);

    if (leadId) {
      const role =
        author === "Você"
          ? "closer"
          : author === "Cliente"
          ? "client"
          : author === "Erro"
          ? "system"
          : "system";

      saveMessage(leadId, role, text);
    }
  }

  // -------------------------------------------------------
  // 🚀 Função que inicia a ligação com feedback visual
  // -------------------------------------------------------
  async function startCall() {
    if (!leadName.trim() || !leadPhone.trim()) {
      alert("Preencha nome e telefone!");
      return;
    }

    try {
      setConnecting(true);
      addMessage("Sistema", "🔄 Iniciando ligação...");

      // Salva no Firestore
      const id = await upsertLead(null, {
        name: leadName.trim(),
        phone: leadPhone.trim(),
        status: "em_atendimento",
      });

      setLeadId(id);

      // Aguarda 2s para dar sensação de "conectando"
      setTimeout(() => {
        setStarted(true);
        addMessage("Sistema", `📞 Ligação iniciada com ${leadName}.`);
      }, 1500);

      // ENVIO DO CONTEXTO INICIAL PARA IA
      const promptInicial = `
O cliente chama-se ${leadName}, telefone ${leadPhone}.
Simule a fala inicial de um cliente ao atender o telefone.
Depois gere também a fala do closer seguindo os 7 passos.

Formato obrigatório:
{
  "client": { "text": "" },
  "closer": { "text": "" }
}
`;

      const resp = await enviarMensagemIA(promptInicial);

      if (resp?.client?.text) addMessage("Cliente", resp.client.text);
      if (resp?.closer?.text) addMessage("Closer", resp.closer.text);

    } catch (err) {
      console.error(err);
      addMessage("Erro", "❌ Não foi possível iniciar a ligação.");
    } finally {
      setConnecting(false);
    }
  }

  // -------------------------------------------------------
  // ✉️ Envio de mensagens durante a ligação
  // -------------------------------------------------------
  async function handleSend() {
    if (!input.trim() || loading || !leadId) return;

    const content = input.trim();
    setInput("");

    addMessage("Você", content);
    setLoading(true);

    try {
      const resp = await enviarMensagemIA(content);

      const clientText = resp?.client?.text;
      const closerText = resp?.closer?.text;

      if (clientText) addMessage("Cliente", clientText);
      if (closerText) addMessage("Closer", closerText);
    } catch (e) {
      console.error(e);
      addMessage("Erro", "⚠️ Falha ao conectar à IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* CARD DO LEAD */}
        {!started && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Dados do Lead</h3>

            <input
              style={styles.input}
              placeholder="📝 Nome do Lead"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="📱 Telefone"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
            />

            <button
              style={styles.startBtn}
              onClick={startCall}
              disabled={connecting}
            >
              {connecting ? "🔄 Conectando..." : "▶️ Iniciar Ligação"}
            </button>
          </div>
        )}

        {/* CHAT */}
        {started && (
          <>
            <div style={styles.header}>
              <div>
                <div style={styles.leadName}>{leadName}</div>
                <div style={styles.leadPhone}>{leadPhone}</div>
              </div>
            </div>

            <div style={styles.chatBox}>
              {messages.map((m, i) => (
                <div key={i} style={styles.msgItem}>
                  <div style={styles.msgAuthor}>{m.author}</div>
                  <div style={styles.msgBubble}>{m.text}</div>
                </div>
              ))}

              {loading && <div style={styles.typing}>Digitando…</div>}

              <div ref={bottomRef} />
            </div>

            <div style={styles.inputRow}>
              <textarea
                style={styles.textarea}
                placeholder="Digite o que você diria…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <button
                style={styles.sendBtn}
                onClick={handleSend}
                disabled={loading}
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

//
// ESTILOS
//

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f1115",
    padding: 20,
    display: "flex",
    justifyContent: "center",
  },

  container: {
    width: "100%",
    maxWidth: 900,
    background: "#111418",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: 18,
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  },

  card: {
    background: "#14171d",
    padding: 18,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.05)",
    marginBottom: 12,
  },

  cardTitle: {
    color: "#9ecbff",
    marginBottom: 12,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#0d1117",
    color: "#e8f1ff",
    fontSize: 16,
  },

  startBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    background: "linear-gradient(180deg, #1fa2ff, #1476d3)",
    color: "white",
    fontSize: 17,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },

  header: {
    paddingBottom: 10,
    marginBottom: 6,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  leadName: {
    color: "#7fb4ff",
    fontSize: 20,
    fontWeight: 700,
  },

  leadPhone: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },

  chatBox: {
    maxHeight: 520,
    overflowY: "auto",
    padding: 12,
    background: "#0d1117",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.04)",
  },

  msgItem: {
    marginBottom: 18,
  },

  msgAuthor: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 6,
  },

  msgBubble: {
    padding: 12,
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.05)",
    color: "#e8f1ff",
    fontSize: 16,
    lineHeight: 1.45,
  },

  typing: {
    fontStyle: "italic",
    opacity: 0.6,
    marginBottom: 8,
  },

  inputRow: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  textarea: {
    flex: 1,
    minHeight: 60,
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "#0d1117",
    color: "#fff",
    resize: "vertical",
    fontSize: 15,
  },

  sendBtn: {
    minWidth: 110,
    padding: 12,
    borderRadius: 10,
    background: "linear-gradient(180deg,#1f8ef1,#165db6)",
    color: "#fff",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },
};
    
