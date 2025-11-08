import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const menuItems = [
    { label: "Quem Somos", section: "quem-somos" },
    { label: "Soluções", section: "solucoes" },
    { label: "Depoimentos", section: "depoimentos" },
    { label: "Blog", section: "blog" },
    { label: "Contato", section: "contato" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0c1624]/80 backdrop-blur-xl shadow-lg border-b border-[#1d2c3f]/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Clicável para voltar ao topo */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-[#57e389]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="/pontedra-logo.webp"
              alt="Pontedra Logo"
              className="h-16 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(87,227,137,0.5)]"
            />
          </motion.button>

          {/* Menu Items */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.section}
                onClick={() => scrollToSection(item.section)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-[#e1e8f0] hover:text-[#57e389] font-medium transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#57e389] group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[#e1e8f0] hover:text-[#57e389] font-medium transition-colors duration-300"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              className="px-6 py-2.5 bg-[#57e389] text-[#0D1B2A] font-bold rounded-full hover:bg-[#00ffae] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#57e389]/30"
            >
              Acessar Plataforma
            </Link>
          </div>

          {/* Mobile Menu Button (opcional - adicionar se necessário) */}
          <button className="md:hidden text-[#e1e8f0]">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}