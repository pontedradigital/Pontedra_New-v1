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
import { AuthProvider } from "./context/AuthContext"; // Importando AuthProvider
import ProtectedRoute from "./components/ProtectedRoute"; // Importando ProtectedRoute

// Importando as páginas de dashboard
import MasterHome from "./pages/dashboard/master/Home";
import ClientHome from "./pages/dashboard/client/Home";
import ProspectHome from "./pages/dashboard/prospect/Home";

function App() {
  return (
    <AuthProvider> {/* Envolvendo toda a aplicação com AuthProvider */}
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
        <Route path="/dashboard/master" element={<ProtectedRoute allowedRoles={['master']}><MasterHome /></ProtectedRoute>} />
        <Route path="/dashboard/client" element={<ProtectedRoute allowedRoles={['client', 'master']}><ClientHome /></ProtectedRoute>} />
        <Route path="/dashboard/prospect" element={<ProtectedRoute allowedRoles={['prospect', 'client', 'master']}><ProspectHome /></ProtectedRoute>} />

        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;