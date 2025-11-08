import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LandingNavbar from "@/components/LandingNavbar";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    // Lógica de registro removida. Este formulário é apenas visual.
    console.log("Cadastro simulado:", { email, password });
    toast.success("Cadastro simulado realizado com sucesso!");
    // Em um cenário real, você redirecionaria para o login após o cadastro.
    // navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <LandingNavbar />
      <div className="flex flex-1 items-center justify-center mt-16">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mx-auto max-w-sm bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <img src="/pontedra-logo.webp" alt="Pontedra Logo" className="h-10 w-auto" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Cadastre-se</CardTitle>
              <CardDescription className="text-muted-foreground">
                Crie sua conta para começar a usar a plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password" className="text-foreground">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="w-full uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
                  Cadastrar
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/login" className="underline text-primary hover:text-primary/80">
                  Entrar
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;