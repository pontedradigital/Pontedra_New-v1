import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive";
}

const MOCK_CLIENTS: Client[] = [
  { id: "1", name: "João Silva", email: "joao@example.com", phone: "11987654321", company: "Empresa A", status: "active" },
  { id: "2", name: "Maria Souza", email: "maria@example.com", phone: "21912345678", company: "Empresa B", status: "active" },
  { id: "3", name: "Pedro Lima", email: "pedro@example.com", phone: "31998765432", company: "Empresa C", status: "inactive" },
];

const UsersPage = () => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", company: "", status: "active" as "active" | "inactive" });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const id = (clients.length + 1).toString();
    setClients([...clients, { id, ...newClient }]);
    setNewClient({ name: "", email: "", phone: "", company: "", status: "active" });
    toast.success("Cliente adicionado com sucesso!");
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
    toast.info("Cliente excluído.");
  };

  const handleResetPassword = (email: string) => {
    toast.info(`Redefinir senha para ${email} (funcionalidade simulada).`);
  };

  const handleAccessAsClient = (email: string) => {
    toast.info(`Acessar como ${email} (funcionalidade simulada).`);
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Gestão de Clientes</h1>
        <Button size="sm" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" onClick={() => toast.info("Abrir modal de adicionar cliente (simulado)")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Lista de Clientes</CardTitle>
            <CardDescription className="text-muted-foreground">Gerencie os clientes da sua plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">E-mail</TableHead>
                    <TableHead className="text-muted-foreground">Telefone</TableHead>
                    <TableHead className="text-muted-foreground">Empresa</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="border-b border-border/50 hover:bg-background">
                      <TableCell className="font-medium text-foreground">{client.name}</TableCell>
                      <TableCell className="text-muted-foreground">{client.email}</TableCell>
                      <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{client.company}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${client.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {client.status === "active" ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:bg-background hover:text-primary">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                            <DropdownMenuLabel className="text-primary">Ações</DropdownMenuLabel>
                            <DropdownMenuItem className="hover:bg-muted cursor-pointer" onClick={() => toast.info(`Editar cliente ${client.name}`)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-muted cursor-pointer" onClick={() => handleResetPassword(client.email)}>Redefinir Senha</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-muted cursor-pointer" onClick={() => handleAccessAsClient(client.email)}>Acessar como Cliente</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem className="text-destructive hover:bg-destructive/20 cursor-pointer" onClick={() => handleDeleteClient(client.id)}>Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6"
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Adicionar Novo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddClient} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="client-name" className="text-foreground">Nome</Label>
                <Input
                  id="client-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  required
                  className="bg-background border-border text-foreground focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-email" className="text-foreground">E-mail</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  required
                  className="bg-background border-border text-foreground focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-phone" className="text-foreground">Telefone</Label>
                <Input
                  id="client-phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="bg-background border-border text-foreground focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-company" className="text-foreground">Empresa</Label>
                <Input
                  id="client-company"
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  className="bg-background border-border text-foreground focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-status" className="text-foreground">Status</Label>
                <select
                  id="client-status"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  value={newClient.status}
                  onChange={(e) => setNewClient({ ...newClient, status: e.target.value as "active" | "inactive" })}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <Button type="submit" className="self-end uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">Adicionar Cliente</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </MasterDashboardLayout>
  );
};

export default UsersPage;