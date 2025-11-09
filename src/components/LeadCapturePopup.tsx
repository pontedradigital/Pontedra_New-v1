"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Phone, Mail, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { submitLeadPopup } from "@/services/leadCapture";

interface LeadCapturePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCaptured: () => void;
}

const LeadCapturePopup: React.FC<LeadCapturePopupProps> = ({ isOpen, onClose, onLeadCaptured }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const formatarTelefone = (value: string) => {
    const numero = value.replace(/\D/g, '');
    if (numero.length <= 11) {
      return numero
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return phone; // Retorna o telefone atual se a entrada for muito longa
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await submitLeadPopup({ name, phone, email });
      if (success) {
        toast.success("Obrigado! Entraremos em contato em breve.");
        setName("");
        setPhone("");
        setEmail("");
        onLeadCaptured(); // Sinaliza que o lead foi capturado
        onClose();
      } else {
        toast.error("Ocorreu um erro ao enviar. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao enviar lead do popup:", error);
      toast.error("Não foi possível enviar sua mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#111d2e] border-[#1d2c3f] text-[#e1e8f0] rounded-2xl p-6">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-10 h-10 text-[#57e389] animate-pulse-slow" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">Não perca essa oportunidade!</DialogTitle>
          <DialogDescription className="text-[#9ba8b5]">
            Deixe seus dados e receba uma consultoria gratuita para impulsionar seu negócio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="popup-name" className="text-white">Nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-4 h-4" />
              <Input
                id="popup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="pl-10 bg-[#0a1520] border-[#1d2c3f] text-white placeholder:text-[#4a5a6a]"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="popup-phone" className="text-white">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-4 h-4" />
              <Input
                id="popup-phone"
                value={phone}
                onChange={(e) => setPhone(formatarTelefone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="pl-10 bg-[#0a1520] border-[#1d2c3f] text-white placeholder:text-[#4a5a6a]"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="popup-email" className="text-white">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ba8b5] w-4 h-4" />
              <Input
                id="popup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-10 bg-[#0a1520] border-[#1d2c3f] text-white placeholder:text-[#4a5a6a]"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#57e389] text-[#0D1B2A] hover:bg-[#4bc979] font-bold">
            {loading ? "Enviando..." : "Receber Consultoria Gratuita"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCapturePopup;