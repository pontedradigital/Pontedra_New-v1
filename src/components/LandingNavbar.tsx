import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";

type LandingNavbarProps = { showCTA?: boolean; mode?: 'default' | 'backOnly' }

export default function LandingNavbar({ showCTA = true, mode = 'default' }: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const qs = document.getElementById("quem-somos");
      if (qs) {
        const navbarHeight = 80;
        const threshold = qs.getBoundingClientRect().top + window.scrollY - navbarHeight;
        setIsScrolled(window.scrollY >= threshold);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll as EventListener);
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
    if (location.pathname !== "/") {
      navigate("/");
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
      if (location.pathname === "/") {
        scrollToSection(target.substring(1));
      } else {
        navigate(`/${target}`);
      }
    } else {
      navigate(target);
    }
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { label: "Quem Somos", target: "#quem-somos", aria: "Ir para seção Quem Somos" },
    { label: "Soluções", target: "#solucoes", aria: "Ir para seção Soluções" },
    { label: "Depoimentos", target: "#depoimentos", aria: "Ir para seção Depoimentos" },
    { label: "Contato", target: "#contato", aria: "Ir para seção Contato" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-[#0c1624]/95 backdrop-blur-xl border-b border-[#1d2c3f]" : "bg-transparent"
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
              {/* Glow suave sem borda */}
              <div
                className="absolute -inset-6 blur-xl opacity-40"
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)",
                }}
              />

              <div className="relative z-10 flex items-center">
                <img
                  src="/pontedra-logo.webp"
                  alt="Pontedra Logo"
                  className="h-16 md:h-20 lg:h-24 w-auto drop-shadow-[0_0_18px_rgba(255,255,255,0.45)] brightness-150 contrast-125 saturate-125 scale-125 md:scale-150 lg:scale-[1.6] origin-center"
                />
              </div>
            </motion.button>

            {/* Desktop Menu */}
            {mode !== 'backOnly' && (
              <div className="hidden lg:flex items-center gap-8">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.target}
                    onClick={() => handleNavigation(item.target)}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-[#e1e8f0] hover:text-[#57e389] font-medium transition-colors duration-300 relative group"
                    aria-label={item.aria}
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#57e389] group-hover:w-full transition-all duration-300" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Desktop CTA Buttons */}
            {mode === 'backOnly' ? (
              <div className="hidden lg:flex items-center gap-4">
                <button
                  onClick={scrollToTop}
                  className="px-6 py-2.5 border-2 border-[#57e389] text-[#57e389] font-bold rounded-full hover:bg-[#57e389]/10 transition-all duration-300"
                >
                  Voltar ao Site
                </button>
              </div>
            ) : null}

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
                {mode !== 'backOnly' && (
                  <div className="flex flex-col gap-6 mb-8">
                    {menuItems.map((item, index) => (
                      <motion.button
                        key={item.target}
                        onClick={() => handleNavigation(item.target)}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-left text-[#e1e8f0] hover:text-[#57e389] font-medium text-xl transition-colors duration-300 py-3 border-b border-[#1d2c3f]/50"
                        aria-label={item.aria}
                      >
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Mobile CTA Buttons */}
                {mode === 'backOnly' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col gap-4 mt-auto mb-8"
                  >
                    <button
                      onClick={scrollToTop}
                      className="w-full text-center px-6 py-3 border-2 border-[#57e389] text-[#57e389] font-bold rounded-full hover:bg-[#57e389]/10 transition-all duration-300"
                    >
                      Voltar ao Site
                    </button>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
