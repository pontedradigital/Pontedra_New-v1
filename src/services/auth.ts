import { User } from "@/context/AuthContext";

// --- CONFIGURAÇÃO DO BACKEND (AJUSTE AQUI) ---
// Em um ambiente real, estas URLs viriam de variáveis de ambiente (ex: .env)
// Exemplo: const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const API_BASE_URL = "http://localhost:3000/api"; // URL base da sua API
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`; // Endpoint de login
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`; // Endpoint de registro
// --- FIM DA CONFIGURAÇÃO ---

// MOCK DE USUÁRIOS (PARA SIMULAÇÃO SEM BACKEND REAL)
// Em um ambiente real, esta parte seria removida e a autenticação seria feita via API.
const MOCK_USERS: Record<string, User> = {
  "master@teste.com": { email: "master@teste.com", role: "master" },
  "cliente@teste.com": { email: "cliente@teste.com", role: "client" },
};
const MOCK_PASSWORD = "1234Mudar";

export const loginService = async (email: string, password: string): Promise<User | null> => {
  // SIMULAÇÃO DE ATRASO DE REDE E ERROS (REMOVER EM PRODUÇÃO COM BACKEND REAL)
  const simulateNetworkDelay = 1000; // 1 segundo de atraso
  const simulateNetworkErrorChance = 0.05; // 5% de chance de erro de rede
  const simulateTimeoutChance = 0.02; // 2% de chance de timeout

  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      if (Math.random() < simulateNetworkErrorChance) {
        console.error("Simulated network error during login.");
        reject(new Error("Erro de conexão. Por favor, verifique sua internet e tente novamente."));
        return;
      }

      if (Math.random() < simulateTimeoutChance) {
        console.error("Simulated login timeout.");
        reject(new Error("Tempo limite excedido. O servidor demorou para responder."));
        return;
      }

      // --- INÍCIO: LÓGICA DE AUTENTICAÇÃO REAL (DESCOMENTE E AJUSTE PARA SEU BACKEND) ---
      /*
      try {
        const response = await fetch(LOGIN_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Adicione outros headers como 'Authorization' se necessário
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          // Se a resposta não for 2xx, é um erro (ex: 401 Unauthorized, 400 Bad Request)
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha na autenticação. Credenciais inválidas.');
        }

        const data = await response.json();
        // Supondo que o backend retorna um objeto com o usuário e talvez um token
        // Exemplo: { user: { email: "...", role: "..." }, token: "..." }
        // Você pode armazenar o token em localStorage/cookies aqui se necessário.
        return data.user as User; // Retorna o objeto User
      } catch (error: any) {
        console.error("Login API error:", error);
        // Rejeita a Promise para que o AuthContext possa capturar o erro
        reject(new Error(error.message || "Ocorreu um erro ao tentar fazer login."));
        return;
      }
      */
      // --- FIM: LÓGICA DE AUTENTICAÇÃO REAL ---

      // LÓGICA MOCKADA (REMOVER QUANDO USAR BACKEND REAL)
      const user = MOCK_USERS[email];
      if (user && password === MOCK_PASSWORD) {
        resolve(user); // Login bem-sucedido com mock
      } else {
        resolve(null); // Credenciais inválidas com mock
      }
    }, simulateNetworkDelay);
  });
};

export const registerService = async (email: string, password: string): Promise<boolean> => {
  // SIMULAÇÃO DE ATRASO DE REDE E ERROS (REMOVER EM PRODUÇÃO COM BACKEND REAL)
  const simulateNetworkDelay = 800;
  const simulateNetworkErrorChance = 0.03;

  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      if (Math.random() < simulateNetworkErrorChance) {
        console.error("Simulated network error during registration.");
        reject(new Error("Erro de conexão ao registrar. Por favor, tente novamente."));
        return;
      }

      // --- INÍCIO: LÓGICA DE REGISTRO REAL (DESCOMENTE E AJUSTE PARA SEU BACKEND) ---
      /*
      try {
        const response = await fetch(REGISTER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha no registro. O e-mail pode já estar em uso.');
        }

        // Supondo que o backend retorna sucesso ou o novo usuário
        return true; // Registro bem-sucedido
      } catch (error: any) {
        console.error("Register API error:", error);
        reject(new Error(error.message || "Ocorreu um erro ao tentar registrar."));
        return;
      }
      */
      // --- FIM: LÓGICA DE REGISTRO REAL ---

      // LÓGICA MOCKADA (REMOVER QUANDO USAR BACKEND REAL)
      if (MOCK_USERS[email]) {
        resolve(false); // Usuário já existe com mock
      } else {
        resolve(true); // Registro bem-sucedido com mock
      }
    }, simulateNetworkDelay);
  });
};