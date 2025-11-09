import React, { useEffect, useState, useRef, useCallback } from "react";
import LandingNavbar from "@/components/LandingNavbar";
import Hero from "@/sections/Hero";
import Footer from "@/sections/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import QuemSomos from "@/components/landing/QuemSomos";
import NossasSolucoes from "@/sections/NossasSolucoes";
import Depoimentos from "@/sections/Depoimentos";
import { Contato } from "@/sections/Contato";
import BlogPreview from "@/sections/BlogPreview";
import LeadCapturePopup from "@/components/LeadCapturePopup"; // Nova importação

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const solucoesRef = useRef<HTMLElement>(null); // Ref para a seção "Soluções"

  const [showPopup, setShowPopup] = useState(false);
  const [popupShownInSession, setPopupShownInSession] = useState(false); // Rastreia se o pop-up foi mostrado na sessão atual

  // Verifica sessionStorage na montagem do componente
  useEffect(() => {
    if (sessionStorage.getItem('popupShown')) {
      setPopupShownInSession(true);
    }
  }, []);

  // Função para acionar o pop-up se ainda não foi mostrado na sessão
  const triggerPopup = useCallback(() => {
    if (!popupShownInSession) {
      setShowPopup(true);
      sessionStorage.setItem('popupShown', 'true');
      setPopupShownInSession(true);
    }
  }, [popupShownInSession]);

  // Condição 1: Mostrar pop-up após 6 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerPopup();
    }, 6000); // 6 segundos

    return () => clearTimeout(timer);
  }, [triggerPopup]);

  // Condição 2: Mostrar pop-up quando a seção "Soluções" estiver visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerPopup();
        }
      },
      { threshold: 0.5 } // Aciona quando 50% da seção está visível
    );

    if (solucoesRef.current) {
      observer.observe(solucoesRef.current);
    }

    return () => {
      if (solucoesRef.current) {
        observer.unobserve(solucoesRef.current);
      }
    };
  }, [triggerPopup]);

  // Condição 3: Mostrar pop-up quando o usuário retorna à página
  useEffect(() => {
    let lastHiddenTime = 0;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastHiddenTime = Date.now();
      } else if (document.visibilityState === 'visible') {
        const hiddenDuration = Date.now() - lastHiddenTime;
        if (hiddenDuration > 3000) { // Se ficou oculto por mais de 3 segundos, considera um retorno
          triggerPopup();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [triggerPopup]);

  // Este useEffect lida com a rolagem para uma seção se houver um hash na URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const section = document.getElementById(id);
      if (section) {
        const navHeight = 80; // Altura fixa da LandingNavbar
        const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [location.hash]);

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleLeadCaptured = () => {
    // Esta função é chamada quando um lead é capturado, mas a lógica de 'popupShownInSession'
    // já é tratada por 'triggerPopup' e 'sessionStorage'.
    console.log("Lead capturado do pop-up.");
  };

  return (
    <div className="font-sans bg-bgMain text-textPrimary min-h-screen">
      <LandingNavbar />
      <main className="pt-16">
        <section id="hero">
          <Hero />
        </section>

        <QuemSomos />

        <section id="solucoes" ref={solucoesRef}> {/* Anexa a ref aqui */}
          <NossasSolucoes />
        </section>

        <Depoimentos />

        <BlogPreview />

        <Contato />
      </main>
      <Footer />
      <LeadCapturePopup
        isOpen={showPopup}
        onClose={handlePopupClose}
        onLeadCaptured={handleLeadCaptured}
      />
    </div>
  );
}