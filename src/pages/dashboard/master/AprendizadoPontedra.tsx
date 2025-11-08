import React, { useEffect, useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Brain, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { analisarPadroes } from "@/utils/assistentePontedraAprendizado";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AprendizadoPontedra = () => {
  const [padroes, setPadroes] = useState<string[]>([]);

  useEffect(() => {
    const encontrados = analisarPadroes();
    setPadroes(encontrados);
  }, []);

  return (
    <MasterDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">🧩 Insights de Aprendizado da Assistente Pontedra</h1>
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Temas Mais Frequentes</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="text-muted-foreground mb-4">
              Aqui estão os tópicos mais abordados pelos clientes nas conversas com a Assistente Pontedra.
            </CardDescription>
            <ul className="bg-background rounded-lg shadow-inner p-4 space-y-3 border border-border">
              {padroes.length > 0 ? (
                padroes.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 text-foreground"
                  >
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-semibold capitalize">{item}</span>
                  </motion.li>
                ))
              ) : (
                <li className="text-muted-foreground text-center py-4">
                  Nenhum padrão de conversa identificado ainda. Incentive seus clientes a usar a Assistente!
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border shadow-sm bg-card mt-6"
      >
        <div className="flex flex-col items-center gap-1 text-center p-4">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Otimize seu Atendimento com Dados Reais
          </h3>
          <p className="text-sm text-muted-foreground">
            Use esses insights para refinar seus serviços, promoções e a base de conhecimento da Assistente Pontedra.
          </p>
        </div>
      </motion.div>
    </MasterDashboardLayout>
  );
};

export default AprendizadoPontedra;