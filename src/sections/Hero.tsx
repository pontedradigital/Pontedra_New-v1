import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // Hooks para animação de rolagem
  const controls = useAnimation();
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true, margin: "-100px" }); // Anima uma vez quando 100px da seção estiver visível

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // --- Fundo animado com linhas + movimento do mouse ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const lines: any[] = [];
    const lineCount = 30;
    const color1 = "#3B82F6";
    const color2 = "#9333EA";
    let mouseX = 0;
    let mouseY = 0;

    for (let i = 0; i < lineCount; i++) {
      lines.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1,
        length: 100 + Math.random() * 200,
        alpha: 0.2 + Math.random() * 0.3,
      });
    }

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.strokeStyle = gradient;

      lines.forEach((line) => {
        const dx = line.x - mouseX;
        const dy = line.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const parallax = Math.max(0, 100 - dist) * 0.02;

        ctx.globalAlpha = line.alpha;
        ctx.beginPath();
        ctx.moveTo(line.x + parallax, line.y + parallax);
        ctx.lineTo(line.x + line.length + parallax, line.y + parallax);
        ctx.stroke();

        line.y += line.speed;
        if (line.y > height) line.y = -line.length;
      });

      requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToId = (id: string) => {
    if (window.location.pathname !== "/landing") {
      navigate(`/landing#${id}`);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.scrollBy(0, -24); // Ajuste para a altura da navbar
      }
    }
  };

  // --- Efeito visual e estrutura da HERO ---
  return (
    <section
      ref={heroRef} // Anexa a referência para detectar a visibilidade
      id="hero"
      className="relative h-screen w-full flex flex-col justify-center items-center text-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />

      {/* Conteúdo principal do HERO com animações */}
      <motion.h1
        className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={controls}
        transition={{ duration: 1 }}
      >
        Soluções Digitais que Conectam Resultados
      </motion.h1>

      <motion.p
        className="text-lg md:text-2xl text-gray-200 mt-4 max-w-2xl"
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={controls}
        transition={{ delay: 0.3, duration: 1 }}
      >
        Transforme sua presença online em um fluxo constante de clientes.
      </motion.p>

      <motion.div
        className="mt-8 flex gap-4"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={controls}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <a
          href="#solucoes"
          onClick={(e)=>{e.preventDefault(); scrollToId('solucoes');}}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Ver Soluções
        </a>
        <a
          href="https://www.instagram.com/digitalpontevra/"
          target="_blank"
          rel="noreferrer"
          className="border border-white hover:bg-white hover:text-black text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Portfólio
        </a>
      </motion.div>

      {/* Checklist lateral com animações */}
      <motion.div
        className="absolute right-10 bottom-10 flex flex-col text-white gap-3"
        variants={{
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        }}
        initial="hidden"
        animate={controls}
        transition={{ delay: 0.8, duration: 1 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-xl">1.</span>
          <span>Identifique sua dor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-bold text-xl">2.</span>
          <span>Nós resolvemos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold text-xl">3.</span>
          <span>Conquiste resultados</span>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;