export function enableNavbarScrollState() {
  const nav = document.getElementById("pontedra-navbar");
  if (!nav) return;
  const check = () => {
    const hero = document.getElementById("hero");
    if (!hero) {
      document.body.classList.add("scrolled");
      return;
    }
    const navHeight = nav?.getBoundingClientRect().height || 72;
    const heroRect = hero.getBoundingClientRect();
    // se topo da próxima seção (baixo do hero) estiver no topo => adiciona scrolled
    if (heroRect.bottom <= navHeight + 4) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  };
  check();
  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
}