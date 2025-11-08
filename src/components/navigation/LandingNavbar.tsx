import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { motion } from "framer-motion";

const LandingNavbar = () => {
  const navLinks = [
    { name: "Início", href: "#hero" },
    { name: "Benefícios", href: "#benefits" },
    { name: "Como Funciona", href: "#how-it-works" },
    { name: "Planos", href: "#pricing" },
    { name: "Contato", href: "#footer" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.2 }}
      className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between lg:px-8"
    >
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
        <img src="/pontedra-logo.webp" alt="Pontedra Logo" className="h-7 w-auto" />
      </Link>

      <div className="hidden lg:flex items-center gap-6">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={`/landing${link.href}`} {/* Ajustado para navegar para /landing primeiro */}
            className="text-foreground hover:text-primary text-sm font-medium uppercase"
          >
            {link.name}
          </a>
        ))}
        <Button asChild className="uppercase px-6 py-2 rounded-full text-background hover:bg-primary/90">
          <Link to="/login">Acessar Plataforma</Link>
        </Button>
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6 text-foreground" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card border-border w-[250px] sm:w-[300px]">
            <div className="flex flex-col gap-4 pt-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={`/landing${link.href}`} {/* Ajustado para navegar para /landing primeiro */}
                  className="text-foreground hover:text-primary text-lg font-medium uppercase py-2"
                >
                  {link.name}
                </a>
              ))}
              <Button asChild className="uppercase mt-4 px-6 py-2 rounded-full text-background hover:bg-primary/90">
                <Link to="/login">Acessar Plataforma</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.nav>
  );
};

export default LandingNavbar;