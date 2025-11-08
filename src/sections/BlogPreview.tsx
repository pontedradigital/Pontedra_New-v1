import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

// Importar posts do arquivo de dados
import { blogPosts } from "@/data/blogPosts";

export default function BlogPreview() {
  const [featuredPost, setFeaturedPost] = useState(blogPosts[0]);

  // Selecionar post aleatório ao carregar
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * blogPosts.length);
    setFeaturedPost(blogPosts[randomIndex]);
  }, []);

  return (
    <section id="blog-preview" className="relative w-full py-20 md:py-32 bg-[#0D1B2A] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#57e389]/5 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d3a2f]/50 border border-[#57e389]/30 mb-6">
            <BookOpen className="w-4 h-4 text-[#57e389]" />
            <span className="text-[#57e389] text-sm font-medium">Do nosso Blog</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#00ffae] via-[#57e389] to-[#00b4ff] bg-clip-text text-transparent">
            BLOG
          </h2>
          <p className="text-[#9ba8b5] text-lg max-w-3xl mx-auto">
            Artigos, dicas e insights sobre desenvolvimento web, sistemas personalizados, marketing digital e tudo que você precisa para fazer seu negócio crescer online.
          </p>
        </motion.div>

        {/* Post em Destaque */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <Link to={`/blog/${featuredPost.slug}`}>
            <div className="group bg-[#111d2e]/80 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl overflow-hidden hover:border-[#57e389]/50 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Imagem */}
                <div className="relative h-64 md:h-full overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] to-transparent opacity-60" />
                  
                  {/* Badge de categoria */}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 rounded-full bg-[#57e389] text-[#0D1B2A] text-sm font-semibold">
                      {featuredPost.category}
                    </span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-8 flex flex-col justify-center">
                  {/* Meta informações */}
                  <div className="flex items-center gap-4 text-[#9ba8b5] text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#57e389] transition-colors">
                    {featuredPost.title}
                  </h3>

                  {/* Descrição */}
                  <p className="text-[#9ba8b5] leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-[#0a1520] border border-[#1d2c3f] text-[#57e389] text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Botão Ler Mais */}
                  <div className="flex items-center gap-2 text-[#57e389] font-semibold group-hover:gap-4 transition-all">
                    <span>Ler Artigo</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Link para ver todos os posts */}
          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#57e389] hover:bg-[#4bc979] text-[#0D1B2A] font-bold rounded-lg transition-all duration-300 shadow-lg shadow-[#57e389]/30 hover:shadow-[#57e389]/50 hover:scale-105"
            >
              <span>Ver Todos os Artigos</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}