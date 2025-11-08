import { User } from "@/context/AuthContext";
import api from "@/services/api"; // Importar a instância do axios configurada

// Endpoint de registro (ajuste conforme sua API)
const REGISTER_ENDPOINT = "/auth/register"; 

export const registerService = async (email: string, password: string): Promise<boolean> => {
  try {
    // SIMULAÇÃO DE ATRASO DE REDE (REMOVER EM PRODUÇÃO COM BACKEND REAL)
    await new Promise(resolve => setTimeout(resolve, 800));

    const response = await api.post(REGISTER_ENDPOINT, { email, password });

    if (response.status === 201 || response.status === 200) {
      return true; // Registro bem-sucedido
    } else {
      // Se a resposta não for 2xx, é um erro
      throw new Error(response.data?.message || 'Falha no registro. O e-mail pode já estar em uso.');
    }
  } catch (error: any) {
    console.error("Register API error:", error);
    // Rejeita a Promise para que o componente possa capturar o erro
    throw new Error(error.response?.data?.message || "Ocorreu um erro ao tentar registrar.");
  }
};