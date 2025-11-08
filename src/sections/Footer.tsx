import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#0a1520] border-t border-[#1d2c3f]">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {/* Coluna 1 - Logo e Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#57e389] to-[#00b4ff] flex items-center justify-center">
                <span className="text-[#0D1B2A] font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold text-white">Pontedra</span>
            </div>
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
                <a href="#solucoes" className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
                  Plataforma Pontedra
                </a>
              </li>
              <li>
                <Link to="/blog" className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos-uso" className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <button className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm">
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
                href="https://www.instagram.com/digitalpontevra/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
              >
                <Instagram className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
              </a>
              <a
                href="https://www.facebook.com/"
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
                <MessageCircle className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" /> {/* Changed from Whatsapp to MessageCircle */}
              </a>
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-[#1d2c3f] mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#9ba8b5]">
            <p>© {currentYear} Pontedra. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <Link to="/politica-privacidade" className="hover:text-[#57e389] transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos-uso" className="hover:text-[#57e389] transition-colors">
                Termos de Serviço
              </Link>
              <Link to="/contato" className="hover:text-[#57e389] transition-colors">
                Contato
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}