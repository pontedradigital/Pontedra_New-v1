import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth(); // Get user from useAuth
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      // After successful login, the user state in AuthContext should be updated.
      // We can rely on the user object from useAuth directly.
      if (user?.role === "master") { // Check user role from context
        navigate("/dashboard/master");
      } else if (user?.role === "client") {
        navigate("/dashboard/cliente");
      } else {
        navigate("/"); // Fallback
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
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
  );
};

export default Login;