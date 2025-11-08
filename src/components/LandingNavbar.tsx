import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/landing") {
      navigate("/landing");
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (target: string) => {
    if (target.startsWith("#")) {
      if (location.pathname === "/landing") {
        scrollToSection(target.substring(1));
      } else {
        navigate(`/landing${target}`);
      }
    } else {
      navigate(target);
    }
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { label: "Quem Somos", target: "#quem-somos" },
    { label: "Soluções", target: "#solucoes" },
    { label: "Depoimentos", target: "#depoimentos" },
    { label: "Blog", target: "/blog" },
    { label: "Contato", target: "#contato" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#0c1624]/95 backdrop-blur-xl shadow-lg border-b border-[#1d2c3f]/50"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-24 md:h-28">
            {/* Logo */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer z-50"
            >
              <motion.div
                className="absolute inset-0 bg-[#57e389]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <div className="relative z-10 flex items-center gap-3">
                <img
                  src="/pontedra-logo.webp"
                  alt="Pontedra Logo"
                  className="h-16 md:h-20 lg:h-24 w-auto drop-shadow-[0_0_20px_rgba(87,227,137,0.6)] transition-all duration-300"
                />
              </div>
            </motion.button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.target}
                  onClick={() => handleNavigation(item.target)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-[#e1e8f0] hover:text-[#57e389] font-medium transition-colors duration-300 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#57e389] group-hover:w-full transition-all duration-300" />
                </motion.button>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => handleNavigation("/login")}
                className="text-[#e1e8f0] hover:text-[#57e389] font-medium transition-colors duration-300"
              >
                Entrar
              </button>
              <button
                onClick={() => handleNavigation("/login")}
                className="px-6 py-2.5 bg-[#57e389] text-[#0D1B2A] font-bold rounded-full hover:bg-[#00ffae] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#57e389]/30"
              >
                Acessar Plataforma
            </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-[#e1e8f0] hover:text-[#57e389] transition-colors z-50 p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#0c1624]/98 backdrop-blur-xl z-40 lg:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute right-0 top-0 h-full w-full sm:w-80 bg-[#0D1B2A] border-l border-[#1d2c3f] shadow-2xl"
            >
              <div className="flex flex-col h-full pt-24 px-8">
                {/* Mobile Menu Items */}
                <div className="flex flex-col gap-6 mb-8">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.target}
                      onClick={() => handleNavigation(item.target)}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-left text-[#e1e8f0] hover:text-[#57e389] font-medium text-xl transition-colors duration-300 py-3 border-b border-[#1d2c3f]/50"
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </div>

                {/* Mobile CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col gap-4 mt-auto mb-8"
                >
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="w-full text-center px-6 py-3 border-2 border-[#57e389] text-[#57e389] font-bold rounded-full hover:bg-[#57e389]/10 transition-all duration-300"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="w-full text-center px-6 py-3 bg-[#57e389] text-[#0D1B2A] font-bold rounded-full hover:bg-[#00ffae] transition-all duration-300 shadow-lg shadow-[#57e389]/30"
                  >
                    Acessar Plataforma
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}