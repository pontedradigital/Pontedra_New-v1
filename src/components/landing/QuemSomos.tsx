"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Handshake } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn for conditional classNames

const QuemSomos = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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

  return (
    <section id="quem-somos" className="py-20 md:py-32 bg-pontedra-dark border-t border-border">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold text-primary mb-4"
        >
          QUEM SOMOS
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          variants={itemVariants}
          className="text-lg text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Card 1 - Missão */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(87, 227, 137, 0.2)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-lg"
          >
            <motion.div
              variants={iconPulseVariants}
              initial="rest"
              whileHover="hover"
              className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6 border border-primary/30"
            >
              <Target className="h-8 w-8 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Missão</h3>
            <p className="text-muted-foreground">
              Conectar empresas e pessoas por meio do marketing digital, tornando o ambiente online acessível e estratégico para todos os negócios.
            </p>
          </motion.div>

          {/* Card 2 - Visão */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(87, 227, 137, 0.2)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-lg"
          >
            <motion.div
              variants={iconPulseVariants}
              initial="rest"
              whileHover="hover"
              className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6 border border-primary/30"
            >
              <Eye className="h-8 w-8 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Visão</h3>
            <p className="text-muted-foreground">
              Ser referência em soluções digitais inteligentes, práticas e acessíveis para pequenas e médias empresas.
            </p>
          </motion.div>

          {/* Card 3 - Valores */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(87, 227, 137, 0.2)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-lg"
          >
            <motion.div
              variants={iconPulseVariants}
              initial="rest"
              whileHover="hover"
              className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6 border border-primary/30"
            >
              <Handshake className="h-8 w-8 text-primary" />
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
      </div>
    </section>
  );
};

export default QuemSomos;