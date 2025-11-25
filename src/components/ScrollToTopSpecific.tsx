import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTopSpecific
 * Garante que a página sempre inicie no topo da tela em qualquer mudança de rota.
 */

export default function ScrollToTopSpecific(): null {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}