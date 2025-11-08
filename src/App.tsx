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
import ScrollToTopSpecific from "./components/ScrollToTopSpecific"; // Importando o novo componente

function App() {
  return (
    <> {/* Usando um fragmento para envolver os componentes */}
      <ScrollToTopSpecific /> {/* Adicionando o componente aqui para que ele reaja às mudanças de rota */}
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
    </>
  );
}

export default App;