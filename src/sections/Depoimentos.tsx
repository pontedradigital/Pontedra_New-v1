import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

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
const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
  return (
    <div className="flex-shrink-0 w-[400px] mx-4">
      <div className="relative group bg-[#0f2a3f]/80 backdrop-blur-xl border border-[#1d3a4f]/50 rounded-2xl p-8 h-full">
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
          <p className="text-[#e1e8f0] text-base leading-relaxed italic mb-8">
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
  // Duplicar os depoimentos para criar loop infinito
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section id="depoimentos" className="relative w-full py-20 md:py-32 bg-[#0a1628] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#57e389]/5 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
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

        {/* Carrossel */}
        <div className="relative">
          {/* Gradientes laterais para fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a1628] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a1628] to-transparent z-10 pointer-events-none" />

          {/* Container do carrossel */}
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{
                x: [0, -400 * testimonials.length],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
              style={{ width: `${400 * duplicatedTestimonials.length}px` }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}