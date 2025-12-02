import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!message.trim()) return;
      onSend(message);
      setMessage("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex p-4 bg-zinc-900 border-t border-zinc-700">
      <input
        type="text"
        className="flex-1 bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none"
        placeholder="Digite sua mensagem…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        type="submit"
        className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Enviar
      </button>
    </form>
  );
}
