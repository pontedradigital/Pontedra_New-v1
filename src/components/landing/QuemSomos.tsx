"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Target, Eye, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

const QuemSomos = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse move for spotlight and parallax tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  };

  const iconPulseVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: [0, 5, -5, 0], // Subtle rotation effect
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
        delay: 0.1,
      },
    },
  };

  // Parallax tilt for cards
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [0, sectionRef.current?.offsetHeight || 0], [10, -10]);
  const rotateY = useTransform(x, [0, sectionRef.current?.offsetWidth || 0], [-10, 10]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
    }
  };

  const handleCardMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section
      id="quem-somos"
      ref={sectionRef}
      className="relative py-20 md:py-32 bg-pontedra-dark border-t border-border overflow-hidden"
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      style={{
        cursor: "url('/public/cursor-default.png'), auto", // Default cursor
      }}
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(87, 227, 137, 0.15) 0%, transparent 50%)`,
          transition: 'background 0.1s ease-out',
        }}
      >
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        {/* Floating Orbs */}
        <div className="absolute w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-float-delay-0 top-1/4 left-1/4 will-change-transform"></div>
        <div className="absolute w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-float-delay-1 bottom-1/3 right-1/3 will-change-transform"></div>
        <div className="absolute w-52 h-52 bg-primary/10 rounded-full blur-3xl animate-float-delay-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"></div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l border-t border-primary/30 rounded-br-2xl"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r border-b border-primary/30 rounded-tl-2xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 100, damping: 10, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pontedra-neon-green to-primary mb-4 text-glow relative pb-2"
        >
          QUEM SOMOS
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-pontedra-neon-green to-primary rounded-full"
          ></motion.span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed p-6 rounded-2xl border border-border bg-card/30 backdrop-blur-sm"
        >
          Somos apaixonados por transformar ideias em conexões reais. A{" "}
          <span className="text-primary font-semibold">Pontedra</span> nasceu para aproximar marcas e pessoas, ajudando{" "}
          <span className="text-primary font-semibold">Pequenas e Médias Empresas e Profissionais Liberais</span> a crescerem no digital com propósito. Unimos estratégia, criatividade e tecnologia para entregar resultados autênticos — aqueles que fortalecem marcas, geram confiança e fazem o seu negócio evoluir de verdade.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000"
        >
          {/* Card 1 - Missão */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotateX: -5, rotateY: 5, z: 50, boxShadow: "0 0 30px rgba(87, 227, 137, 0.4)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-lg backdrop-blur-md bg-noise-texture card-border-gradient quem-somos-card-hover"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Icon with enhanced effects */}
            <motion.div
              variants={iconPulseVariants}
              initial="rest"
              whileHover="hover"
              className="relative w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-primary to-pontedra-neon-green icon-glow icon-rotate"
            >
              <Target className="h-8 w-8 text-primary-foreground relative z-10" />
              <span className="icon-pulse-ring"></span>
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Missão</h3>
            <p className="text-muted-foreground">
              Conectar empresas e pessoas por meio do marketing digital, tornando o ambiente online acessível e estratégico para todos os negócios.
            </p>
          </motion.div>

          {/* Card 2 - Visão */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotateX: -5, rotateY: 5, z: 50, boxShadow: "0 0 30px rgba(87, 227, 137, 0.4)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-lg backdrop-blur-md bg-noise-texture card-border-gradient quem-somos-card-hover"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              variants={iconPulseVariants}
              initial="rest"
              whileHover="hover"
              className="relative w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-primary to-pontedra-neon-green icon-glow icon-rotate"
            >
              <Eye className="h-8 w-8 text-primary-foreground relative z-10" />
              <span className="icon-pulse-ring"></span>
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Visão</h3>
            <p className="text-muted-foreground">
              Ser referência em soluções digitais inteligentes, práticas e acessíveis para pequenas e médias empresas.
            </p>
          </motion.div>

          {/* Card 3 - Valores */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotateX: -5, rotateY: 5, z: 50, boxShadow: "0 0 30px rgba(87, 227, 137, 0.4)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-lg backdrop-blur-md bg-noise-texture card-border-gradient quem-somos-card-hover"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              variants={iconPulseVariants}
              initial="rest"
              whileHover="hover"
              className="relative w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-primary to-pontedra-neon-green icon-glow icon-rotate"
            >
              <Handshake className="h-8 w-8 text-primary-foreground relative z-10" />
              <span className="icon-pulse-ring"></span>
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Valores</h3>
            <ul className="text-muted-foreground list-disc list-inside text-left space-y-1">
              <li>Clareza e simplicidade na comunicação</li>
              <li>Foco em resultados reais</li>
              <li>Parceria e transparência</li>
              <li>Inovação constante</li>
              <li>Ética e responsabilidade</li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 text-primary/20 animate-float-delay-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <Target className="w-10 h-10" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 right-1/4 text-primary/20 animate-float-delay-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <Eye className="w-12 h-12" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-1/2 text-primary/20 animate-float-delay-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          <Handshake className="w-14 h-14" />
        </motion.div>
      </div>
    </section>
  );
};

export default QuemSomos;