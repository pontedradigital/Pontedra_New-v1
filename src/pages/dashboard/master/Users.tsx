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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Gestão de Clientes</h1>
        <Button size="sm" onClick={() => toast.info("Abrir modal de adicionar cliente (simulado)")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Gerencie os clientes da sua plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.company}</TableCell>
                  <TableCell>{client.status === "active" ? "Ativo" : "Inativo"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => toast.info(`Editar cliente ${client.name}`)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(client.email)}>Redefinir Senha</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAccessAsClient(client.email)}>Acessar como Cliente</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteClient(client.id)} className="text-red-600">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Adicionar Novo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddClient} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="client-name">Nome</Label>
              <Input
                id="client-name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-email">E-mail</Label>
              <Input
                id="client-email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-phone">Telefone</Label>
              <Input
                id="client-phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-company">Empresa</Label>
              <Input
                id="client-company"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-status">Status</Label>
              <select
                id="client-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newClient.status}
                onChange={(e) => setNewClient({ ...newClient, status: e.target.value as "active" | "inactive" })}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <Button type="submit" className="self-end">Adicionar Cliente</Button>
          </form>
        </CardContent>
      </Card>
    </MasterDashboardLayout>
  );
};

export default UsersPage;