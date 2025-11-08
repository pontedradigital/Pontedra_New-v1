import React, { useState } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const PerfilPage = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.email?.split('@')[0] || "Cliente Pontedra");
  const [email, setEmail] = useState(user?.email || "cliente@teste.com");
  const [phone, setPhone] = useState("5511987654321");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    // Simulate saving changes
    console.log("Profile updated:", { name, email, phone, password: password ? "******" : "unchanged" });
    toast.success("Perfil atualizado com sucesso!");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <ClientDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Meu Perfil</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Informações do Perfil</CardTitle>
            <CardDescription className="text-muted-foreground">Atualize seus dados pessoais e de contato.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveChanges} className="grid gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{name}</h3>
                  <p className="text-sm text-muted-foreground">Plano: Cliente Padrão</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-foreground">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-foreground">Nova Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Deixe em branco para não alterar" className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password" className="text-foreground">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <Button type="submit" className="w-full uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </ClientDashboardLayout>
  );
};

export default PerfilPage;