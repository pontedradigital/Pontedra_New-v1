import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTopSpecific
 * Garante que determinadas rotas sempre iniciem no topo da tela.
 */

const TARGET_PATHS = [
  "/",                       // Landing Page
  "/landing",
  "/blog",
  "/politica-privacidade",   // Ajustado para corresponder à rota em App.tsx
  "/termos-uso",             // Ajustado para corresponder à rota em App.tsx
  "/gerenciar-cookies",      // Rota não existente no App.tsx, mas incluída conforme solicitado
];

export default function ScrollToTopSpecific(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname.replace(/\/+$/, "") || "/";

    const shouldScrollTop = TARGET_PATHS.some(
      (route) => route.replace(/\/+$/, "") === normalizedPath
    );

    if (shouldScrollTop) {
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }, 50); // pequeno delay garante execução após renderização da página
    }
  }, [pathname]);

  return null;
}