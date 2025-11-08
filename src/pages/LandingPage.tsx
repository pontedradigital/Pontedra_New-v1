import React, { useEffect } from "react";
import LandingNavbar from "@/components/LandingNavbar";
import Hero from "@/sections/Hero";
import Footer from "@/sections/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import QuemSomos from "@/components/landing/QuemSomos";
import NossasSolucoes from "@/sections/NossasSolucoes";
import Depoimentos from "@/sections/Depoimentos";
import { Contato } from "@/sections/Contato";
import BlogPreview from "@/sections/BlogPreview";
import { PopupManager } from '@/components/PopupManager' // Importação adicionada

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // This useEffect handles scrolling to a section if a hash is present in the URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const section = document.getElementById(id);
      if (section) {
        const navHeight = 80; // Fixed height for the LandingNavbar
        const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [location.hash]);

  return (
    <div className="font-sans bg-bgMain text-textPrimary min-h-screen">
      <LandingNavbar />
      <main className="pt-16">
        <section id="hero">
          <Hero />
        </section>

        <QuemSomos />

        <NossasSolucoes />

        <Depoimentos />

        <BlogPreview />

        <Contato />
      </main>
      <Footer />
      <PopupManager /> {/* Componente PopupManager adicionado aqui */}

      {/* Botão de teste - REMOVER DEPOIS */}
      <button
        onClick={() => {
          const event = new CustomEvent('test-popup')
          window.dispatchEvent(event)
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '15px 30px',
          background: '#00C896',
          color: '#0D1B2A',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 9999
        }}
      >
        TESTAR POP-UP
      </button>
    </div>
  );
}