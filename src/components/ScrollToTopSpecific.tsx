import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTopSpecific
 * Garante que a página sempre inicie no topo da tela em qualquer mudança de rota.
 */

export default function ScrollToTopSpecific(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    // Rola para o topo em qualquer mudança de pathname
    // Um pequeno delay pode ser útil para garantir que a nova página já esteja renderizada
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, 50); 
  }, [pathname]);

  return null;
}