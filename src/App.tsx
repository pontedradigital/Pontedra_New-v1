import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import LandingPage from "./pages/LandingPage";

import MasterDashboardPage from "./pages/dashboard/master/Index";
import UsersPage from "./pages/dashboard/master/Users";
import ServicesPage from "./pages/dashboard/master/Services";
import AppointmentsPage from "./pages/dashboard/master/Appointments";
import CanaisAtendimentoPage from "./pages/dashboard/master/CanaisAtendimento";
import AIInsightsPage from "./pages/dashboard/master/AIInsights";
import AnalisesPage from "./pages/dashboard/master/Analises";
import SettingsPage from "./pages/dashboard/master/Settings";
import BlogPage from "./pages/dashboard/master/BlogPage";
import FinanceiroPage from "./pages/dashboard/master/Financeiro";

import WhatsAppIntegracao from "./pages/dashboard/master/comunicacao/WhatsAppIntegracao";
import InstagramIntegracao from "./pages/dashboard/master/comunicacao/InstagramIntegracao";
import MessengerIntegracao from "./pages/dashboard/master/comunicacao/MessengerIntegracao";


import ClientDashboardPage from "./pages/dashboard/cliente/Index";
import ClientAgendaPage from "./pages/dashboard/cliente/Agenda";
import ClientCentralAtendimentoPage from "./pages/dashboard/cliente/CentralAtendimento";
import ClientPerfilPage from "./pages/dashboard/cliente/Perfil";
import ClientSettingsPage from "./pages/dashboard/cliente/Settings";
import ClientMinhaExperienciaPage from "./pages/dashboard/cliente/MinhaExperiencia";
import ClientCarteiraDigitalPage from "./pages/dashboard/cliente/CarteiraDigital"; // Importar a nova página

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

const App = () => {
  const location = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Index /></PageTransition>} />
              <Route path="/landing" element={<PageTransition><LandingPage /></PageTransition>} />
              <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

              {/* Rotas Protegidas para Master */}
              <Route
                path="/dashboard/master"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><MasterDashboardPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/users"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><UsersPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/services"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><ServicesPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/appointments"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><AppointmentsPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/canais-atendimento"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><CanaisAtendimentoPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/ai-insights"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><AIInsightsPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/analises"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><AnalisesPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/blog"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><BlogPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/settings"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><SettingsPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/financeiro"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><FinanceiroPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/comunicacao/whatsapp"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><WhatsAppIntegracao /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/comunicacao/instagram"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><InstagramIntegracao /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/comunicacao/messenger"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><MessengerIntegracao /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/master/*"
                element={
                  <ProtectedRoute allowedRoles={["master"]}>
                    <PageTransition><MasterDashboardPage /></PageTransition>
                  </ProtectedRoute>
                }
              />

              {/* Rotas Protegidas para Cliente */}
              <Route
                path="/dashboard/cliente"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientDashboardPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/cliente/minha-experiencia"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientMinhaExperienciaPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/cliente/agenda"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientAgendaPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/cliente/central-atendimento"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientCentralAtendimentoPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/cliente/carteira-digital" // Nova rota
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientCarteiraDigitalPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/cliente/perfil"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientPerfilPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/cliente/settings"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientSettingsPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/cliente/*"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientDashboardPage /></PageTransition>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;