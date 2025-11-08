export const registrarInteracao = async (usuario: string, mensagem: string, resposta: string) => {
  try {
    const logEntry = { usuario, mensagem, resposta, data: new Date().toISOString() };
    console.log("📩 Registro de interação:", logEntry);
    
    const logs = JSON.parse(localStorage.getItem("logAssistentePontedra") || "[]");
    logs.push(logEntry);
    localStorage.setItem("logAssistentePontedra", JSON.stringify(logs));
  } catch (error) {
    console.error("Erro ao registrar interação:", error);
  }
};