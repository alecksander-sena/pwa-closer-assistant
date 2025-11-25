import Header from "../components/Header";
import ChatBox from "../components/chat/ChatBox";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="p-6 flex justify-center">
        <ChatBox />
      </main>
    </div>
  );
}
