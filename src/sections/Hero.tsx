import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const controls = useAnimation();
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true, margin: "-100px" });

  // State para a posição do mouse para o gradiente dinâmico
  const [gradientPosition, setGradientPosition] = useState({ x: '50%', y: '50%' });
  const heroSectionRef = useRef<HTMLElement>(null); // Ref para o div de overlay do gradiente

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // --- Fundo animado com partículas e linhas curvas ---
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

    const handleMouseMoveCanvas = (e: MouseEvent) => {
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

    window.addEventListener("mousemove", handleMouseMoveCanvas);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("mousemove", handleMouseMoveCanvas);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Efeito para o gradiente dinâmico
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (heroSectionRef.current) {
        const rect = heroSectionRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100; // Posição em porcentagem
        const y = ((event.clientY - rect.top) / rect.height) * 100; // Posição em porcentagem
        setGradientPosition({ x: `${x}%`, y: `${y}%` });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
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
      {/* Overlay para o gradiente dinâmico */}
      <div
        ref={heroSectionRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          '--x': gradientPosition.x,
          '--y': gradientPosition.y,
          background: `radial-gradient(circle at var(--x) var(--y), rgba(28, 44, 32, 0.5) 0%, rgba(11, 17, 29, 0.8) 80%)`,
          transition: 'background-position 0.1s ease-out',
        } as React.CSSProperties}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
        {/* Conteúdo principal (esquerda) */}
        <div className="max-w-xl text-center lg:text-left">
          <p
            className="text-pontedra-title-green font-medium mb-2 opacity-0 animate-fadeInUp"
            style={{ animationDelay: '0.1s' }}
          >
            💡 Soluções Web para PMEs e Profissionais
          </p>

          <h1
            className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 opacity-0 animate-fadeInUp motion-safe:animate-pulse-slow"
            style={{ animationDelay: '0.2s' }}
          >
            Conectamos sua empresa a <span className="text-pontedra-title-green">pessoas</span>
          </h1>

          <p
            className="mt-6 text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 opacity-0 animate-fadeInUp motion-safe:animate-pulse-slow"
            style={{ animationDelay: '0.4s' }}
          >
            Construímos pontes digitais que conectam sua marca a clientes reais, impulsionando resultados com autenticidade, tecnologia e inteligência estratégica.
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-fadeIn"
            style={{ animationDelay: '0.6s' }}
          >
            <a
              href="#solucoes"
              onClick={(e)=>{e.preventDefault(); scrollToId('solucoes');}}
              className="bg-pontedra-button-green text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 hover:shadow-[0_0_15px_#5FF07780] transition-all duration-700 ease-out"
            >
              Ver Soluções
            </a>
            <a
              href="https://www.instagram.com/digitalpontevra/"
              target="_blank"
              rel="noreferrer"
              className="border border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-black hover:scale-105 hover:shadow-[0_0_15px_#5FF07780] transition-all duration-700 ease-out"
            >
              Ver Portfólio
            </a>
          </div>
        </div>

        {/* Caixas numeradas com gradiente animado e glow pulsante */}
        <div className="relative flex flex-col space-y-6 mt-12 md:mt-0">
          {[
            { id: 1, text: 'Atraia mais' },
            { id: 2, text: 'Venda melhor' },
            { id: 3, text: 'Seu sucesso acontece' }
          ].map((item, index) => (
            <motion.div
              key={item.id}
              className={`group flex items-center gap-4 relative overflow-hidden rounded-2xl py-6 px-8
                         bg-gradient-to-b from-pontedra-green-light/20 to-pontedra-green/10
                         border border-lime-400/30 shadow-lg shadow-pontedra-title-green/10
                         backdrop-blur-sm transition-all duration-500 ease-out`}
              whileHover={{ y: -4, boxShadow: "0 0 20px rgba(163, 230, 53, 0.25)" }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-pontedra-button-green text-black font-bold text-lg">
                {item.id}
              </div>
              <p className="text-white font-semibold text-lg">{item.text}</p>

              {/* camada de brilho pulsante sutil */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-pontedra-title-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;