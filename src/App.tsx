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
            {/* Exemplo de sub-rota para Master (pode ser expandido) */}
            <Route
              path="/dashboard/master/*"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <MasterDashboardPage /> {/* Renderiza o layout e o conteúdo da sub-rota */}
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
            {/* Exemplo de sub-rota para Cliente (pode ser expandido) */}
            <Route
              path="/dashboard/cliente/*"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientDashboardPage /> {/* Renderiza o layout e o conteúdo da sub-rota */}
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