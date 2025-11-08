import { motion } from "framer-motion";
import { Bot as BotIcon } from "lucide-react"; // Usando BotIcon para o avatar da assistente

export const AssistantMessage = ({ message }: { message: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 p-3 mb-3 bg-card text-foreground rounded-2xl shadow-md max-w-[80%] self-start border border-border"
    >
      <div className="flex-shrink-0 bg-muted p-2 rounded-full shadow-sm flex items-center justify-center">
        <BotIcon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-primary">Assistente Pontedra</span>
        <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  );
};