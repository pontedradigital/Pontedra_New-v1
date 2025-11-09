import { Routes, Route } from "react-router-dom";
// Removendo a importação de BrowserRouter daqui, pois já é importado em main.tsx
import { Toaster } from 'sonner';
import Index from "@/pages/Index";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPostPage";
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import TermosUso from "@/pages/TermosUso";
import LandingPage from "./pages/LandingPage";
import Login from "@/pages/Login";
import Cadastro from "@/pages/Cadastro";
import NotFound from "./pages/NotFound";
import ScrollToTopSpecific from "./components/ScrollToTopSpecific";

// Importações para o Dashboard
import MasterHome from "@/pages/dashboard/master/MasterHome";
import Clientes from "@/pages/dashboard/master/Clientes";
import Servicos from "@/pages/dashboard/master/Servicos";
import Agendamentos from "@/pages/dashboard/master/Agendamentos";
import ClienteHome from "@/pages/dashboard/cliente/ClienteHome";
import Agendar from "@/pages/dashboard/cliente/Agendar";
import MeusAgendamentos from "@/pages/dashboard/cliente/MeusAgendamentos";
import ProspectHome from "@/pages/dashboard/prospect/ProspectHome";
import ChatVedra from '@/pages/dashboard/cliente/ChatVedra';
import ProspectChatVedra from '@/pages/dashboard/prospect/ChatVedra';
import Beneficios from '@/pages/dashboard/cliente/Beneficios'; // <--- NOVA IMPORTAÇÃO

function App() {
  return (
    <> {/* Substituído BrowserRouter por um Fragment */}
      <Toaster position="top-right" richColors />
      <ScrollToTopSpecific />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/termos-uso" element={<TermosUso />} />

        {/* Rotas do Dashboard Master */}
        <Route path="/dashboard/master" element={<MasterHome />} />
        <Route path="/dashboard/master/clientes" element={<Clientes />} />
        <Route path="/dashboard/master/servicos" element={<Servicos />} />
        <Route path="/dashboard/master/agendamentos" element={<Agendamentos />} />

        {/* Rotas do Dashboard Cliente */}
        <Route path="/dashboard/cliente" element={<ClienteHome />} />
        <Route path="/dashboard/cliente/agendar" element={<Agendar />} />
        <Route path="/dashboard/cliente/agendamentos" element={<MeusAgendamentos />} />
        <Route path="/dashboard/cliente/vedra" element={<ChatVedra />} />
        <Route path="/dashboard/cliente/beneficios" element={<Beneficios />} /> {/* <--- NOVA ROTA */}

        {/* Rotas do Dashboard Prospect */}
        <Route path="/dashboard/prospect" element={<ProspectHome />} />
        <Route path="/dashboard/prospect/vedra" element={<ProspectChatVedra />} />

        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;