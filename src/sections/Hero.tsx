import React, { useRef, useState, useMemo, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react"; // Updated imports

// Componente de partículas flutuantes (memoizado para evitar recalcular posições)
const FloatingParticles = React.memo(({ count = 30 }: { count?: number }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 3,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#57e389] rounded-full"
          style={{ left: `${p.left}%`, top: `${p.top}%`, willChange: "transform, opacity" }}
          animate={{ y: [0, -40, 0], opacity: [0.1, 0.6, 0.1], scale: [1, 2, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
});

// Componente de Grid 3D Animado (memoizado)
const Grid3D = React.memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#57e389"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
          <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#57e389" stopOpacity="0" />
            <stop offset="50%" stopColor="#57e389" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#57e389" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
    </div>
  );
});

// Card de benefício animado e expansível
const BenefitCard = ({
  number,
  title,
  desc,
  delay,
  index,
  active,
  setActive,
}: {
  number: string;
  title: string;
  desc: string;
  delay: number;
  index: number;
  active: number | null;
  setActive: (n: number | null) => void;
}) => {
  const isActive = active === index;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay, ease: "easeInOut", layout: { duration: 0.7, ease: "easeInOut" } }}
      onPointerEnter={() => setActive(index)}
      onClick={() => setActive(isActive ? null : index)}
      aria-expanded={isActive}
      className="bg-[#0f1f1a]/60 backdrop-blur-sm border border-[#57e389]/20 rounded-2xl overflow-hidden"
      style={{ willChange: "transform, opacity" }}
    >
      <div className="flex items-center gap-4 p-4 cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#57e389] to-[#00b4ff] flex items-center justify-center text-[#0D1B2A] font-bold text-lg flex-shrink-0">
          {number}
        </div>
        <h3 className="text-[#e1e8f0] font-semibold text-base">{title}</h3>
      </div>
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            layout
            key="desc"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { delay: 0.05, duration: 0.7, ease: "easeInOut" } }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="px-4 pb-4"
          >
            <p className="text-sm text-[#9ba8b5] leading-relaxed" aria-live="polite">
              {desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const perfMode = useMemo(() => {
    const rm = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = (typeof navigator !== "undefined" ? navigator : undefined) as (Navigator & { deviceMemory?: number }) | undefined;
    const hc = !!nav && typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
    const dm = !!nav && typeof nav.deviceMemory === "number" && (nav.deviceMemory as number) <= 4;
    return Boolean(rm || hc || dm);
  }, []);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 768px)").matches
      : false
  })

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      const mq = window.matchMedia("(max-width: 768px)")
      const handler = () => setIsMobile(mq.matches)
      mq.addEventListener?.("change", handler)
      handler()
      return () => mq.removeEventListener?.("change", handler)
    }
  }, [])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const navHeight = 80;
      const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handlePortfolioClick = () => {
    const phone = "5511978777308";
    const text = encodeURIComponent("Olá! Gostaria de ver o portfólio e alguns cases da Pontedra.");
    const url = `https://wa.me/${phone}?text=${text}`;
    const opened = window.open(url, "_blank");
    if (!opened) {
      scrollToSection("contato");
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0c1624] via-[#0c1624] to-[#0a1520]"
    >
      {/* Background Effects */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0c1624] to-transparent pointer-events-none z-[5]" />
      <Grid3D />
      <FloatingParticles count={perfMode ? 12 : 30} />

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#57e389]/10 rounded-full"
        style={{ filter: `blur(${perfMode ? 40 : 100}px)` }}
        animate={perfMode || isMobile ? { opacity: 0.25 } : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: perfMode || isMobile ? 0.01 : 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00b4ff]/10 rounded-full"
        style={{ filter: `blur(${perfMode ? 40 : 100}px)` }}
        animate={perfMode || isMobile ? { opacity: 0.25 } : { scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: perfMode || isMobile ? 0.01 : 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content Container */}
      <motion.div
        style={{ y, opacity: isMobile ? undefined : opacity }}
        className="container mx-auto px-4 md:px-8 relative z-10 pb-24 md:pb-0"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#57e389]/10 border border-[#57e389]/30 rounded-full px-4 py-2 backdrop-blur-sm supports-[backdrop-filter:blur(2px)]:backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-[#57e389]" />
              <span className="text-[#57e389] text-sm font-medium uppercase tracking-wider">
                💡 Soluções Web para PMEs e Profissionais
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                <span className="text-white">Conectamos sua</span>
                <br />
                <span className="text-white">empresa a </span>
                <span className="bg-gradient-to-r from-[#00ffae] via-[#57e389] to-[#00b4ff] bg-clip-text text-transparent">
                  pessoas
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-[#9ba8b5] text-lg md:text-xl leading-relaxed max-w-xl"
            >
              Construímos pontes digitais que conectam sua marca a clientes reais,
              impulsionando resultados com autenticidade, tecnologia e inteligência estratégica.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button
                className="group relative px-8 py-4 bg-[#57e389] text-[#0D1B2A] font-bold rounded-full overflow-hidden shadow-lg shadow-[#57e389]/30 hover:shadow-[#57e389]/50 transition-all duration-700 hover:scale-103"
                onClick={() => scrollToSection("solucoes")}
                aria-label="Ir para a seção Soluções"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Ver Soluções
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#00ffae] to-[#57e389]"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.7 }}
                />
              </button>

              <button
                className="px-8 py-4 bg-transparent border-2 border-[#57e389]/50 text-[#e1e8f0] font-bold rounded-full hover:bg-[#57e389]/10 hover:border-[#57e389] transition-all duration-700 hover:scale-103"
                onClick={handlePortfolioClick}
                aria-label="Abrir contato para ver Portfólio"
              >
                Ver Portfólio
              </button>
          </motion.div>
        </div>

        {/* Right Side - Benefit Cards */}
        <motion.div layout className="space-y-4" onMouseLeave={() => setActiveCard(null)}>
            <BenefitCard
              number="1"
              title="Atraia mais"
              desc="Aproximamos pessoas reais da sua marca com conteúdos autênticos, SEO e presença digital que geram interesse e iniciam conversas de verdade."
              delay={1.0}
              index={0}
              active={activeCard}
              setActive={setActiveCard}
            />
            <BenefitCard
              number="2"
              title="Venda melhor"
              desc="Com comunicação clara e empática, ampliamos seu alcance e confiança, transformando interesse em relacionamentos duradouros que geram resultados."
              delay={1.2}
              index={1}
              active={activeCard}
              setActive={setActiveCard}
            />
            <BenefitCard
              number="3"
              title="Seu sucesso acontece"
              desc="Histórias bem contadas e experiências consistentes conectam, fidelizam e fazem sua marca crescer de forma sustentável. O sucesso vem naturalmente."
              delay={1.4}
              index={2}
              active={activeCard}
              setActive={setActiveCard}
            />
          </motion.div>
          <div className="md:hidden flex flex-col items-center gap-2 text-[#57e389] mt-8">
            <span className="text-sm font-medium">Scroll</span>
            <div className="w-6 h-10 border-2 border-[#57e389] rounded-full flex items-start justify-center p-1">
              <motion.div
                className="w-1.5 h-3 bg-[#57e389] rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-[#57e389]"
        >
          <span className="text-sm font-medium">Scroll</span>
          <div className="w-6 h-10 border-2 border-[#57e389] rounded-full flex items-start justify-center p-1">
            <motion.div
              className="w-1.5 h-3 bg-[#57e389] rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
