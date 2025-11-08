import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPostPage";
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import TermosUso from "@/pages/TermosUso";
import LandingPage from "./pages/LandingPage";
import Login from "@/pages/Login";
import Cadastro from "@/pages/Cadastro";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute"; // Importar ProtectedRoute

// Importar as páginas de dashboard existentes
import MasterDashboardPage from "@/pages/dashboard/master/Index";
import ClientDashboardPage from "@/pages/dashboard/cliente/Index";
import UsersPage from "@/pages/dashboard/master/Users";
import ServicesPage from "@/pages/dashboard/master/Services";
import AppointmentsPage from "@/pages/dashboard/master/Appointments";
import CanaisAtendimentoPage from "@/pages/dashboard/master/CanaisAtendimento";
import AIInsightsPage from "@/pages/dashboard/master/AIInsights";
import AnalisesPage from "@/pages/dashboard/master/Analises";
import FinanceiroPage from "@/pages/dashboard/master/Financeiro";
import BlogMasterPage from "@/pages/dashboard/master/BlogPage";
import AprendizadoPontedra from "@/pages/dashboard/master/AprendizadoPontedra";
import MasterSettingsPage from "@/pages/dashboard/master/Settings";
import MessengerIntegracao from "@/pages/dashboard/master/comunicacao/MessengerIntegracao";
import InstagramIntegracao from "@/pages/dashboard/master/comunicacao/InstagramIntegracao";
import WhatsAppIntegracao from "@/pages/dashboard/master/comunicacao/WhatsAppIntegracao";
import AnaliseInteligente from "@/pages/dashboard/master/AnaliseInteligente";

import PerfilPage from "@/pages/dashboard/cliente/Perfil";
import ClientSettingsPage from "@/pages/dashboard/cliente/Settings";
import NotificacoesSuportePage from "@/pages/dashboard/cliente/NotificacoesSuporte";
import AgendaPage from "@/pages/dashboard/cliente/Agenda";
import HistoricoAgendamentosPage from "@/pages/dashboard/cliente/HistoricoAgendamentos";
import MinhaExperienciaPage from "@/pages/dashboard/cliente/MinhaExperiencia";
import AtendimentoInteligentePage from "@/pages/dashboard/cliente/AtendimentoInteligente";
import BeneficiosFidelidadePage from "@/pages/dashboard/cliente/BeneficiosFidelidade";


function App() {
  return (
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

      {/* Rotas Protegidas para Master */}
      <Route path="/dashboard/master" element={<ProtectedRoute allowedRoles={["master"]}><MasterDashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/users" element={<ProtectedRoute allowedRoles={["master"]}><UsersPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/services" element={<ProtectedRoute allowedRoles={["master"]}><ServicesPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/appointments" element={<ProtectedRoute allowedRoles={["master"]}><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/canais-atendimento" element={<ProtectedRoute allowedRoles={["master"]}><CanaisAtendimentoPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/ai-insights" element={<ProtectedRoute allowedRoles={["master"]}><AIInsightsPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/analises" element={<ProtectedRoute allowedRoles={["master"]}><AnalisesPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/analise-inteligente" element={<ProtectedRoute allowedRoles={["master"]}><AnaliseInteligente /></ProtectedRoute>} />
      <Route path="/dashboard/master/financeiro" element={<ProtectedRoute allowedRoles={["master"]}><FinanceiroPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/blog" element={<ProtectedRoute allowedRoles={["master"]}><BlogMasterPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/aprendizado" element={<ProtectedRoute allowedRoles={["master"]}><AprendizadoPontedra /></ProtectedRoute>} />
      <Route path="/dashboard/master/settings" element={<ProtectedRoute allowedRoles={["master"]}><MasterSettingsPage /></ProtectedRoute>} />
      <Route path="/dashboard/master/comunicacao/whatsapp" element={<ProtectedRoute allowedRoles={["master"]}><WhatsAppIntegracao /></ProtectedRoute>} />
      <Route path="/dashboard/master/comunicacao/instagram" element={<ProtectedRoute allowedRoles={["master"]}><InstagramIntegracao /></ProtectedRoute>} />
      <Route path="/dashboard/master/comunicacao/messenger" element={<ProtectedRoute allowedRoles={["master"]}><MessengerIntegracao /></ProtectedRoute>} />


      {/* Rotas Protegidas para Cliente */}
      <Route path="/dashboard/cliente" element={<ProtectedRoute allowedRoles={["client"]}><ClientDashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/cliente/perfil" element={<ProtectedRoute allowedRoles={["client"]}><PerfilPage /></ProtectedRoute>} />
      <Route path="/dashboard/cliente/settings" element={<ProtectedRoute allowedRoles={["client"]}><ClientSettingsPage /></ProtectedRoute>} />
      <Route path="/dashboard/cliente/notificacoes-suporte" element={<ProtectedRoute allowedRoles={["client"]}><NotificacoesSuportePage /></ProtectedRoute>} />
      <Route path="/dashboard/cliente/agenda" element={<ProtectedRoute allowedRoles={["client"]}><AgendaPage /></ProtectedRoute>} />
      <Route path="/dashboard/cliente/historico-agendamentos" element={<ProtectedRoute allowedRoles={["client"]}><HistoricoAgendamentosPage /></ProtectedRoute>} />
      <Route path="/dashboard/cliente/minha-experiencia" element={<ProtectedRoute allowedRoles={["client"]}><MinhaExperienciaPage /></ProtectedRoute>} />
      <Route path="/dashboard/cliente/atendimento-inteligente" element={<ProtectedRoute allowedRoles={["client"]}><AtendimentoInteligentePage /></ProtectedRoute>} />
      <Route path="/dashboard/cliente/beneficios-fidelidade" element={<ProtectedRoute allowedRoles={["client"]}><BeneficiosFidelidadePage /></ProtectedRoute>} />


      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;