import axios from "axios";

// --- CONFIGURAÇÃO DO BACKEND (AJUSTE AQUI) ---
// Em um ambiente real, esta URL viria de variáveis de ambiente (ex: .env)
// Exemplo: const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_BASE_URL = "http://localhost:4000"; // URL base da sua API
// --- FIM DA CONFIGURAÇÃO ---

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para injetar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pontedra_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;