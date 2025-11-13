import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Importando QueryClient e QueryClientProvider

const queryClient = new QueryClient(); // Criando uma nova instância do QueryClient

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}> {/* Envolvendo o App com QueryClientProvider */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);