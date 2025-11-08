import { Routes, Route } from "react-router-dom";
// Removendo a importação de BrowserRouter daqui, pois já é importado em main.tsx
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

function App() {
  return (
    <> {/* Substituído BrowserRouter por um Fragment */}
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

        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;