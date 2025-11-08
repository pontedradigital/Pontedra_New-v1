import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import { toast } from "sonner"; // Importar toast para notificações
import LandingNavbar from "@/components/LandingNavbar"; // Manter LandingNavbar
import Footer from "@/sections/Footer"; // Manter Footer

export default function BlogPostPage() { // Nome do componente ajustado para BlogPostPage
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<typeof blogPosts[0] | undefined>(undefined);

  useEffect(() => {
    const foundPost = blogPosts.find(p => p.slug === slug);
    if (foundPost) {
      setPost(foundPost);
    } else {
      navigate("/404"); // Redireciona para a página 404 se o post não for encontrado
    }
  }, [slug, navigate]);

  const shareUrl = window.location.href;
  const shareTitle = post?.title || "Artigo do Blog Pontedra"; // Usar post.title se disponível

  const handleShare = (platform: string) => {
    if (!post) return; // Adicionado para garantir que o post existe

    const title = encodeURIComponent(post.title);
    const url = encodeURIComponent(shareUrl);
    const excerpt = encodeURIComponent(post.excerpt); // Assumindo que 'excerpt' está disponível no BlogPost

    let shareLink = "";
    
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${excerpt}&source=Pontedra`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${title}%20${url}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copiado para a área de transferência!");
        return; // Retorna cedo para a ação de copiar
      default:
        return;
    }
    
    window.open(shareLink, "_blank", "width=600,height=400");
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post não encontrado</h1>
          <Link to="/blog" className="text-[#57e389] hover:underline">
            Voltar para o Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-[#e1e8f0]">
      <LandingNavbar /> {/* Adicionado LandingNavbar */}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[#57e389] hover:text-[#4bc979] transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar para o Blog</span>
            </Link>

            {/* Imagem do Post */}
            <div className="relative w-full h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] to-transparent opacity-70" />
            </div>

            {/* Título e Meta */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[#9ba8b5] text-sm mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#57e389]/20 text-[#57e389] text-xs font-semibold border border-[#57e389]/30">
                {post.category}
              </span>
              <span className="text-white font-medium">Por {post.author}</span>
            </div>

            {/* Botões de Compartilhamento */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="text-[#9ba8b5] text-sm font-medium flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Compartilhar:
              </span>
              <button
                onClick={() => handleShare("facebook")}
                className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                title="Compartilhar no Facebook"
              >
                <Facebook className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                title="Compartilhar no Twitter"
              >
                <Twitter className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                title="Compartilhar no LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                title="Compartilhar no WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                title="Copiar Link"
              >
                <Copy className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
              </button>
            </motion.div>

            {/* Imagem de Destaque */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-12"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] to-transparent opacity-40" />
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Conteúdo do Post */}
      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-[#111d2e]/50 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl p-8 md:p-12"
            >
              <div
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:text-[#57e389] prose-headings:font-bold
                  prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12
                  prose-p:text-[#9ba8b5] prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-[#57e389] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white
                  prose-ul:text-[#9ba8b5] prose-ul:list-disc
                  prose-ol:text-[#9ba8b5] prose-ol:list-decimal"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[#1d2c3f]">
                <span className="text-[#9ba8b5] font-medium mr-2">Tags:</span>
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full bg-[#0a1520] border border-[#1d2c3f] text-[#57e389] text-sm hover:border-[#57e389]/50 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Compartilhar novamente no final */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12 text-center"
            >
              <p className="text-[#9ba8b5] mb-4">Gostou deste artigo? Compartilhe com seus amigos!</p>
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => handleShare("facebook")}
                  className="w-12 h-12 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                >
                  <Facebook className="w-6 h-6 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="w-12 h-12 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                >
                  <Twitter className="w-6 h-6 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="w-12 h-12 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                >
                  <Linkedin className="w-6 h-6 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="w-12 h-12 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                >
                  <MessageCircle className="w-6 h-6 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="w-12 h-12 rounded-lg bg-[#111d2e] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                >
                  <Copy className="w-6 h-6 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer /> {/* Adicionado Footer */}
    </div>
  );
}