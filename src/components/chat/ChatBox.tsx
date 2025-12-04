// src/components/chat/ChatBox.tsx
import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { enviarMensagemIA } from "../../serviços/ia";

type MsgAuthor = "user" | "client" | "closer" | "system";
type Msg = { author: MsgAuthor; text: string };

export default function ChatBox() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      author: "system",
      text: "Assistente pronto. Digite sua fala e pressione Enter para enviar. (Shift+Enter para nova linha)"
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

    // adiciona a mensagem do usuário
    pushMessage({ author: "user", text: trimmed });

    setLoading(true);

    try {
      // Chama a API que retorna { closer, client }
      const resp = await enviarMensagemIA(trimmed);

      // Normalizar possiveis formatos (algumas versões retornam objeto direto)
      const closerText = (resp?.closer?.text ?? resp?.closer ?? resp?.closer) || resp?.closer || "Sem resposta do Closer.";
      const clientText = (resp?.client?.text ?? resp?.client ?? resp?.client) || resp?.client || "Sem resposta do Cliente.";

      // adiciona resposta do cliente (simulado) e depois o guia do closer
      pushMessage({ author: "client", text: String(clientText) });
      pushMessage({ author: "closer", text: String(closerText) });
    } catch (err) {
      console.error("Erro ao chamar IA:", err);
      pushMessage({ author: "system", text: "Erro: não foi possível conectar à IA." });
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
      <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(255,255,255,0.03)] bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-neon flex items-center justify-center text-black font-bold">AI</div>
          <div>
            <div className="text-lg font-semibold">Alecksander Assistente Closer WSP</div>
            <div className="text-xs text-slate-400">Simule clientes e receba scripts prontos</div>
          </div>
        </div>

        <div className="text-sm text-slate-400">Tema: Dark / Cyber</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.01), transparent)" }}>
        {messages.map((m, i) => (
          <ChatMessage key={i} author={m.author} text={m.text} />
        ))}
        <div ref={listRef} />
      </div>

      {/* Typing indicator + input */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.03)] bg-[rgba(10,12,16,0.6)]">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs text-slate-400">{loading ? "A IA está pensando..." : "Pronto para enviar — Enter para enviar"}</div>
        </div>

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
