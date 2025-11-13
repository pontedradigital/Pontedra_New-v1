import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/sections/Footer";
import { useAuth } from "@/context/AuthContext"; // Importando useAuth

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth(); // Não precisamos mais do 'profile' aqui para a navegação
  // A navegação será gerenciada pelo AuthContext após o perfil ser carregado.
  // O 'navigate' ainda é útil para outras situações, mas não para o sucesso do login aqui.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // A função login do AuthContext já lida com o toast de sucesso/erro.
    // A navegação para o dashboard será tratada pelo useEffect no AuthContext.
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#57e389]/10 via-transparent to-transparent" />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-[#57e389]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#00b4ff]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#57e389] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <LandingNavbar />

      <main className="flex-grow flex items-center justify-center py-12 my-16 md:my-24">
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#57e389] to-[#00b4ff] rounded-3xl blur-xl opacity-20" />
          
          <div className="relative bg-[#111d2e]/90 backdrop-blur-2xl border border-[#1d2c3f] rounded-3xl p-8 md:p-10 shadow-2xl">
            {/* Logo e Badge */}
            <div className="text-center mb-8">
              <img
                src="https://qtuctrqomfwvantainjc.supabase.co/storage/v1/object/public/images/pontedra-logo.webp"
                alt="Pontedra Logo"
                className="h-20 w-auto mx-auto mb-6 drop-shadow-[0_0_20px_rgba(87,227,137,0.6)]"
              />

              <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
              <p className="text-[#9ba8b5]">
                Entre com seu e-mail e senha para acessar sua conta
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                  E-mail
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label htmlFor="password" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                  Senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] hover:text-[#57e389] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Esqueceu Senha */}
              <div className="text-right">
                <Link
                  to="/recuperar-senha"
                  className="text-[#57e389] text-sm font-medium hover:text-[#4bc979] transition-colors inline-flex items-center gap-1 group"
                >
                  Esqueceu sua senha?
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Botão Entrar */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#57e389] to-[#4bc979] hover:from-[#4bc979] hover:to-[#57e389] text-[#0D1B2A] font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#57e389]/30 hover:shadow-[#57e389]/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-[#0D1B2A] border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ENTRAR
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1d2c3f]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#111d2e] text-[#9ba8b5]">ou</span>
              </div>
            </div>

            {/* Cadastre-se */}
            <div className="text-center">
              <p className="text-[#9ba8b5] mb-4">Não tem uma conta?</p>
              <Link to="/cadastro">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#0a1520] border-2 border-[#57e389] text-[#57e389] font-bold py-4 px-6 rounded-xl hover:bg-[#57e389]/10 transition-all duration-300"
                >
                  CADASTRE-SE
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}