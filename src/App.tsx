import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPostPage";
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import TermosUso from "@/pages/TermosUso";
import LandingPage from "./pages/LandingPage";
import Login from "@/pages/Login"; // Importar o novo componente Login
import Cadastro from "@/pages/Cadastro"; // Importar o novo componente Cadastro
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} /> {/* Nova rota de Login */}
      <Route path="/cadastro" element={<Cadastro />} /> {/* Nova rota de Cadastro */}
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/termos-uso" element={<TermosUso />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;