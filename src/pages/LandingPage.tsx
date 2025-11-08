import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import Footer from "@/components/navigation/Footer";
import { useLocation, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollBy(0, -20); // Ajuste para a altura da navbar
    }
  };

  useEffect(() => {
    if (location.hash) {
      const section = location.hash.replace("#", "");
      setTimeout(() => scrollToSection(section), 100);
    }
  }, [location.hash]);

  return (
    <div className="font-sans bg-bgMain text-textPrimary min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <section id="quem-somos" className="py-24 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-pontedra-green mb-4">Quem Somos</h2>
            <p className="text-textSecondary max-w-3xl">Somos apaixonados por transformar ideias em conexões reais. A Pontedra nasceu para aproximar marcas e pessoas, ajudando Pequenas e Médias Empresas e Profissionais Liberais a crescerem no digital com propósito.</p>
          </div>
        </section>

        <section id="solucoes" className="py-24 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground mb-6">Nossas Soluções</h2>
            <p className="text-textSecondary max-w-3xl">Oferecemos soluções personalizadas em desenvolvimento web, marketing digital e consultoria para impulsionar seu negócio.</p>
          </div>
        </section>

        <section id="depoimentos" className="py-24 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground mb-6">Depoimentos</h2>
            <p className="text-textSecondary max-w-3xl">Veja o que nossos clientes satisfeitos têm a dizer sobre a Pontedra.</p>
          </div>
        </section>

        <section id="blog" className="py-24 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground mb-6">Blog</h2>
            <p className="text-textSecondary max-w-3xl">Fique por dentro das últimas tendências e dicas do mundo digital.</p>
          </div>
        </section>

        <section id="contato" className="py-24 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground mb-6">Contato</h2>
            <p className="text-textSecondary max-w-3xl">Entre em contato conosco para saber como podemos ajudar seu negócio a crescer.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}