export async function askAI(message: string): Promise<string> {
  try {
    return "IA conectada com sucesso! Mensagem recebida: " + message;
  } catch (error) {
    console.error("Erro ao chamar IA:", error);
    return "Erro ao processar a resposta.";
  }
}
