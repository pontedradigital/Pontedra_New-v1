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
import UsersPage from "./pages/dashboard/master/Users"; // Nova página
import ServicesPage from "./pages/dashboard/master/Services"; // Nova página
import AppointmentsPage from "./pages/dashboard/master/Appointments"; // Nova página
import CommunicationPage from "./pages/dashboard/master/Communication"; // Nova página
import AIInsightsPage from "./pages/dashboard/master/AIInsights"; // Nova página
import SettingsPage from "./pages/dashboard/master/Settings"; // Nova página
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
              path="/dashboard/master/communication"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <CommunicationPage />
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