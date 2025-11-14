import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Building, MapPin, Phone, CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefone: "",
    company_organization: "",
    address_street: "",
    address_number: "",
    address_complement: "",
    address_neighborhood: "",
    address_city: "",
    address_state: "",
    address_cep: "",
    date_of_birth: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, ''); // Remove tudo que não é dígito
    let formatted = '';

    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) { // (00) 0000
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 10) { // (00) 0000-0000 (fixo)
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length <= 11) { // (00) 00000-0000 (celular)
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    } else {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`; // Limita a 11 dígitos
    }
    return formatted;
  };

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else if (name === 'address_cep') {
      setFormData(prev => ({ ...prev, [name]: formatCep(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    const { first_name, last_name, email, password, confirmPassword, ...optional_data } = formData;

    const success = await register(email, password, first_name, last_name, optional_data);
    
    if (success) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] relative overflow-hidden flex items-center justify-center py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#57e389]/10 via-transparent to-transparent" />
        
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

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="https://qtuctrqomfwvantainjc.supabase.co/storage/v1/object/public/images/pontedra-logo.webp"
              alt="Pontedra Logo"
              className="h-12 w-auto drop-shadow-[0_0_10px_rgba(87,227,137,0.4)]"
            />
          </Link>
        </div>
      </header>

      {/* Cadastro Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl mx-4" // Aumentado max-w para acomodar mais campos
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#57e389] to-[#00b4ff] rounded-3xl blur-xl opacity-20" />
        
        <div className="relative bg-[#111d2e]/90 backdrop-blur-2xl border border-[#1d2c3f] rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <img
              src="https://qtuctrqomfwvantainjc.supabase.co/storage/v1/object/public/images/pontedra-logo.webp"
              alt="Pontedra Logo"
              className="h-20 w-auto mx-auto mb-6 drop-shadow-[0_0_20px_rgba(87,227,137,0.6)]"
            />

            <h1 className="text-3xl font-bold text-white mb-2">Cadastre-se</h1>
            <p className="text-[#9ba8b5]">
              Crie sua conta e comece a usar nossa plataforma
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Nome */}
            <div>
              <label htmlFor="first_name" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Nome *
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                />
              </div>
            </div>

            {/* Sobrenome */}
            <div>
              <label htmlFor="last_name" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Sobrenome *
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Seu sobrenome"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                E-mail *
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Telefone
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15} // (00) 00000-0000
                  className="w-full pl-12 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                />
              </div>
            </div>

            {/* Empresa/Organização */}
            <div>
              <label htmlFor="company_organization" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Empresa/Organização
              </label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                <input
                  type="text"
                  id="company_organization"
                  name="company_organization"
                  value={formData.company_organization}
                  onChange={handleChange}
                  placeholder="Nome da sua empresa"
                  className="w-full pl-12 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                />
              </div>
            </div>

            {/* Data de Nascimento */}
            <div>
              <label htmlFor="date_of_birth" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Data de Nascimento
              </label>
              <div className="relative group">
                <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                />
              </div>
            </div>

            {/* Endereço (linha completa) */}
            <div className="md:col-span-2">
              <label htmlFor="address_street" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Endereço
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                <input
                  type="text"
                  id="address_street"
                  name="address_street"
                  value={formData.address_street}
                  onChange={handleChange}
                  placeholder="Rua, Avenida, etc."
                  className="w-full pl-12 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                />
              </div>
            </div>

            {/* Número e Complemento */}
            <div>
              <label htmlFor="address_number" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Número
              </label>
              <input
                type="text"
                id="address_number"
                name="address_number"
                value={formData.address_number}
                onChange={handleChange}
                placeholder="123"
                className="w-full pl-4 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="address_complement" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Complemento
              </label>
              <input
                type="text"
                id="address_complement"
                name="address_complement"
                value={formData.address_complement}
                onChange={handleChange}
                placeholder="Apto, Bloco, etc."
                className="w-full pl-4 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
              />
            </div>

            {/* Bairro e Cidade */}
            <div>
              <label htmlFor="address_neighborhood" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Bairro
              </label>
              <input
                type="text"
                id="address_neighborhood"
                name="address_neighborhood"
                value={formData.address_neighborhood}
                onChange={handleChange}
                placeholder="Seu bairro"
                className="w-full pl-4 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="address_city" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Cidade
              </label>
              <input
                type="text"
                id="address_city"
                name="address_city"
                value={formData.address_city}
                onChange={handleChange}
                placeholder="Sua cidade"
                className="w-full pl-4 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
              />
            </div>

            {/* Estado e CEP */}
            <div>
              <label htmlFor="address_state" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Estado
              </label>
              <input
                type="text"
                id="address_state"
                name="address_state"
                value={formData.address_state}
                onChange={handleChange}
                placeholder="Seu estado"
                className="w-full pl-4 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="address_cep" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                CEP
              </label>
              <input
                type="text"
                id="address_cep"
                name="address_cep"
                value={formData.address_cep}
                onChange={handleChange}
                maxLength={9} // 00000-000
                placeholder="00000-000"
                className="w-full pl-4 pr-4 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Senha *
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] hover:text-[#57e389] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[#e1e8f0] text-sm font-medium mb-2">
                Confirmar Senha *
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-5 h-5 group-focus-within:text-[#57e389] transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-[#0a1520] border border-[#1d2c3f] rounded-xl text-white placeholder-[#4a5a6a] focus:outline-none focus:border-[#57e389] focus:ring-2 focus:ring-[#57e389]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] hover:text-[#57e389] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão Cadastrar */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="md:col-span-2 w-full bg-gradient-to-r from-[#57e389] to-[#4bc979] hover:from-[#4bc979] hover:to-[#57e389] text-[#0D1B2A] font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#57e389]/30 hover:shadow-[#57e389]/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-[#0D1B2A] border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Cadastrando...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  CRIAR CONTA
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>
          </form>

          {/* Já tem conta */}
          <div className="mt-8 text-center">
            <p className="text-[#9ba8b5]">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-[#57e389] font-semibold hover:text-[#4bc979] transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer Link */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <Link
          to="/"
          className="text-[#9ba8b5] hover:text-[#57e389] transition-colors text-sm inline-flex items-center gap-2 group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Voltar para o site
        </Link>
      </div>
    </div>
  );
}