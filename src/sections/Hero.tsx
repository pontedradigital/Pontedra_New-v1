import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const controls = useAnimation();
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // --- Fundo animado com partículas e linhas curvas + movimento do mouse ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: any[] = [];
    const particleCount = 50;
    const particleColor = "#A8E063"; // Cor verde para as partículas
    const particleSize = 1.5;

    const lines: any[] = [];
    const lineCount = 15;
    const lineColor1 = "#1C2C20"; // Verde escuro para as linhas
    const lineColor2 = "#2C3E30"; // Verde um pouco mais claro para as linhas
    const lineThickness = 1;

    let mouseX = width / 2;
    let mouseY = height / 2;

    // Inicializa partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        alpha: 0.3 + Math.random() * 0.5,
      });
    }

    // Inicializa linhas curvas
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        x: Math.random() * width,
        y: Math.random() * height,
        controlX1: Math.random() * width,
        controlY1: Math.random() * height,
        controlX2: Math.random() * width,
        controlY2: Math.random() * height,
        endX: Math.random() * width,
        endY: Math.random() * height,
        speed: 0.05 + Math.random() * 0.1,
        alpha: 0.1 + Math.random() * 0.2,
        color: i % 2 === 0 ? lineColor1 : lineColor2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Desenha partículas
      particles.forEach((p) => {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const parallaxFactor = Math.max(0, 1 - dist / 300) * 5; // Efeito mais forte perto do mouse

        p.x += p.speedX + (dx / dist) * parallaxFactor * 0.1;
        p.y += p.speedY + (dy / dist) * parallaxFactor * 0.1;

        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${parseInt(particleColor.slice(1, 3), 16)}, ${parseInt(particleColor.slice(3, 5), 16)}, ${parseInt(particleColor.slice(5, 7), 16)}, ${p.alpha})`;
        ctx.fill();
      });

      // Desenha linhas curvas
      lines.forEach((line) => {
        const dx = line.x - mouseX;
        const dy = line.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const parallaxFactor = Math.max(0, 1 - dist / 400) * 10;

        ctx.globalAlpha = line.alpha;
        ctx.strokeStyle = line.color;
        ctx.lineWidth = lineThickness;
        ctx.beginPath();
        ctx.moveTo(line.x + (dx / dist) * parallaxFactor, line.y + (dy / dist) * parallaxFactor);
        ctx.bezierCurveTo(
          line.controlX1 + (dx / dist) * parallaxFactor * 0.5,
          line.controlY1 + (dy / dist) * parallaxFactor * 0.5,
          line.controlX2 + (dx / dist) * parallaxFactor * 0.7,
          line.controlY2 + (dy / dist) * parallaxFactor * 0.7,
          line.endX + (dx / dist) * parallaxFactor,
          line.endY + (dy / dist) * parallaxFactor
        );
        ctx.stroke();

        // Move as linhas lentamente
        line.x += line.speed;
        line.y += line.speed * 0.5; // Movimento mais lento na vertical
        line.controlX1 += line.speed * 0.8;
        line.controlY1 += line.speed * 0.3;
        line.controlX2 += line.speed * 0.6;
        line.controlY2 += line.speed * 0.7;
        line.endX += line.speed * 0.9;
        line.endY += line.speed * 0.4;

        // Reinicia a posição se sair da tela
        if (line.x > width + 200 || line.y > height + 200) {
          line.x = -200;
          line.y = Math.random() * height;
          line.controlX1 = Math.random() * width;
          line.controlY1 = Math.random() * height;
          line.controlX2 = Math.random() * width;
          line.controlY2 = Math.random() * height;
          line.endX = Math.random() * width;
          line.endY = Math.random() * height;
        }
      });

      requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Re-inicializar posições para evitar que elementos fiquem fora da tela após redimensionamento
      particles.forEach(p => {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
      });
      lines.forEach(line => {
        line.x = Math.random() * width;
        line.y = Math.random() * height;
        line.controlX1 = Math.random() * width;
        line.controlY1 = Math.random() * height;
        line.controlX2 = Math.random() * width;
        line.controlY2 = Math.random() * height;
        line.endX = Math.random() * width;
        line.endY = Math.random() * height;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
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
    <section
      ref={heroRef}
      id="hero"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-pontedra-hero-bg-dark"
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Conteúdo principal (esquerda) */}
        <div className="text-center lg:text-left">
          <motion.p
            className="text-sm font-semibold text-pontedra-title-green mb-2"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate={controls}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            💡 Soluções Web para PMEs e Profissionais
          </motion.p>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-lg"
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate={controls}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Conectamos sua empresa a <span className="text-pontedra-title-green">pessoas</span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-pontedra-subtitle-gray mt-4 max-w-xl mx-auto lg:mx-0"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate={controls}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Construímos pontes digitais que conectam sua marca a clientes reais, impulsionando resultados com autenticidade, tecnologia e inteligência estratégica.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate={controls}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <a
              href="#solucoes"
              onClick={(e)=>{e.preventDefault(); scrollToId('solucoes');}}
              className="bg-pontedra-button-green hover:bg-pontedra-button-green-hover text-pontedra-dark-text px-6 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-lg"
            >
              Ver Soluções
            </a>
            <a
              href="https://www.instagram.com/digitalpontevra/"
              target="_blank"
              rel="noreferrer"
              className="border border-white hover:bg-pontedra-title-green hover:text-pontedra-dark-text text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-lg"
            >
              Ver Portfólio
            </a>
          </motion.div>
        </div>

        {/* Checklist lateral (direita) */}
        <motion.div
          className="hidden lg:flex flex-col items-end justify-center space-y-6"
          variants={{
            hidden: { opacity: 0, x: 50 },
            visible: { opacity: 1, x: 0 },
          }}
          initial="hidden"
          animate={controls}
          transition={{ delay: 1.0, duration: 1 }}
        >
          {/* Card 1 */}
          <div className="bg-gradient-to-b from-[#5FF077]/15 to-[#45D060]/15 backdrop-blur-sm rounded-2xl px-6 py-4 w-[300px] h-[90px] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] animate-float-delay-0 shadow-inner shadow-[#5FF077]/10 border border-pontedra-line-green-dark relative overflow-hidden group flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-pontedra-line-green-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pontedra-button-green flex items-center justify-center text-pontedra-dark-text font-bold text-lg">
                1
              </div>
              <span className="text-white text-xl font-semibold">Atraia mais</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-gradient-to-b from-[#45D060]/15 to-[#35A050]/15 backdrop-blur-sm rounded-2xl px-6 py-4 w-[300px] h-[90px] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] animate-float-delay-1 shadow-inner shadow-[#5FF077]/10 border border-pontedra-line-green-dark relative overflow-hidden group flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-pontedra-line-green-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pontedra-button-green flex items-center justify-center text-pontedra-dark-text font-bold text-lg">
                2
              </div>
              <span className="text-white text-xl font-semibold">Venda melhor</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-gradient-to-b from-[#35A050]/15 to-[#2A7B49]/15 backdrop-blur-sm rounded-2xl px-6 py-4 w-[300px] h-[90px] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] animate-float-delay-2 shadow-inner shadow-[#5FF077]/10 border border-pontedra-line-green-dark relative overflow-hidden group flex items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-pontedra-line-green-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pontedra-button-green flex items-center justify-center text-pontedra-dark-text font-bold text-lg">
                3
              </div>
              <span className="text-white text-xl font-semibold">Seu sucesso acontece</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;