import React from "react";
import ShaderLines from "../components/ShaderLines";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

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
    <section id="hero" className="relative overflow-hidden min-h-[78vh] md:min-h-[88vh] flex items-center">
      <ShaderLines intensity={1.0} colorA="hsl(var(--pontedra-neon-green))" colorB="hsl(var(--pontedra-neon-blue))" blur={0.6} />

      <div className="max-w-7xl mx-auto w-full px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        <div className="text-left">
          <div className="inline-block mb-6">
            <span className="bg-card/50 text-pontedra-green text-sm font-semibold px-4 py-2 rounded-full border border-border">Soluções Web para PMEs e Profissionais</span>
          </div>

          <h1 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            <span className="block text-pontedra-green">Conectamos</span>
            <span className="block text-foreground">sua empresa</span>
            <span className="block text-foreground">a pessoas</span>
          </h1>

          <div className="w-16 h-1 bg-pontedra-green-light rounded mt-6 mb-6"></div>

          <p className="text-textSecondary max-w-xl mb-8">
            Construímos pontes digitais que aproximam sua marca de clientes reais, com autenticidade, tecnologia e estratégia.
          </p>

          <div className="flex flex-wrap gap-4">
            <a href="#solucoes" onClick={(e)=>{e.preventDefault(); scrollToId('solucoes');}} className="inline-flex items-center bg-pontedra-green hover:bg-pontedra-green-hover text-pontedra-dark-text px-6 py-3 rounded-xl font-semibold transition">
              Ver Soluções <span className="ml-3">→</span>
            </a>

            <a href="https://www.instagram.com/digitalpontevra/" target="_blank" rel="noreferrer" className="inline-flex items-center border border-pontedra-border-light px-6 py-3 rounded-xl font-semibold text-textPrimary hover:border-pontedra-green transition">
              Ver Portfólio
            </a>
          </div>
        </div>

        <div className="space-y-6">
          {[
            { num: "01", title: "Descubra como resolver seus desafios" },
            { num: "02", title: "Nós criamos a solução sob medida" },
            { num: "03", title: "Transforme resultados e conquiste clientes" },
          ].map((c) => (
            <article key={c.num} className="flex items-center gap-4 bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="flex-none w-12 h-12 rounded-full bg-background border border-pontedra-green-light flex items-center justify-center text-pontedra-green font-bold">{c.num}</div>
              <div className="flex-1">
                <h4 className="text-foreground font-semibold">{c.title}</h4>
              </div>
              <div className="text-textSecondary">→</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}