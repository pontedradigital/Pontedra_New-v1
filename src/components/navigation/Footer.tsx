import React from "react";
import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      id="footer"
      className="bg-background text-muted-foreground py-8 border-t border-border"
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">Pontedra</span>
        </div>
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} Pontedra. Todos os direitos reservados.
        </p>
        <div className="flex gap-4">
          <Link to="#" className="hover:text-primary">
            Política de Privacidade
          </Link>
          <Link to="#" className="hover:text-primary">
            Termos de Serviço
          </Link>
          <Link to="#" className="hover:text-primary">
            Contato
          </Link>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;