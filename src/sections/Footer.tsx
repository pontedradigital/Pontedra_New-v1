import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#0a1520] border-t border-[#1d2c3f]" aria-label="Rodapé Pontedra">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Coluna 1 - Logo e Slogan */}
          <div className="space-y-4 flex flex-col items-center text-center"> {/* Centralizado horizontalmente e texto centralizado */}
            {/* Logotipo da Pontedra com brilho suave */}
            <img 
              src="/pontedra-logo.webp" 
              alt="Logotipo da Pontedra" 
              className="h-40 w-auto mb-6 drop-shadow-[0_0_20px_rgba(87,227,137,0.6)]" // Adicionado mb-6 para espaçamento e drop-shadow para brilho
            />
            <p className="text-[#9ba8b5] text-sm leading-relaxed">
              Conectando sua empresa a pessoas por meio do marketing digital.
            </p>
          </div>

          {/* Coluna 2 - Links Rápidos */}
          <div>
            <h3 className="text-[#57e389] font-bold text-lg mb-6">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
                  Home
                </Link>
              </li>
              
              <li>
                <Link to="/politica-privacidade" className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos-de-uso" className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">Termos de Uso</Link>
              </li>
              <li>
                <button onClick={() => window.dispatchEvent(new Event('open-cookie-preferences'))} className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
                  Gerenciar Cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Contato */}
          <div>
            <h3 className="text-[#57e389] font-bold text-lg mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#57e389] flex-shrink-0 mt-0.5" />
                <span className="text-[#9ba8b5] text-sm">
                  Avenida Vila Ema 4191 - Vila Ema - São Paulo/SP
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#57e389] flex-shrink-0" />
                <a href="tel:+5511978777308" className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
                  +55 11 97877-7308
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#57e389] flex-shrink-0" />
                <a href="mailto:contato@pontedra.com" className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
                  contato@pontedra.com
                </a>
              </li>
            </ul>

            {/* Redes Sociais */}
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/pontedradigital/#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
              >
                <Instagram className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
              </a>
              <a
                href="https://www.facebook.com/pontedradigital/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
              >
                <Facebook className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
              </a>
              <a
                href="https://wa.me/5511978777308"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
              >
                <MessageCircle className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[#1d2c3f] py-4">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between text-[#9ba8b5] text-xs">
          <p>© {currentYear} Pontedra. Todos os direitos reservados.</p>
          <nav aria-label="Links legais" className="flex gap-4">
            <Link to="/politica-privacidade" className="hover:text-[#57e389]">Política de Privacidade</Link>
            <Link to="/termos-de-uso" className="hover:text-[#57e389]">Termos de Uso</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
