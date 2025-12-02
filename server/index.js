import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ========= PROMPTS ========= //

const systemCloser = `
Você é um CLOSER PROFISSIONAL especializado em vender o curso de inglês da Wise Up Online.
Sua função é **orientar o vendedor (usuário)** sobre o que dizer ao cliente na ligação.

Regras:
- Suas respostas devem ser DIRETAS, CURTAS e OBJETIVAS.
- Sempre responda **como se estivesse guiando o vendedor**, e não falando com o cliente.
- Exemplos permitidos:
   "Responda assim para o cliente: ..."
   "Siga com essa fala: ..."
- Se o cliente levantar objeção, você responde:
   "Diga isso: ..."
- Se faltar contexto, peça ao vendedor:
   "Pergunte isso ao cliente: ..."
`;

const systemSimulacao = `
Você é um CLIENTE REAL sendo simulado para treinar vendedores.

Regras:
- Responda como uma pessoa normal.
- Nem sempre facilite.
- Use dúvidas, objeções, inseguranças ou respostas curtas.
- Varie entre:
   - interessado
   - desinteressado
   - desconfiado
   - ocupado
   - curioso
- Mas seja coerente com o que o vendedor disser.
`;

// ========= ROTA ========= //

app.post("/api/ia", async (req, res) => {
  try {
    const { message, mode } = req.body;

    if (!message)
      return res.status(400).json({ error: "Mensagem não enviada." });

    // Seleção de modo (o segredo!)
    const systemPrompt =
      mode === "closer" ? systemCloser : systemSimulacao;

    // --------- FAKE IA (MOCK) PARA TESTE LOCAL --------- //
    // Aqui você pode integrar qualquer modelo depois.
    // Por enquanto, só simula respostas realistas.

    let resposta = "";

    if (mode === "closer") {
      resposta = `Diga ao cliente: "${gerarFalaCloser(message)}"`;
    } else {
      resposta = gerarFalaCliente(message);
    }

    return res.json({
      text: resposta,
      step: "ok",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro interno." });
  }
});

// ======= GERADORES FAKE (apenas até integrar OpenAI) ======= //

function gerarFalaCloser(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("oi") || msg.includes("olá")) {
    return "Claro! Comece perguntando: 'Como está o seu inglês hoje?'";
  }

  if (msg.includes("não tenho interesse")) {
    return "Responda: 'Entendo totalmente! Mas só pra eu entender, qual é o ponto que não faz sentido pra você hoje?'";
  }

  if (msg.includes("valor")) {
    return "Diga: 'O melhor é que você só paga se fizer sentido pra sua rotina. Posso te explicar como funciona?'";
  }

  return "Boa! Agora faça uma pergunta aberta para avançar na conversa.";
}

function gerarFalaCliente(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("oi") || msg.includes("olá")) {
    return "Oi! Quem está falando?";
  }

  if (msg.includes("inglês")) {
    return "Ah, meu inglês é bem básico… quase nada.";
  }

  if (msg.includes("curso")) {
    return "Depende… esse curso é muito caro?";
  }

  return "Hmm… não sei, me explica melhor.";
}

app.listen(3001, () => console.log("API rodando na porta 3001"));
