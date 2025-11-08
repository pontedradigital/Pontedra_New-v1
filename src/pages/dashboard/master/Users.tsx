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
import { useMockData } from "@/context/MockContext";

const UsersPage = () => {
  const { clients, addClient, deleteClient, updateClient, isLoading } = useMockData();
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", company: "" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email) {
      toast.error("Nome e E-mail são obrigatórios.");
      return;
    }
    try {
      await addClient({ ...newClient, status: "active" });
      setNewClient({ name: "", email: "", phone: "", company: "" });
      setIsAddModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar cliente.");
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir cliente.");
    }
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
        <Button size="sm" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" onClick={() => setIsAddModalOpen(true)}>
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

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Adicionar Novo Cliente</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Preencha os detalhes para adicionar um novo cliente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddClient} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground">Nome</Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                required
                className="bg-background border-border text-foreground focus:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-foreground">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                required
                className="bg-background border-border text-foreground focus:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-foreground">Telefone</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="bg-background border-border text-foreground focus:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company" className="text-foreground">Empresa</Label>
              <Input
                id="company"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                className="bg-background border-border text-foreground focus:ring-primary"
              />
            </div>
          </form>
          <DialogFooter className="border-t border-border/50 pt-4">
            <Button type="submit" onClick={handleAddClient} disabled={isLoading} className="uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
              {isLoading ? "Adicionando..." : "Adicionar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MasterDashboardLayout>
  );
};

export default UsersPage;