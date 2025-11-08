import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPostPage";
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import TermosUso from "@/pages/TermosUso";
import LandingPage from "./pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register"; // Renamed from Cadastro to Register for consistency
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Index />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/termos-uso" element={<TermosUso />} />

      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;