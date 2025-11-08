import React, { useEffect } from "react";
import LandingNavbar from "@/components/LandingNavbar"; // Updated import
import Hero from "@/sections/Hero";
import Footer from "@/components/navigation/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import QuemSomos from "@/components/landing/QuemSomos";
import NossasSolucoes from "@/sections/NossasSolucoes";
import Depoimentos from "@/sections/Depoimentos"; // Importar o novo componente Depoimentos
import Contato from "@/sections/Contato"; // Importar o novo componente Contato

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // This useEffect handles scrolling to a section if a hash is present in the URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const section = document.getElementById(id);
      const nav = document.getElementById("pontedra-navbar"); // This ID is from the old Navbar, new one doesn't use it for scroll-margin-top
      if (section) { // Removed nav check as new Navbar handles its own scroll state
        const navHeight = 80; // Fixed height for the new LandingNavbar
        const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [location.hash]);

  return (
    <div className="font-sans bg-bgMain text-textPrimary min-h-screen">
      <LandingNavbar /> {/* Updated component name */}
      <main className="pt-16"> {/* Adjusted padding to account for fixed navbar */}
        <section id="hero">
          <Hero />
        </section>

        <QuemSomos />

        <NossasSolucoes />

        {/* Nova seção de Depoimentos */}
        <Depoimentos />

        <section id="blog" className="py-24 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground mb-6">Blog</h2>
            <p className="text-textSecondary max-w-3xl">Fique por dentro das últimas tendências e dicas do mundo digital.</p>
          </div>
        </section>

        {/* Nova seção de Contato */}
        <Contato />
      </main>
      <Footer />
    </div>
  );
}