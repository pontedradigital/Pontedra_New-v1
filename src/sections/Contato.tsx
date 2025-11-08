import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Facebook, Instagram, Send } from "lucide-react";

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica de envio do formulário
    console.log("Formulário enviado:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contato" className="relative w-full py-20 md:py-32 bg-[#0D1B2A] overflow-hidden">
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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-[#00ffae] via-[#57e389] to-[#00b4ff] bg-clip-text text-transparent">
            CONTATO
          </h2>
          <p className="text-[#9ba8b5] text-lg max-w-3xl mx-auto">
            Tem um projeto em mente ou quer saber mais sobre como podemos ajudar sua empresa a crescer? Entre em contato!
          </p>
        </motion.div>

        {/* Grid de Contato e Formulário */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Coluna Esquerda - Informações de Contato */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Card Nossos Contatos */}
            <div className="bg-[#111d2e]/80 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-[#57e389] mb-8">Nossos Contatos</h3>

              {/* Telefone */}
              <div className="flex items-start gap-4 mb-6 p-4 bg-[#0a1520]/50 rounded-xl border border-[#1d2c3f] hover:border-[#57e389]/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1d3a2f] to-[#0f1f1a] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#57e389]" />
                </div>
                <div>
                  <p className="text-[#9ba8b5] text-sm mb-1">Telefone</p>
                  <a href="tel:+5511978777308" className="text-white text-lg font-semibold hover:text-[#57e389] transition-colors">
                    +55 11 97877-7308
                  </a>
                </div>
              </div>

              {/* E-mail */}
              <div className="flex items-start gap-4 p-4 bg-[#0a1520]/50 rounded-xl border border-[#1d2c3f] hover:border-[#57e389]/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1d3a2f] to-[#0f1f1a] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#57e389]" />
                </div>
                <div>
                  <p className="text-[#9ba8b5] text-sm mb-1">E-mail</p>
                  <a href="mailto:contato@pontedra.com" className="text-white text-lg font-semibold hover:text-[#57e389] transition-colors break-all">
                    contato@pontedra.com
                  </a>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="bg-[#111d2e]/80 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#e1e8f0] mb-6">Siga-nos nas redes sociais</h3>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/digitalpontevra/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-[#0a1520] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                >
                  <Instagram className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
                </a>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-[#0a1520] border border-[#1d2c3f] flex items-center justify-center hover:bg-[#1d3a2f] hover:border-[#57e389]/50 transition-all group"
                >
                  <Facebook className="w-5 h-5 text-[#9ba8b5] group-hover:text-[#57e389] transition-colors" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Coluna Direita - Formulário */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[#111d2e]/80 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-[#57e389] mb-8">Envie sua Mensagem</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome e E-mail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nome" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      required
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-3 bg-[#0a1520] border border-[#1d2c3f] rounded-lg text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 bg-[#0a1520] border border-[#1d2c3f] rounded-lg text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] transition-colors"
                    />
                  </div>
                </div>

                {/* Telefone e Assunto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="telefone" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 bg-[#0a1520] border border-[#1d2c3f] rounded-lg text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="assunto" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                      Assunto
                    </label>
                    <input
                      type="text"
                      id="assunto"
                      name="assunto"
                      value={formData.assunto}
                      onChange={handleChange}
                      placeholder="Assunto da mensagem"
                      className="w-full px-4 py-3 bg-[#0a1520] border border-[#1d2c3f] rounded-lg text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] transition-colors"
                    />
                  </div>
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="mensagem" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    required
                    value={formData.mensagem}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Conte-nos sobre seu projeto ou dúvida..."
                    className="w-full px-4 py-3 bg-[#0a1520] border border-[#1d2c3f] rounded-lg text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] transition-colors resize-none"
                  />
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  className="w-full bg-[#57e389] hover:bg-[#4bc979] text-[#0D1B2A] font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#57e389]/30 hover:shadow-[#57e389]/50 hover:scale-[1.02]"
                >
                  <Send className="w-5 h-5" />
                  Enviar Mensagem
                </button>

                <p className="text-[#9ba8b5] text-sm text-center">
                  * Campos obrigatórios. Seu e-mail será usado apenas para resposta.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}