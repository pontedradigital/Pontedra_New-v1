import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

const Hero: React.FC = () => {
  const [gradientPosition, setGradientPosition] = useState({ x: 50, y: 50 });
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // Inicializar useNavigate

  // Handle mouse movement for gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setGradientPosition({ x, y });
    };

    const hero = heroRef.current;
    hero?.addEventListener("mousemove", handleMouseMove);
    return () => hero?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Função para scrollar para uma seção específica
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
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        background: `
          radial-gradient(
            circle at ${gradientPosition.x}% ${gradientPosition.y}%,
            rgba(50, 205, 100, 0.2),
            #0b111d 80%
          )
        `,
        transition: "background 0.1s ease-out",
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
        {/* LEFT SIDE TEXT */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm font-medium text-green-400 uppercase tracking-widest"
          >
            💡 Soluções Web para PMEs e Profissionais
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mt-4"
          >
            Conectamos sua empresa a{" "}
            <span className="text-[#8BEB65]">pessoas</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-lg text-gray-300 max-w-xl"
          >
            Construímos pontes digitais que conectam sua marca a clientes reais,
            impulsionando resultados com autenticidade, tecnologia e
            inteligência estratégica.
          </motion.p>

          <div className="mt-8 flex gap-4">
            <button 
              onClick={(e)=>{e.preventDefault(); scrollToId('solucoes');}}
              className="px-6 py-3 bg-[#8BEB65] text-black font-semibold rounded-xl hover:bg-[#74D857] transition"
            >
              Ver Soluções
            </button>
            <a 
              href="https://www.instagram.com/digitalpontevra/" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 border border-gray-500 text-white rounded-xl hover:bg-white/10 transition"
            >
              Ver Portfólio
            </a>
          </div>
        </div>

        {/* RIGHT SIDE BOXES */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col justify-center space-y-6"
        >
          {[
            { num: "1️⃣", text: "Atraia mais" },
            { num: "2️⃣", text: "Venda melhor" },
            { num: "3️⃣", text: "Seu sucesso acontece" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 py-6 px-8 rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-400/10 to-green-400/5 shadow-lg shadow-green-400/10 hover:translate-y-[-4px] hover:shadow-green-400/20 transition-all duration-500 ease-out"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#8BEB65] text-black font-bold">
                {item.num}
              </div>
              <span className="text-lg text-white font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;