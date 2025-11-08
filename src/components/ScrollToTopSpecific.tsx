import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTopSpecific
 * Força a rolagem para o topo quando o usuário acessa
 * uma das rotas definidas abaixo, sem alterar o design.
 */

const TARGET_PATHS = [
  "/",                       // Landing Page
  "/landing",                // caso exista esta rota
  "/blog",
  "/politica-de-privacidade",
  "/termos-de-uso",
  "/gerenciar-cookies",
];

export default function ScrollToTopSpecific(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalized = pathname.replace(/\/+$/, "") || "/";
    const match = TARGET_PATHS.some((p) => {
      const np = p.replace(/\/+$/, "") || "/";
      return np === normalized;
    });

    if (match) {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  return null;
}