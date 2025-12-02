// src/components/chat/ChatMessage.tsx
type Props = {
  author: "user" | "bot" | "client" | "closer" | "system";
  text: string;
};

export default function ChatMessage({ author, text }: Props) {
  // map author -> styles
  const isUser = author === "user";
  const isClient = author === "client";
  const isCloser = author === "closer";
  const isSystem = author === "system";

  const containerClass = isUser ? "justify-end" : "justify-start";
  const bubbleBase = "max-w-[80%] px-4 py-3 rounded-xl shadow-md";

  const bubbleClass = isCloser
    ? "bg-gradient-to-br from-violet-700 to-fuchsia-600 text-white ring-1 ring-[rgba(255,255,255,0.02)]"
    : isClient
    ? "bg-[rgba(255,255,255,0.03)] text-slate-200 ring-1 ring-[rgba(255,255,255,0.02)]"
    : isUser
    ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-black font-semibold"
    : isSystem
    ? "bg-[rgba(255,255,255,0.02)] text-slate-400 italic"
    : "bg-[rgba(255,255,255,0.03)] text-slate-200";

  const label = isUser ? "Você" : isClient ? "Cliente (simulado)" : isCloser ? "Closer" : "Sistema";

  return (
    <div className={`w-full flex mb-2 ${containerClass}`}>
      <div className={`${bubbleBase} ${bubbleClass} ${isUser ? "rounded-tr-none" : isClient ? "rounded-tl-none" : ""}`}>
        <div className="text-[12px] font-medium opacity-80 mb-1">{label}</div>
        <div className="whitespace-pre-wrap leading-6">{text}</div>
      </div>
    </div>
  );
}
