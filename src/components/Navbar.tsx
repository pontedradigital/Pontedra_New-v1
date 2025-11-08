import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = document.getElementById("quem-somos");
    if (!target) {
      // Fallback if "quem-somos" is not found (e.g., on other pages)
      const onScroll = () => {
        setSolid(window.scrollY > window.innerHeight - 120); // Adjust threshold as needed
      };
      window.addEventListener("scroll", onScroll);
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If "quem-somos" is intersecting (meaning it's visible), navbar should be transparent.
          // If it's NOT intersecting (meaning we've scrolled past it or are above it), navbar should be solid.
          // The user wants solid when the *next* section reaches the top, so `!entry.isIntersecting` is correct for that.
          setSolid(!entry.isIntersecting);
        });
      },
      { root: null, threshold: 0.05 } // Trigger when 5% of the target is visible
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [location]);

  const isAuthPage = location.pathname.includes("/login") || location.pathname.includes("/register");

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/landing") {
      navigate(`/landing#${id}`);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.scrollBy(0, -20); // Ajuste para a altura da navbar
      }
    }
  };

  const navClass = solid
    ? "bg-pontedra-hero-bg-dark/90 backdrop-blur-sm border-b border-border shadow-sm" // Usando a nova cor de fundo do Hero
    : "bg-transparent";

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${navClass}`}>
      <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <a href="/landing" className="text-pontedra-green font-bold text-lg tracking-wide">
          <img src="/pontedra-logo.webp" alt="Pontedra Logo" className="h-7 w-auto" />
        </a>

        <div className="hidden md:flex items-center gap-8 text-textPrimary">
          <button onClick={() => scrollToSection("hero")} className="hover:text-pontedra-green transition">Início</button>
          <button onClick={() => scrollToSection("quem-somos")} className="hover:text-pontedra-green transition">Quem Somos</button>
          <button onClick={() => scrollToSection("solucoes")} className="hover:text-pontedra-green transition">Soluções</button>
          <button onClick={() => scrollToSection("depoimentos")} className="hover:text-pontedra-green transition">Depoimentos</button>
          <button onClick={() => scrollToSection("blog")} className="hover:text-pontedra-green transition">Blog</button>
          <button onClick={() => scrollToSection("contato")} className="hover:text-pontedra-green transition">Contato</button>
        </div>

        {!isAuthPage && (
          <a href="/login" className="hidden md:inline-block bg-pontedra-green text-pontedra-dark-text px-5 py-2 rounded-full font-semibold hover:bg-pontedra-green-hover transition">Acessar Plataforma</a>
        )}
      </nav>
    </header>
  );
}