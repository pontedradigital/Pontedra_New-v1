import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingNavbar from "@/components/navigation/LandingNavbar";
import Footer from "@/components/navigation/Footer";
import { motion } from "framer-motion";
import { MessageCircle, MessageSquare, Camera, CalendarDays, BarChart, Bot, Zap, ShieldCheck, Clock, TrendingUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ShaderLinesBackground from "@/components/ShaderLinesBackground"; // Importar o novo componente

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <LandingNavbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative h-[calc(100vh-64px)] flex items-center justify-center text-center overflow-hidden bg-gradient-to-br from-background to-card"
      >
        <ShaderLinesBackground /> {/* Integrar o fundo animado aqui */}
        {/* Gradiente radial como overlay, com z-index ajustado e opacidade reduzida */}
        <div
          className="absolute inset-0 z-[-1]"
          style={{
            backgroundImage: `radial-gradient(circle at center, hsl(var(--background)) 0%, hsl(var(--card)) 50%, transparent 100%)`,
            opacity: 0.5, // Opacidade reduzida para as linhas serem mais visíveis
          }}
        ></div>
        <div className="relative z-10 max-w-4xl px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-foreground"
          >
            Automatize seus atendimentos com a <span className="text-primary">Assistente Pontedra</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground mb-10"
          >
            Conecte WhatsApp, Instagram e Messenger em um só lugar e transforme a experiência do seu cliente.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button asChild className="uppercase px-8 py-6 text-lg rounded-full bg-primary text-background hover:bg-primary/90 shadow-lg shadow-primary/30">
              <Link to="/login">Acessar Plataforma</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefícios Section */}
      <section id="benefits" className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            className="text-4xl font-bold mb-12 text-foreground"
          >
            Por que escolher a Pontedra?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Bot, title: "Atendimento Inteligente", description: "Utilize nossa Assistente Pontedra para responder dúvidas e otimizar o suporte ao cliente 24/7." },
              { icon: MessageSquare, title: "Centralização de Canais", description: "Gerencie todas as suas conversas de WhatsApp, Instagram e Messenger em uma única plataforma." },
              { icon: CalendarDays, title: "Agenda Inteligente", description: "Permita que seus clientes agendem serviços de forma autônoma, com lembretes automáticos." },
              { icon: BarChart, title: "Relatórios com Assistente Pontedra", description: "Obtenha insights valiosos sobre o desempenho do seu negócio e sugestões de otimização." },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="bg-background p-8 rounded-2xl shadow-lg border border-border hover:border-primary hover:scale-[1.02] transition-all duration-300 ease-out group"
              >
                <benefit.icon className="h-12 w-12 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="how-it-works" className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            className="text-4xl font-bold mb-12 text-foreground"
          >
            Como a Pontedra Funciona?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "1. Conecte seus Canais", description: "Integre facilmente WhatsApp, Messenger e Instagram Direct à plataforma." },
              { icon: ShieldCheck, title: "2. Configure sua Assistente Pontedra", description: "Personalize a Assistente Pontedra para atender às necessidades específicas do seu negócio." },
              { icon: Clock, title: "3. Automatize Agendamentos", description: "Deixe a Assistente Pontedra gerenciar sua agenda, confirmando e lembrando clientes automaticamente." },
              { icon: TrendingUp, title: "4. Otimize com Insights", description: "Receba análises e sugestões inteligentes para escalar seu atendimento e vendas." },
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: index * 0.15 + 0.2 }}
                className="bg-card p-8 rounded-2xl shadow-lg border border-border flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos e Preços Section */}
      <section id="pricing" className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            className="text-4xl font-bold mb-12 text-foreground"
          >
            Planos Flexíveis para o seu Negócio
          </motion.h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Básico", price: "R$99", features: ["1 Canal de Atendimento", "Assistente Pontedra Básica", "500 Mensagens/mês", "Suporte por E-mail"], highlight: false },
              { name: "Profissional", price: "R$249", features: ["3 Canais de Atendimento", "Assistente Pontedra Avançada", "5.000 Mensagens/mês", "Relatórios e Insights", "Suporte Prioritário"], highlight: true },
              { name: "Empresarial", price: "R$499", features: ["Canais Ilimitados", "Assistente Pontedra Personalizada", "Mensagens Ilimitadas", "Relatórios Avançados", "Gerente de Conta Dedicado"], highlight: false },
            ].map((plan, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className={cn(
                  "bg-background p-8 rounded-2xl shadow-lg border border-border flex flex-col transition-all duration-300 ease-out hover:scale-[1.02]",
                  plan.highlight && "border-primary ring-2 ring-primary shadow-primary/20"
                )}
              >
                <h3 className="text-2xl font-bold mb-4 text-foreground">{plan.name}</h3>
                <p className="text-5xl font-bold text-primary mb-6">{plan.price}<span className="text-lg text-muted-foreground">/mês</span></p>
                <ul className="text-muted-foreground text-left space-y-2 flex-1 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" /> {feature}
                    </li>
                  ))}
                </ul>
                <Button className={cn(
                  "uppercase w-full py-3 rounded-full text-background",
                  plan.highlight ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30" : "bg-secondary hover:bg-secondary/90 text-foreground"
                )}>
                  Assinar Agora
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;