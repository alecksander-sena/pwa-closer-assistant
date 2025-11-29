import { useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatBox() {
  const [messages, setMessages] = useState<{ author: "user" | "bot"; text: string }[]>([]);

  function handleSend(msg: string) {
    const userMsg = { author: "user" as const, text: msg };
    setMessages((prev) => [...prev, userMsg]);

    // Resposta simulada do "bot"
    setTimeout(() => {
      const botMsg = {
        author: "bot" as const,
        text: "Recebi sua mensagem! Em breve respondo como IA real. 🚀",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[80vh] bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((m, i) => (
          <ChatMessage key={i} author={m.author} text={m.text} />
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}