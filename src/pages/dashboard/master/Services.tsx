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

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  availability: "available" | "unavailable";
  imageUrl?: string;
}

const MOCK_SERVICES: Service[] = [
  { id: "s1", name: "Corte de Cabelo Masculino", description: "Corte moderno com lavagem e finalização.", price: 50.00, category: "Cabelo", availability: "available" },
  { id: "s2", name: "Manicure e Pedicure", description: "Serviço completo de unhas.", price: 80.00, category: "Estética", availability: "available" },
  { id: "s3", name: "Massagem Relaxante", description: "Sessão de 60 minutos para alívio do estresse.", price: 120.00, category: "Bem-estar", availability: "unavailable" },
];

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [newService, setNewService] = useState({ name: "", description: "", price: 0, category: "", availability: "available" as "available" | "unavailable", imageUrl: "" });

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `s${services.length + 1}`;
    setServices([...services, { id, ...newService }]);
    setNewService({ name: "", description: "", price: 0, category: "", availability: "available", imageUrl: "" });
    toast.success("Serviço adicionado com sucesso!");
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
    toast.info("Serviço excluído.");
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Gestão de Produtos/Serviços</h1>
        <Button size="sm" onClick={() => toast.info("Abrir modal de adicionar serviço (simulado)")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Serviço
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>Gerencie os produtos e serviços oferecidos na plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Disponibilidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>R$ {service.price.toFixed(2)}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>{service.availability === "available" ? "Disponível" : "Indisponível"}</TableCell>
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
                        <DropdownMenuItem onClick={() => toast.info(`Editar serviço ${service.name}`)}>Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteService(service.id)} className="text-red-600">Excluir</DropdownMenuItem>
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
          <CardTitle>Adicionar Novo Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddService} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="service-name">Nome</Label>
              <Input
                id="service-name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-description">Descrição</Label>
              <Input
                id="service-description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-price">Preço</Label>
              <Input
                id="service-price"
                type="number"
                step="0.01"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-category">Categoria</Label>
              <Input
                id="service-category"
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-availability">Disponibilidade</Label>
              <select
                id="service-availability"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newService.availability}
                onChange={(e) => setNewService({ ...newService, availability: e.target.value as "available" | "unavailable" })}
              >
                <option value="available">Disponível</option>
                <option value="unavailable">Indisponível</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-image">URL da Imagem</Label>
              <Input
                id="service-image"
                value={newService.imageUrl}
                onChange={(e) => setNewService({ ...newService, imageUrl: e.target.value })}
              />
            </div>
            <Button type="submit" className="self-end">Adicionar Serviço</Button>
          </form>
        </CardContent>
      </Card>
    </MasterDashboardLayout>
  );
};

export default ServicesPage;