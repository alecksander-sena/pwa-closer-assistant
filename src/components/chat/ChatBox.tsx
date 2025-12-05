// src/components/chat/ChatBox.tsx
import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { enviarMensagemIA } from "../../services/ia";

type MsgAuthor = "user" | "closer" | "system";
type Msg = { author: MsgAuthor; text: string };

export default function ChatBox() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      author: "system",
      text: "Assistente pronto. Digite o que o cliente disse ou sua fala atual."
    }
  ]);

  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  function pushMessage(m: Msg) {
    setMessages((prev) => [...prev, m]);
  }

  async function handleSend(msg: string) {
    const trimmed = msg.trim();
    if (!trimmed) return;

    // mensagem do usuário
    pushMessage({ author: "user", text: trimmed });

    setLoading(true);

    try {
      // AGORA RECEBE APENAS { instruction }
      const resp = await enviarMensagemIA(trimmed);

      const instruction =
        resp?.instruction ||
        resp?.closer?.text ||
        "⚠️ IA não retornou instrução.";

      // adiciona APENAS a instrução do closer
      pushMessage({
        author: "closer",
        text: String(instruction)
      });

    } catch (err) {
      console.error("Erro ao chamar IA:", err);
      pushMessage({
        author: "system",
        text: "Erro ao conectar com a IA."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-[80vh] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(255,255,255,0.03)]
          bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-neon flex items-center justify-center text-black font-bold">
            AI
          </div>
          <div>
            <div className="text-lg font-semibold">Assistente Closer IA</div>
            <div className="text-xs text-slate-400">Scripts prontos para ligação</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} author={m.author} text={m.text} />
        ))}
        <div ref={listRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.03)] bg-[rgba(10,12,16,0.6)]">
        <div className="mb-2 flex items-center gap-3">
          {loading && <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
          <div className="text-xs text-slate-400">
            {loading ? "A IA está pensando..." : "Digite e pressione Enter"}
          </div>
        </div>

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
  
