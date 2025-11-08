import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import Footer from "@/components/navigation/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import QuemSomos from "@/components/landing/QuemSomos"; // Import the new component

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // This useEffect handles scrolling to a section if a hash is present in the URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const section = document.getElementById(id);
      const nav = document.getElementById("pontedra-navbar");
      if (section && nav) {
        const navHeight = nav.getBoundingClientRect().height;
        const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [location.hash]);

  return (
    <div className="font-sans bg-bgMain text-textPrimary min-h-screen">
      <Navbar />
      <main className="pt-16"> {/* Adjusted padding to account for fixed navbar */}
        <section id="hero">
          <Hero />
        </section>

        <QuemSomos /> {/* Integrated the new QuemSomos component here */}

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