type ChatMessageProps = {
  author: "user" | "bot";
  text: string;
};

export default function ChatMessage({ author, text }: ChatMessageProps) {
  const isUser = author === "user";

  return (
    <div
      className={`w-full flex mb-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] px-4 py-2 rounded-lg shadow-md ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
