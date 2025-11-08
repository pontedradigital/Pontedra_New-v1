import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPostPage"; // Corrigido o nome do componente
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import TermosUso from "@/pages/TermosUso";
import LandingPage from "./pages/LandingPage"; // Adicionado para a rota /landing
import Login from "./pages/login/Login"; // Adicionado para a rota /login
import Register from "./pages/register/Register"; // Adicionado para a rota /register
import NotFound from "./pages/NotFound"; // Adicionado para a rota 404

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} /> {/* Usando BlogPostPage */}
        <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/termos-uso" element={<TermosUso />} />
        <Route path="*" element={<NotFound />} /> {/* Rota para 404 */}
      </Routes>
    </Router>
  );
}

export default App;