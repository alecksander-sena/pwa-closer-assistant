import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex p-4 bg-white border-t">
      <input
        type="text"
        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
        placeholder="Digite sua mensagem…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        type="submit"
        className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Enviar
      </button>
    </form>
  );
}
