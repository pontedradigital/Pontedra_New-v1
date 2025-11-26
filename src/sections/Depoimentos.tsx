import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

// Dados dos depoimentos
const testimonials = [
  {
    id: 1,
    name: "Rafael Moreira",
    role: "Advogado",
    text: "Começamos com anúncios no Google e Facebook para nossos serviços jurídicos e o retorno foi incrível. Em poucas semanas já estávamos recebendo novas consultas e clientes qualificados. A equipe da Pontedra entende do assunto e trabalha com estratégia de verdade."
  },
  {
    id: 2,
    name: "Juliana Martins",
    role: "Esteticista e Proprietária da Clínica Bela Essência",
    text: "O conteúdo que eles criam para minhas redes é exatamente o que eu sempre quis: leve, autêntico e com minha personalidade. Meus seguidores começaram a interagir mais e novos clientes apareceram só pelas redes sociais. O engajamento cresceu de forma natural e constante."
  },
  {
    id: 3,
    name: "Lucas Ferreira",
    role: "Empresário do Setor Alimentício",
    text: "Antes eu não tinha clareza sobre minha marca. A Pontedra trabalhou o posicionamento e criou uma identidade visual que faz total diferença. Hoje tenho um negócio profissional onde investir meu tempo e dinheiro faz sentido."
  },
  {
    id: 4,
    name: "Carla Rodrigues",
    role: "Gestora de E-commerce de Moda",
    text: "Eles reestruturaram todo meu funil de vendas e implementaram automações que eu nem sabia que existiam. Meu ticket médio aumentou e o processo de venda ficou muito mais eficiente. Recomendo!"
  },
  {
    id: 5,
    name: "Fernando Santos",
    role: "Coach e Palestrante",
    text: "Precisava de um site profissional e um blog para fortalecer minha autoridade. A Pontedra entregou um projeto completo, otimizado para SEO e integrado com minhas redes. Hoje consigo gerar leads qualificados direto do site."
  }
];

// Componente de Card de Depoimento
const TestimonialCard = ({ testimonial, active }: { testimonial: typeof testimonials[0]; active: boolean }) => {
  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[360px] lg:w-[420px] mx-4" data-testid="testimonial-slide">
      <div
        className={`relative group bg-[#0f2a3f]/80 backdrop-blur-xl rounded-2xl p-8 h-full border overflow-hidden ${active ? 'border-[#57e389] shadow-[0_0_20px_rgba(87,227,137,0.25)]' : 'border-[#1d3a4f]/50'}`}
        role="group"
        aria-label={`${testimonial.name} - ${testimonial.role}`}
        aria-current={active || undefined}
        style={{ backfaceVisibility: 'hidden' }}
      >
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#57e389] to-[#00b4ff] rounded-2xl opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-500" />

        <div className="relative z-10">
          {/* Estrelas */}
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#57e389] text-[#57e389]" />
            ))}
          </div>

          {/* Aspas decorativas */}
          <div className="text-[#2d5a4f] text-7xl font-serif leading-none mb-4 opacity-30">"</div>

          {/* Texto do depoimento */}
          <p className="text-[#e1e8f0] text-base leading-relaxed italic mb-8 min-h-[100px]">
            {testimonial.text}
          </p>

          {/* Informações do cliente */}
          <div className="border-t border-[#1d3a4f] pt-6">
            <h4 className="text-white font-bold text-lg mb-1">{testimonial.name}</h4>
            <p className="text-[#57e389] text-sm">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Depoimentos() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { amount: 0.6 });
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "center", dragFree: false, duration: 16, containScroll: 'trimSnaps' });
  const [isHovered, setIsHovered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const total = testimonials.length;

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect);
  }, [embla, onSelect]);

  useEffect(() => {
    if (!embla) return;
    let id: number | undefined;
    const shouldAutoplay = isInView && !isHovered;
    if (shouldAutoplay) {
      id = window.setInterval(() => embla.scrollNext(), 4500);
    }
    return () => { if (id) window.clearInterval(id); };
  }, [embla, isHovered, isInView]);

  

  return (
    <section id="depoimentos" className="relative w-full py-20 md:py-32 bg-[#0a1628] overflow-hidden" aria-label="Depoimentos" tabIndex={0} onKeyDown={(e) => { if (e.key === 'ArrowLeft') embla?.scrollPrev(); if (e.key === 'ArrowRight') embla?.scrollNext(); }}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#57e389]/5 via-transparent to-transparent" />
      </div>

      <div className="relative z-10" ref={sectionRef}>
        {/* Cabeçalho */}
        <motion.div
          className="text-center mb-16 px-4"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d3a2f]/50 border border-[#57e389]/30 mb-6">
            <Star className="w-4 h-4 text-[#57e389] fill-[#57e389]" />
            <span className="text-[#57e389] text-sm font-medium">Histórias de Sucesso</span>
          </div>

          {/* Título */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#00ffae] via-[#57e389] to-[#00b4ff] bg-clip-text text-transparent">
            O QUE NOSSOS CLIENTES DIZEM
          </h2>

          {/* Subtítulo */}
          <p className="text-[#9ba8b5] text-lg max-w-3xl mx-auto">
            Veja o que nossos clientes satisfeitos têm a dizer sobre a parceria com a Pontedra.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a1628] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a1628] to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden" ref={emblaRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="flex will-change-transform transform-gpu">
              {testimonials.map((t, i) => (
                <TestimonialCard key={t.id} testimonial={t} active={selectedIndex === i} />
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4" aria-label="Navegação de depoimentos">
            <button aria-label="Anterior" className="w-12 h-12 rounded-lg border border-[#1d2c3f] text-[#57e389] hover:bg-[#57e389]/10 transition flex items-center justify-center" onClick={() => embla?.scrollPrev()} tabIndex={0}>
              ‹
            </button>
            <span className="text-sm md:text-base text-[#9ba8b5]" aria-live="polite">{selectedIndex + 1}/{total}</span>
            <button aria-label="Próximo" className="w-12 h-12 rounded-lg border border-[#1d2c3f] text-[#57e389] hover:bg-[#57e389]/10 transition flex items-center justify-center" onClick={() => embla?.scrollNext()} tabIndex={0}>
              ›
            </button>
          </div>
          {/* Menu inferior simplificado: apenas setas e contador */}
        </div>
      </div>
    </section>
  );
}
