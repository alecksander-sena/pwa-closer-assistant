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
  const [statusMsg, setStatusMsg] = useState(""); // ⚠️ Mensagens rápidas: conectando, erro...

  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Salvar mensagens no chat
  function addMessage(author: string, text: string) {
    setMessages((prev) => [...prev, { author, text }]);

    if (leadId) {
      const role = author === "Você" ? "closer" : "system";
      saveMessage(leadId, role, text);
    }
  }

  // ⭐ EXIBIR STATUS (3 segundos)
  function showStatus(text: string) {
    setStatusMsg(text);
    setTimeout(() => setStatusMsg(""), 2500);
  }

  // ⭐ INICIAR LIGAÇÃO
  async function startCall() {
    if (!leadName.trim() || !leadPhone.trim()) {
      alert("Preencha nome e telefone!");
      return;
    }

    showStatus("📞 Conectando...");

    const id = await upsertLead(null, {
      name: leadName.trim(),
      phone: leadPhone.trim(),
      status: "em_atendimento",
    });

    setLeadId(id);
    setStarted(true);

    addMessage("Sistema", `📞 Ligação iniciada com ${leadName}.`);

    // ⭐ PRIMEIRO COMANDO PARA IA
    const prompt = `
Você é um assistente de vendas especialista em planos de saúde.
Você deve seguir os 7 passos de um roteiro profissional.

IMPORTANTE:
- Não simule cliente.
- Não gere diálogos.
- Apenas diga AO CLOSER o que ele deve falar.
- Foque no próximo passo da venda.
- Formato da resposta:

{
  "closer": { "text": "texto da instrução aqui" }
}

Primeiro passo: Apresentação.
`;

    setLoading(true);

    try {
      const resp = await enviarMensagemIA(prompt);
      const text = resp?.closer?.text || "Erro ao obter instrução.";

      addMessage("Closer", text);
    } catch (err) {
      console.error(err);
      addMessage("Erro", "Falha ao conectar à IA.");
    }

    setLoading(false);
    showStatus("Conectado ✔️");
  }

  // ⭐ ENVIAR MENSAGEM (continuação do passo)
  async function handleSend() {
    if (!input.trim() || loading || !leadId) return;

    const content = input.trim();
    setInput("");

    addMessage("Você", content);

    setLoading(true);

    try {
      const prompt = `
O closer disse: "${content}"

Com base nisso, continue APENAS com o próximo passo dos 7 passos da venda.

IMPORTANTE:
- Não simule cliente
- Não escreva JSON gigante
- Apenas instrução do próximo passo

Formato:
{
  "closer": { "text": "instrução aqui" }
}
`;

      const resp = await enviarMensagemIA(prompt);
      const text = resp?.closer?.text || "Erro ao gerar próxima instrução.";

      addMessage("Closer", text);
    } catch (e) {
      console.error(e);
      addMessage("Erro", "Falha ao conectar à IA.");
    }

    setLoading(false);
  }

  // ---------------------
  // UI
  // ---------------------

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ⚠️ STATUS TEMPORÁRIO */}
        {statusMsg && <div style={styles.status}>{statusMsg}</div>}

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

            <button style={styles.startBtn} onClick={startCall}>
              ▶️ Iniciar Ligação
            </button>
          </div>
        )}

        {/* CHAT */}
        {started && (
          <>
            <div style={styles.header}>
              <div style={styles.leadName}>{leadName}</div>
              <div style={styles.leadPhone}>{leadPhone}</div>
            </div>

            <div style={styles.chatBox}>
              {messages.map((m, i) => (
                <div key={i} style={styles.msgItem}>
                  <div style={styles.msgAuthor}>{m.author}</div>
                  <div style={styles.msgBubble}>{m.text}</div>
                </div>
              ))}

              {loading && (
                <div style={styles.typing}>Digitando…</div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT DO CHAT */}
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

// ------------------------
// ESTILOS
// ------------------------

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
    padding: 18,
    border: "1px solid rgba(255,255,255,0.06)",
  },

  status: {
    background: "#1d7bff",
    padding: 10,
    borderRadius: 8,
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
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
    border: "1px solid rgba(255,255,255,0.1)",
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
    color: "#aaa",
    fontSize: 14,
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
  },

  msgBubble: {
    padding: 12,
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    fontSize: 16,
    lineHeight: 1.45,
    color: "#e8f1ff",
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
    background: "#0d1117",
    color: "#fff",
    fontSize: 15,
    resize: "vertical",
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
    
