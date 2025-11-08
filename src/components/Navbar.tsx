"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [active, setActive] = useState<string>("hero");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // adiciona comportamento de rolagem suave por via CSS (fallback JS também usado)
    document.documentElement.style.scrollBehavior = "smooth";

    // Observe as seções para atualizar o link ativo
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActive(id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-40% 0px -40% 0px", // detecta a seção centralmente
        threshold: 0.01,
      }
    );

    document.querySelectorAll("section[id]").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    const nav = document.getElementById("pontedra-navbar");
    if (!section) {
      // If section is not on current page, navigate to landing and then scroll
      if (location.pathname !== "/landing") {
        navigate(`/landing#${id}`);
        // The useEffect in LandingPage will handle scrolling after navigation
        return;
      }
      return;
    }

    const navHeight = nav ? nav.getBoundingClientRect().height : 80;
    // calcula posição levando em conta navbar fixa
    const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8; // -8 px de folga
    window.scrollTo({ top, behavior: "smooth" });
  };

  const links = [
    { id: "hero", label: "Início" },
    { id: "quem-somos", label: "Quem Somos" },
    { id: "solucoes", label: "Soluções" },
    { id: "depoimentos", label: "Depoimentos" },
    { id: "blog", label: "Blog" },
    { id: "contato", label: "Contato" },
  ];

  const isAuthPage = location.pathname.includes("/login") || location.pathname.includes("/register");

  return (
    <nav
      id="pontedra-navbar"
      className="fixed top-0 left-0 w-full z-50 transition-colors duration-300"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <a href="/landing" className="text-white font-bold text-lg tracking-wide">
          <img src="/pontedra-logo.webp" alt="Pontedra Logo" className="h-10 w-auto" />
        </a>

        <ul className="hidden md:flex gap-8">
          {links.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => scrollToSection(l.id)}
                className={`text-sm font-medium transition-all duration-200 ${
                  active === l.id ? "text-[#57e389] scale-105" : "text-white/90 hover:text-[#57e389]"
                }`}
                aria-current={active === l.id ? "page" : undefined}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {!isAuthPage && (
            <>
              <a
                href="/login"
                className="hidden md:inline-block text-white/90 hover:text-white transition"
              >
                Entrar
              </a>
              <button
                onClick={() => {
                  window.location.href = "/login";
                }}
                className="bg-[#57e389] text-[#062026] px-4 py-2 rounded-full font-semibold hover:brightness-110 transition"
              >
                Acessar Plataforma
              </button>
            </>
          )}
          {/* hamburger para mobile */}
          <button
            onClick={() => {
              const menu = document.getElementById("mobile-nav");
              if (menu) menu.classList.toggle("hidden");
            }}
            className="md:hidden text-white ml-2"
            aria-label="Abrir menu"
          >
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}