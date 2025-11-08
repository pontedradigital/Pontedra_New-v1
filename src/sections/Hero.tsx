import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const lines: any[] = [];
    const lineCount = 30;
    // Usando as cores neon do tailwind.config.ts
    const color1 = "hsl(var(--pontedra-neon-blue))";
    const color2 = "hsl(var(--pontedra-neon-green))";

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
        ctx.globalAlpha = line.alpha;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + line.length, line.y);
        ctx.stroke();

        line.y += line.speed;
        if (line.y > height) line.y = -line.length;
      });

      requestAnimationFrame(draw);
    };

    draw();

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

  return (
    <section id="hero" className="relative h-screen w-full flex flex-col justify-center items-center text-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />

      {/* Conteúdo principal do HERO */}
      <motion.h1
        className="text-5xl md:text-7xl font-bold text-foreground drop-shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Soluções Digitais que Conectam Resultados
      </motion.h1>

      <motion.p
        className="text-lg md:text-2xl text-textSecondary mt-4 max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        Transforme sua presença online em um fluxo constante de clientes.
      </motion.p>

      <div className="mt-8 flex gap-4">
        <a
          href="#solucoes"
          onClick={(e)=>{e.preventDefault(); scrollToId('solucoes');}}
          className="bg-pontedra-green hover:bg-pontedra-green-hover text-pontedra-dark-text px-6 py-3 rounded-xl font-semibold transition"
        >
          Ver Soluções
        </a>
        <a
          href="https://www.instagram.com/digitalpontevra/"
          target="_blank"
          rel="noreferrer"
          className="border border-pontedra-border-light hover:bg-pontedra-green hover:text-pontedra-dark-text text-textPrimary px-6 py-3 rounded-xl font-semibold transition"
        >
          Portfólio
        </a>
      </div>

      {/* Checklist lateral */}
      <div className="absolute right-10 bottom-10 flex flex-col text-foreground gap-3">
        <div className="flex items-center gap-2">
          <span className="text-pontedra-green font-bold">1.</span>
          <span>Identifique sua dor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-pontedra-green font-bold">2.</span>
          <span>Nós resolvemos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-pontedra-green font-bold">3.</span>
          <span>Transforme em resultados</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;