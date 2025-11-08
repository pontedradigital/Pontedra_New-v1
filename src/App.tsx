import { Routes, Route } from "react-router-dom"; // Removido BrowserRouter as Router
import Index from "@/pages/Index";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPostPage";
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import TermosUso from "@/pages/TermosUso";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import NotFound from "./pages/NotFound";

function App() {
  return (
    // O Router já é fornecido em src/main.tsx, então removemos daqui.
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/termos-uso" element={<TermosUso />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;