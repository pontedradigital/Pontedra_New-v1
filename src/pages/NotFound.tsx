import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import LandingNavbar from "@/components/LandingNavbar"; // Importar LandingNavbar
import Footer from "@/sections/Footer"; // Importar Footer

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-[#0D1B2A] text-foreground">
      <LandingNavbar /> {/* Adicionado LandingNavbar */}
      <div className="flex flex-1 items-center justify-center mt-16"> {/* Adicionado mt-16 para compensar a navbar fixa */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 dark:text-muted-foreground mb-4">Oops! Página não encontrada</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline dark:text-[#57e389] dark:hover:text-[#4bc979]">
            Retornar à Página Inicial
          </a>
        </div>
      </div>
      <Footer /> {/* Adicionado Footer */}
    </div>
  );
};

export default NotFound;