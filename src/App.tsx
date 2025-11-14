import { Routes, Route } from "react-router-dom";
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
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Importando as páginas de dashboard
import MasterHome from "./pages/dashboard/master/Home";
import ClientHome from "./pages/dashboard/client/Home";
import ProspectHome from "./pages/dashboard/prospect/Home";
import ResourcesPage from "./pages/dashboard/common/ResourcesPage";
import ProjectsPage from "./pages/dashboard/client/ProjectsPage";
import AppointmentsPage from "./pages/dashboard/client/AppointmentsPage";
import ManageUsersPage from "./pages/dashboard/master/ManageUsersPage";
import ReportsPage from "./pages/dashboard/master/ReportsPage";

// Nova página de configurações combinada
import SettingsPage from "./pages/dashboard/common/SettingsPage";

// Novas páginas para o Master
import ServicesPage from "./pages/dashboard/master/ServicesPage";
import PackagesPage from "./pages/dashboard/master/PackagesPage";
import BudgetsPage from "./pages/dashboard/master/BudgetsPage";
import CostsPage from "./pages/dashboard/master/CostsPage";
import CalculatorsPage from "./pages/dashboard/master/CalculatorsPage"; // NOVO: Importar CalculatorsPage
import VedraAIPage from "./pages/dashboard/master/VedraAIPage";
import ClientsPage from "./pages/dashboard/master/ClientsPage";

function App() {
  return (
    <AuthProvider>
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

        {/* Rotas Protegidas */}
        {/* Rotas Home específicas de cada papel */}
        <Route path="/dashboard/master" element={<ProtectedRoute allowedRoles={['master']}><MasterHome /></ProtectedRoute>} />
        <Route path="/dashboard/client" element={<ProtectedRoute allowedRoles={['client', 'master']}><ClientHome /></ProtectedRoute>} />
        <Route path="/dashboard/prospect" element={<ProtectedRoute allowedRoles={['prospect', 'client', 'master']}><ProspectHome /></ProtectedRoute>} />
        
        {/* Rotas comuns e específicas dentro do DashboardLayout */}
        <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={['prospect', 'client', 'master']}><SettingsPage /></ProtectedRoute>} />
        <Route path="/dashboard/resources" element={<ProtectedRoute allowedRoles={['prospect', 'client', 'master']}><ResourcesPage /></ProtectedRoute>} />
        
        <Route path="/dashboard/projects" element={<ProtectedRoute allowedRoles={['client', 'master']}><ProjectsPage /></ProtectedRoute>} />
        <Route path="/dashboard/appointments" element={<ProtectedRoute allowedRoles={['client', 'master']}><AppointmentsPage /></ProtectedRoute>} />

        {/* Novas Rotas para o Master */}
        <Route path="/dashboard/clients" element={<ProtectedRoute allowedRoles={['master']}><ClientsPage /></ProtectedRoute>} />
        <Route path="/dashboard/services" element={<ProtectedRoute allowedRoles={['master']}><ServicesPage /></ProtectedRoute>} />
        <Route path="/dashboard/packages" element={<ProtectedRoute allowedRoles={['master']}><PackagesPage /></ProtectedRoute>} />
        <Route path="/dashboard/budgets" element={<ProtectedRoute allowedRoles={['master']}><BudgetsPage /></ProtectedRoute>} />
        <Route path="/dashboard/costs" element={<ProtectedRoute allowedRoles={['master']}><CostsPage /></ProtectedRoute>} />
        <Route path="/dashboard/calculators" element={<ProtectedRoute allowedRoles={['master']}><CalculatorsPage /></ProtectedRoute>} /> {/* NOVO: Rota para CalculatorsPage */}
        <Route path="/dashboard/vedra-ai" element={<ProtectedRoute allowedRoles={['master']}><VedraAIPage /></ProtectedRoute>} />

        <Route path="/dashboard/manage-users" element={<ProtectedRoute allowedRoles={['master']}><ManageUsersPage /></ProtectedRoute>} />
        <Route path="/dashboard/reports" element={<ProtectedRoute allowedRoles={['master']}><ReportsPage /></ProtectedRoute>} />

        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;