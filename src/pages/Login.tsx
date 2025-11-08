import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/sections/Footer"; // Importar Footer

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de autenticação removida. Este formulário é apenas visual.
    console.log("Login simulado:", { email, password });
    alert("Login simulado. Nenhuma autenticação real está ocorrendo.");
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
                <img src="/pontedra-logo.webp" alt="Pontedra Logo" className="h-28 w-auto" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Login</CardTitle>
              <CardDescription className="text-muted-foreground">
                Entre com seu e-mail e senha para acessar sua conta.
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
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-foreground">Senha</Label>
                    <Link to="#" className="ml-auto inline-block text-sm underline text-primary hover:text-primary/80">
                      Esqueceu sua senha?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="w-full uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
                  Entrar
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/register" className="underline text-primary hover:text-primary/80">
                  Cadastre-se
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer /> {/* Adicionado Footer */}
    </div>
  );
};

export default Login;