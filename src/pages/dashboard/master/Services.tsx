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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Gestão de Produtos/Serviços</h1>
        <Button size="sm" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" onClick={() => toast.info("Abrir modal de adicionar serviço (simulado)")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Serviço
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Lista de Serviços</CardTitle>
            <CardDescription className="text-muted-foreground">Gerencie os produtos e serviços oferecidos na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">Descrição</TableHead>
                    <TableHead className="text-muted-foreground">Preço</TableHead>
                    <TableHead className="text-muted-foreground">Categoria</TableHead>
                    <TableHead className="text-muted-foreground">Disponibilidade</TableHead>
                    <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id} className="border-b border-border/50 hover:bg-background">
                      <TableCell className="font-medium text-foreground">{service.name}</TableCell>
                      <TableCell className="text-muted-foreground">{service.description}</TableCell>
                      <TableCell className="text-muted-foreground">R$ {service.price.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">{service.category}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${service.availability === "available" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {service.availability === "available" ? "Disponível" : "Indisponível"}
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
                            <DropdownMenuItem className="hover:bg-muted cursor-pointer" onClick={() => toast.info(`Editar serviço ${service.name}`)}>Editar</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem className="text-destructive hover:bg-destructive/20 cursor-pointer" onClick={() => handleDeleteService(service.id)}>Excluir</DropdownMenuItem>
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
            <CardTitle className="text-foreground">Adicionar Novo Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddService} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="service-name" className="text-foreground">Nome</Label>
                <Input
                  id="service-name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  required
                  className="bg-background border-border text-foreground focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-description" className="text-foreground">Descrição</Label>
                <Input
                  id="service-description"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  required
                  className="bg-background border-border text-foreground focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-price" className="text-foreground">Preço</Label>
                <Input
                  id="service-price"
                  type="number"
                  step="0.01"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                  required
                  className="bg-background border-border text-foreground focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-category" className="text-foreground">Categoria</Label>
                <Input
                  id="service-category"
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  className="bg-background border-border text-foreground focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-availability" className="text-foreground">Disponibilidade</Label>
                <select
                  id="service-availability"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  value={newService.availability}
                  onChange={(e) => setNewService({ ...newService, availability: e.target.value as "available" | "unavailable" })}
                >
                  <option value="available">Disponível</option>
                  <option value="unavailable">Indisponível</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-image" className="text-foreground">URL da Imagem</Label>
                <Input
                  id="service-image"
                  value={newService.imageUrl}
                  onChange={(e) => setNewService({ ...newService, imageUrl: e.target.value })}
                  className="bg-background border-border text-foreground focus:ring-primary"
                />
              </div>
              <Button type="submit" className="self-end uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">Adicionar Serviço</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </MasterDashboardLayout>
  );
};

export default ServicesPage;