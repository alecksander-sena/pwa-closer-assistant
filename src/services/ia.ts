// src/services/ia.ts
import Groq from "groq-sdk";
import { contextoVendas } from "../data/contexto";

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

/**
 * System prompt do CLOSER (usa o contexto completo dos 7 passos)
 */
const systemPromptCloser = `
Você é um assistente especialista em VENDAS, CLOSING e no roteiro de 7 passos da Wise Up.

Regras que devem ser seguidas SEMPRE:

1) Suas respostas devem ser:
- claras
- objetivas
- curtas (3–6 linhas)
- fáceis de entender
- práticas e diretas
- sempre usando o contexto de vendas abaixo

2) Siga SEMPRE a ordem dos "7 Passos da Venda". Você deve conduzir a conversa como um closer de verdade, passo a passo.
- APRESENTAÇÃO - Me apresentar e falar quem indicou!
- CONEXÃO - Criar rapport e empatia
- 
- INVESTIGAÇÃO
- PROPOSTA DE VALOR
- TRATAMENTO DE OBJEÇÕES
- FECHAMENTO
- PÓS-VENDA

3) Entenda o que o usuário escreveu e responda como um vendedor profissional:
- crie rapport
- faça perguntas inteligentes
- perguntas abertas
- mantenha o controle da conversa
- escute ativamente
- responda com empatia
- responda às objeções
- avance o processo de venda
- não forcar venda caso o queira ou não esteja interessado
- valide intenções
- identifique dores, desejos e objeções
- leve o usuário ao fechamento

4) Nunca ignore o contexto.
5) Nunca fuja do assunto: **o objetivo é vender o curso de inglês Wise Up**.
6) Sempre responda com naturalidade, como conversa de WhatsApp.

===== CONTEXTO COMPLETO DOS 7 PASSOS =====
${contextoVendas}
`;

/**
 * System prompt do CLIENTE (simulação)
 */
const systemPromptCliente = `
Você é um cliente brasileiro comum conversando com um closer por ligação.
Seu papel:
- Responder como uma pessoa comum e desconhecida.
- Falar com naturalidade: risadas, pausas, gírias leves e reações humanas.
- Mostrar emoção, insegurança, curiosidade e dúvidas reais.
- Não parecer especialista, não dar aula e não citar preços ou informações exatas sobre escolas.
- Apenas responder como o CLIENTE.
- Sempre seguir o fluxo iniciado pelo closer.
- Não finalize a conversa sozinho; sempre deixe espaço para continuidade.
`;

/**
 * Função principal: envia mensagem para o modelo CLOSER (usa modelo robusto recomendado)
 * Retorna o texto da IA ou mensagem de erro amigável.
 */
export async function enviarMensagem(mensagemUsuario: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // modelo recomendado (versão ativa)
      messages: [
        { role: "system", content: systemPromptCloser },
        { role: "user", content: mensagemUsuario },
      ],
      temperature: 0.25,
      max_tokens: 300,
    });

    // estrutura esperada: completion.choices[0].message.content
    const resposta = completion?.choices?.[0]?.message?.content;
    return resposta ?? "Erro: resposta vazia.";
  } catch (error) {
    console.error("Erro ao enviar mensagem (Closer):", error);
    return "Erro ao conectar com a IA.";
  }
}

/**
 * Função auxiliar: simula o cliente humano (útil para testes locais)
 */
export async function enviarSimulacaoCliente(mensagem: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // modelo leve/rápido para simulações
      messages: [
        { role: "system", content: systemPromptCliente },
        { role: "user", content: mensagem },
      ],
      temperature: 0.85,
      max_tokens: 250,
    });

    const resposta = completion?.choices?.[0]?.message?.content;
    return resposta ?? "Erro: resposta vazia.";
  } catch (error) {
    console.error("Erro ao enviar mensagem (Simulação cliente):", error);
    return "Erro ao conectar com a IA.";
  }
}
