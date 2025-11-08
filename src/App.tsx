import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import MasterDashboardPage from "./pages/dashboard/master/Index";
import ClientDashboardPage from "./pages/dashboard/cliente/Index";
import UsersPage from "./pages/dashboard/master/Users";
import ServicesPage from "./pages/dashboard/master/Services";
import AppointmentsPage from "./pages/dashboard/master/Appointments";
import CanaisAtendimentoPage from "./pages/dashboard/master/CanaisAtendimento"; // Renomeado
import AIInsightsPage from "./pages/dashboard/master/AIInsights";
import AnalisesPage from "./pages/dashboard/master/Analises"; // Nova página
import SettingsPage from "./pages/dashboard/master/Settings";
import ClientAgendaPage from "./pages/dashboard/cliente/Agenda";
import ClientChatPage from "./pages/dashboard/cliente/Chat";
import ClientPerfilPage from "./pages/dashboard/cliente/Perfil";
import ClientSettingsPage from "./pages/dashboard/cliente/Settings";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas Protegidas para Master */}
            <Route
              path="/dashboard/master"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <MasterDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/master/users"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/master/services"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <ServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/master/appointments"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/master/canais-atendimento" // Rota atualizada
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <CanaisAtendimentoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/master/ai-insights"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <AIInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/master/analises" // Nova rota
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <AnalisesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/master/settings"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            {/* Catch-all para sub-rotas do Master, se necessário */}
            <Route
              path="/dashboard/master/*"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <MasterDashboardPage /> {/* Pode ser ajustado para um layout de sub-rota mais genérico */}
                </ProtectedRoute>
              }
            />

            {/* Rotas Protegidas para Cliente */}
            <Route
              path="/dashboard/cliente"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/cliente/agenda"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientAgendaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/cliente/chat"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/cliente/perfil"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientPerfilPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/cliente/settings"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientSettingsPage />
                </ProtectedRoute>
              }
            />
            {/* Catch-all para sub-rotas do Cliente, se necessário */}
            <Route
              path="/dashboard/cliente/*"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientDashboardPage /> {/* Pode ser ajustado para um layout de sub-rota mais genérico */}
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;