import React, { useEffect } from "react";
import LandingNavbar from "@/components/LandingNavbar"; // Updated import
import Hero from "@/sections/Hero";
import Footer from "@/sections/Footer"; // Importar o novo componente Footer
import { useLocation, useNavigate } from "react-router-dom";
import QuemSomos from "@/components/landing/QuemSomos";
import NossasSolucoes from "@/sections/NossasSolucoes";
import Depoimentos from "@/sections/Depoimentos"; // Importar o novo componente Depoimentos
import Contato from "@/sections/Contato"; // Importar o novo componente Contato
import BlogPreview from "@/sections/BlogPreview"; // Importar o novo componente BlogPreview

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // This useEffect handles scrolling to a section if a hash is present in the URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const section = document.getElementById(id);
      const nav = document.getElementById("pontedra-navbar"); // This ID is from the old Navbar, new one doesn't use it for scroll-margin-top
      if (section) { // Removed nav check as new Navbar handles its own scroll state
        const navHeight = 80; // Fixed height for the new LandingNavbar
        const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [location.hash]);

  return (
    <div className="font-sans bg-bgMain text-textPrimary min-h-screen">
      <LandingNavbar /> {/* Updated component name */}
      <main className="pt-16"> {/* Adjusted padding to account for fixed navbar */}
        <section id="hero">
          <Hero />
        </section>

        <QuemSomos />

        <NossasSolucoes />

        {/* Nova seção de Depoimentos */}
        <Depoimentos />

        {/* Nova seção de Blog Preview */}
        <BlogPreview />

        {/* Nova seção de Contato */}
        <Contato />
      </main>
      <Footer />
    </div>
  );
}