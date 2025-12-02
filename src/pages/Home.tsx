// src/pages/Home.tsx
import Header from "../components/Header";
import ChatBox from "../components/chat/ChatBox";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#071128,_#0b0f14,_#071218)] text-slate-100">
      <Header />

      <main className="p-6 flex justify-center">
        <div className="w-full max-w-5xl">
          <ChatBox />
        </div>
      </main>
    </div>
  );
}
