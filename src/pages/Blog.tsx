import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import LandingNavbar from "@/components/LandingNavbar"; // Importar LandingNavbar
import Footer from "@/sections/Footer"; // Importar Footer

// Função para remover acentos
const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = ["Todos", "Desenvolvimento Web", "Sistemas", "Marketing", "SEO", "Design"];

  // Filtrar posts por busca e categoria
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      // Filtro de categoria
      const matchesCategory = activeCategory === "Todos" || post.category === activeCategory;
      
      // Filtro de busca (sem acentos)
      const searchLower = removeAccents(searchTerm.toLowerCase());
      const titleMatch = removeAccents(post.title.toLowerCase()).includes(searchLower);
      const excerptMatch = removeAccents(post.excerpt.toLowerCase()).includes(searchLower);
      const tagsMatch = post.tags.some(tag => removeAccents(tag.toLowerCase()).includes(searchLower));
      
      const matchesSearch = searchTerm === "" || titleMatch || excerptMatch || tagsMatch;
      
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <LandingNavbar /> {/* Adicionado LandingNavbar */}
      <main className="pt-24 pb-16"> {/* Ajustado padding-top para a Navbar fixa */}
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 bg-gradient-to-b from-[#0a1520] to-[#0D1B2A]">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#00ffae] via-[#57e389] to-[#00b4ff] bg-clip-text text-transparent">
                BLOG
              </h1>
              <p className="text-[#9ba8b5] text-lg mb-12">
                Artigos, dicas e insights sobre desenvolvimento web, sistemas personalizados, marketing digital e tudo que você precisa para fazer seu negócio crescer online.
              </p>

              {/* Barra de Busca */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#111d2e] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] transition-colors"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filtros de Categoria */}
        <section className="bg-white/5 border-y border-[#1d2c3f]">
          <div className="container mx-auto px-4 md:px-8 py-6">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-[#57e389] text-[#0D1B2A] shadow-lg shadow-[#57e389]/30"
                      : "bg-[#111d2e] text-[#9ba8b5] border border-[#1d2c3f] hover:border-[#57e389]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-8">
            {filteredPosts.length > 0 ? (
              <>
                {/* Post em Destaque (primeiro) */}
                {filteredPosts.length > 0 && (
                  <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-8">Destaque</h2>
                    <Link to={`/blog/${filteredPosts[0].slug}`}>
                      <div className="group bg-[#111d2e]/80 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl overflow-hidden hover:border-[#57e389]/50 transition-all duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="relative h-64 md:h-full overflow-hidden">
                            <img
                              src={filteredPosts[0].image}
                              alt={filteredPosts[0].title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] to-transparent opacity-60" />
                            <div className="absolute top-4 left-4">
                              <span className="px-4 py-2 rounded-full bg-[#57e389] text-[#0D1B2A] text-sm font-semibold">
                                {filteredPosts[0].category}
                              </span>
                            </div>
                          </div>
                          <div className="p-8 flex flex-col justify-center">
                            <div className="flex items-center gap-4 text-[#9ba8b5] text-sm mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{filteredPosts[0].date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{filteredPosts[0].readTime}</span>
                              </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#57e389] transition-colors">
                              {filteredPosts[0].title}
                            </h3>
                            <p className="text-[#9ba8b5] leading-relaxed mb-6">
                              {filteredPosts[0].excerpt}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-6">
                              {filteredPosts[0].tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 rounded-full bg-[#0a1520] border border-[#1d2c3f] text-[#57e389] text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-[#57e389] font-semibold group-hover:gap-4 transition-all">
                              <span>Ler Artigo</span>
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Todos os Artigos */}
                {filteredPosts.length > 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-8">Todos os Artigos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPosts.slice(1).map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link to={`/blog/${post.slug}`}>
                            <div className="group bg-[#111d2e]/80 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl overflow-hidden hover:border-[#57e389]/50 transition-all duration-300 h-full flex flex-col">
                              <div className="relative h-48 overflow-hidden">
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] to-transparent opacity-60" />
                                <div className="absolute top-4 left-4">
                                  <span className="px-3 py-1 rounded-full bg-[#57e389] text-[#0D1B2A] text-xs font-semibold">
                                    {post.category}
                                  </span>
                                </div>
                              </div>
                              <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-[#9ba8b5] text-xs mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{post.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{post.readTime}</span>
                                  </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#57e389] transition-colors line-clamp-2">
                                  {post.title}
                                </h3>
                                <p className="text-[#9ba8b5] text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                                  {post.excerpt}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {post.tags.slice(0, 2).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 rounded-full bg-[#0a1520] border border-[#1d2c3f] text-[#57e389] text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 text-[#57e389] text-sm font-semibold group-hover:gap-4 transition-all">
                                  <span>Ler Artigo</span>
                                  <ArrowRight className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#9ba8b5] text-lg">
                Nenhum artigo encontrado para "{searchTerm}" na categoria "{activeCategory}".
              </p>
            </div>
          )}
        </div>
      </section>
      </main>
      <Footer /> {/* Adicionado Footer */}
    </div>
  );
}