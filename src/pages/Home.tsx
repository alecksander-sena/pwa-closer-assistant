import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Bem-vindo ao seu Assistente de Vendas!
        </h1>

        <p className="text-gray-600 mt-2">
          Vamos começar a construir seu fluxo de atendimento passo a passo.
        </p>
      </main>
    </div>
  );
}
