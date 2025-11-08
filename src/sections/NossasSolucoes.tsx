import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, LayoutDashboard, Database, Calendar, BookOpen, Megaphone, Palette, Zap, Shield } from "lucide-react";

// Tipos de categorias
type Category = "Todas" | "Web" | "Sistemas" | "Marketing" | "Design" | "Completo";

// Dados dos serviços
const services = [
  {
    id: 1,
    title: "Criação de Sites",
    category: "Web",
    icon: Globe,
    shortDesc: "Desenvolvemos sites modernos, rápidos e estratégicos.",
    fullDesc: "Desenvolvemos sites modernos, rápidos e estratégicos — feitos para gerar resultados reais. Da identidade visual ao conteúdo, cada detalhe é pensado para atrair, engajar e converter visitantes em clientes.",
    badge: "Web"
  },
  {
    id: 2,
    title: "Dashboards Personalizados",
    category: "Sistemas",
    icon: LayoutDashboard,
    shortDesc: "Criamos dashboards intuitivos e funcionais.",
    fullDesc: "Criamos dashboards intuitivos e funcionais que centralizam todas as informações importantes do seu negócio. Visualize vendas, métricas, KPIs e indicadores em tempo real, facilitando decisões estratégicas.",
    badge: "Sistemas"
  },
  {
    id: 3,
    title: "CRMs e ERPs Personalizados",
    category: "Sistemas",
    icon: Database,
    shortDesc: "Desenvolvemos sistemas de gestão de relacionamento.",
    fullDesc: "Desenvolvemos sistemas de gestão de relacionamento com clientes (CRM) e planejamento de recursos empresariais (ERP) sob medida para sua empresa — integrando vendas, estoque, finanças e muito mais em uma única plataforma.",
    badge: "Sistemas"
  },
  {
    id: 4,
    title: "Sistemas de Agendamento",
    category: "Sistemas",
    icon: Calendar,
    shortDesc: "Implementamos sistemas de agendamento online.",
    fullDesc: "Implementamos sistemas de agendamento online que permitem seus clientes marcarem horários de forma prática e automática. Integrado com calendário, notificações e lembretes — otimize seu tempo e reduza no-shows.",
    badge: "Sistemas"
  },
  {
    id: 5,
    title: "Sistemas de Blog e Conteúdo",
    category: "Sistemas",
    icon: BookOpen,
    shortDesc: "Criamos sistemas de blog integrados ao seu site.",
    fullDesc: "Criamos sistemas de blog integrados ao seu site, permitindo publicação de artigos, gerenciamento de conteúdo e SEO otimizado. Ideal para posicionamento orgânico e autoridade no seu mercado.",
    badge: "Sistemas"
  },
  {
    id: 6,
    title: "Criação de Conteúdo",
    category: "Marketing",
    icon: Megaphone,
    shortDesc: "Criamos conteúdos que contam a história da sua marca.",
    fullDesc: "Criamos conteúdos que contam a história da sua marca de forma leve, criativa e estratégica. Produzimos posts, vídeos, roteiros e ideias que engajam nas principais plataformas digitais.",
    badge: "Marketing"
  },
  {
    id: 7,
    title: "Estratégias de Marketing",
    category: "Marketing",
    icon: Zap,
    shortDesc: "Conectamos todas as peças do digital.",
    fullDesc: "Conectamos todas as peças do digital: site, redes sociais, anúncios e posicionamento de marca. Desenvolvemos um plano estratégico personalizado, pensado para o crescimento sustentável do seu negócio.",
    badge: "Marketing"
  },
  {
    id: 8,
    title: "Campanhas e Tráfego Pago",
    category: "Marketing",
    icon: Megaphone,
    shortDesc: "Fazemos seus anúncios chegarem às pessoas certas.",
    fullDesc: "Fazemos seus anúncios chegarem às pessoas certas no momento certo. Planejamos, criamos e otimizamos campanhas no Google, Meta (Facebook/Instagram) e outras plataformas — com foco em ROI e conversão.",
    badge: "Marketing"
  },
  {
    id: 9,
    title: "Análise de Público e Posicionamento",
    category: "Marketing",
    icon: Shield,
    shortDesc: "Antes de agir, entendemos quem é o seu público.",
    fullDesc: "Antes de agir, entendemos quem é o seu público e o que ele busca. Analisamos dados, comportamento e concorrência para posicionar sua marca de forma estratégica e diferenciada no mercado.",
    badge: "Marketing"
  },
  {
    id: 10,
    title: "Identidade Visual e Posicionamento de Marca",
    category: "Design",
    icon: Palette,
    shortDesc: "Ajudamos sua marca a nascer (ou renascer).",
    fullDesc: "Ajudamos sua marca a nascer (ou renascer) com propósito e personalidade. Criamos logótipos, paletas de cores, tipografias e diretrizes visuais que refletem quem você é e conectam com seu público.",
    badge: "Design"
  },
  {
    id: 11,
    title: "Integração de Ferramentas",
    category: "Sistemas",
    icon: Zap,
    shortDesc: "Integramos todas as ferramentas do seu negócio.",
    fullDesc: "Integramos todas as ferramentas do seu negócio em uma única plataforma. Conectamos seu site com sistemas de pagamento, e-mail marketing, redes sociais, analytics e muito mais, criando um ecossistema digital completo.",
    badge: "Sistemas"
  },
  {
    id: 12,
    title: "Assessoria Digital Completa",
    category: "Completo",
    icon: Shield,
    shortDesc: "Cuidamos de toda a presença digital da sua marca.",
    fullDesc: "Cuidamos de toda a presença digital da sua marca — do site aos anúncios, do conteúdo às estratégias. Reunimos tudo o que você precisa em um só lugar, com acompanhamento constante, relatórios de desempenho e ajustes mensais para otimização contínua.",
    badge: "Completo"
  }
];

// Componente de Badge de Categoria
const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    Web: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Sistemas: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    Marketing: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    Design: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    Completo: "bg-amber-500/10 text-amber-400 border-amber-500/30"
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full border ${colors[category] || "bg-gray-500/10 text-gray-400"}`}>
      {category}
    </span>
  );
};

// Componente de Card de Serviço
const ServiceCard = ({ service, isExpanded, onToggle }: { service: typeof services[0], isExpanded: boolean, onToggle: () => void }) => {
  const Icon = service.icon;

  return (
    <motion.article
      layout
      className="relative group bg-[#111d2e]/80 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl p-6 overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onToggle}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-r from-[#57e389] to-[#00b4ff] rounded-2xl opacity-0 blur-xl group-hover:opacity-20"
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative z-10">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1d3a2f] to-[#0f1f1a] flex items-center justify-center border border-[#57e389]/30">
              <Icon className="w-7 h-7 text-[#57e389]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#e1e8f0]">{service.title}</h3>
              <CategoryBadge category={service.badge} />
            </div>
          </div>
        </div>

        {/* Descrição */}
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.p
              key="short"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[#9ba8b5] text-sm leading-relaxed"
            >
              {service.shortDesc}
            </motion.p>
          ) : (
            <motion.p
              key="full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[#9ba8b5] text-sm leading-relaxed"
            >
              {service.fullDesc}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Indicador de expansão */}
        <div className="mt-4 flex items-center gap-2 text-[#57e389] text-sm font-medium">
          <span>{isExpanded ? "Ver menos" : "Passe o mouse para mais detalhes"}</span>
          <motion.div
            animate={{ x: isExpanded ? -5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            →
          </motion.div>
        </div>
      </div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.article>
  );
};

export default function NossasSolucoes() {
  const [activeCategory, setActiveCategory] = useState<Category>("Todas");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const categories: Category[] = ["Todas", "Web", "Sistemas", "Marketing", "Design", "Completo"];

  const filteredServices = activeCategory === "Todas" 
    ? services 
    : services.filter(s => s.category === activeCategory);

  return (
    <section id="solucoes" className="relative w-full py-20 md:py-32 bg-[#0D1B2A] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#57e389]/5 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Título */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#00ffae] via-[#57e389] to-[#00b4ff] bg-clip-text text-transparent">
            NOSSAS SOLUÇÕES
          </h2>
          <p className="text-[#9ba8b5] text-lg max-w-3xl mx-auto">
            Oferecemos soluções personalizadas em desenvolvimento web, marketing digital e consultoria para impulsionar seu negócio.
          </p>
        </motion.div>

        {/* Filtros de Categoria */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((cat, idx) => (
            <motion.button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setExpandedCard(null);
              }}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-[#57e389] text-[#0D1B2A] shadow-lg shadow-[#57e389]/30"
                  : "bg-[#111d2e] text-[#9ba8b5] border border-[#1d2c3f] hover:border-[#57e389]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Grid de Serviços */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {filteredServices.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ServiceCard
                  service={service}
                  isExpanded={expandedCard === service.id}
                  onToggle={() => setExpandedCard(expandedCard === service.id ? null : service.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}