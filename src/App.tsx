import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"; // Importar useLocation
import { AnimatePresence, motion } from "framer-motion"; // Importar AnimatePresence e motion

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
import BlogPage from "./pages/dashboard/master/BlogPage"; // Importar BlogPage

import ClientDashboardPage from "./pages/dashboard/cliente/Index";
import ClientAgendaPage from "./pages/dashboard/cliente/Agenda";
import ClientChatPage from "./pages/dashboard/cliente/Chat";
import ClientPerfilPage from "./pages/dashboard/cliente/Perfil";
import ClientSettingsPage from "./pages/dashboard/cliente/Settings";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="h-full w-full" // Garante que a div de transição ocupe o espaço
  >
    {children}
  </motion.div>
);

const App = () => {
  const location = useLocation(); // Hook para obter a localização atual

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AnimatePresence mode="wait"> {/* Adicionado AnimatePresence */}
            <Routes location={location} key={location.pathname}> {/* Passar location e key */}
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
                path="/dashboard/master/blog" // Nova rota para Blog
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
              {/* Catch-all para sub-rotas do Master, se necessário */}
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
                path="/dashboard/cliente/agenda"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientAgendaPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/cliente/chat"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientChatPage /></PageTransition>
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
              {/* Catch-all para sub-rotas do Cliente, se necessário */}
              <Route
                path="/dashboard/cliente/*"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <PageTransition><ClientDashboardPage /></PageTransition>
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;