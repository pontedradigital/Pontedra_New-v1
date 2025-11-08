import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Share2, MessageCircle, Facebook, Linkedin, Twitter, Copy } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import { toast } from "sonner";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/sections/Footer";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<typeof blogPosts[0] | undefined>(undefined);

  useEffect(() => {
    const foundPost = blogPosts.find((p) => p.slug === slug);
    if (foundPost) {
      setPost(foundPost);
    } else {
      navigate("/404"); // Redireciona para a página 404 se o post não for encontrado
    }
  }, [slug, navigate]);

  const shareUrl = window.location.href;

  const handleShare = (platform: string) => {
    if (!post) return;

    const title = encodeURIComponent(post.title);
    const url = encodeURIComponent(shareUrl);
    const excerpt = encodeURIComponent(post.excerpt);

    let shareLink = "";
    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${title}%20${url}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${excerpt}&source=Pontedra`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copiado para a área de transferência!");
        return;
      default:
        return;
    }
    window.open(shareLink, "_blank");
  };

  if (!post) {
    return null; // Ou um spinner de carregamento, se preferir
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-[#e1e8f0]">
      <LandingNavbar />
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

            {/* Conteúdo do Post */}
            <div
              className="prose prose-invert prose-lg max-w-none text-[#e1e8f0] leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-12 border-t border-[#1d2c3f] pt-8">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-[#0a1520] border border-[#1d2c3f] text-[#57e389] text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Seção de Compartilhamento */}
            <div className="mt-12 pt-8 border-t border-[#1d2c3f] flex flex-col sm:flex-row items-center justify-between gap-6">
              <span className="text-lg font-semibold text-white">Compartilhe este artigo:</span>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleShare("whatsapp")}
                  className="p-3 rounded-full bg-[#25D366] text-white shadow-md hover:bg-[#1DA851] transition-colors"
                  aria-label="Compartilhar no WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" /> {/* Changed from Whatsapp to MessageCircle */}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleShare("facebook")}
                  className="p-3 rounded-full bg-[#1877F2] text-white shadow-md hover:bg-[#145CB3] transition-colors"
                  aria-label="Compartilhar no Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleShare("linkedin")}
                  className="p-3 rounded-full bg-[#0A66C2] text-white shadow-md hover:bg-[#074B8A] transition-colors"
                  aria-label="Compartilhar no LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleShare("twitter")}
                  className="p-3 rounded-full bg-[#1DA1F2] text-white shadow-md hover:bg-[#1788CC] transition-colors"
                  aria-label="Compartilhar no Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleShare("copy")}
                  className="p-3 rounded-full bg-[#1d2c3f] text-[#e1e8f0] shadow-md hover:bg-[#111d2e] transition-colors"
                  aria-label="Copiar Link"
                >
                  <Copy className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}