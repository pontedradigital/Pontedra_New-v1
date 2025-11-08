import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "a1", clientName: "João Silva", serviceName: "Corte de Cabelo Masculino", date: "2024-10-15", time: "10:00", status: "confirmed" },
  { id: "a2", clientName: "Maria Souza", serviceName: "Manicure e Pedicure", date: "2024-10-15", time: "14:30", status: "pending" },
  { id: "a3", clientName: "Pedro Lima", serviceName: "Massagem Relaxante", date: "2024-10-16", time: "11:00", status: "completed" },
  { id: "a4", clientName: "Ana Costa", serviceName: "Corte de Cabelo Feminino", date: "2024-10-16", time: "16:00", status: "cancelled" },
];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [filters, setFilters] = useState({ client: "", date: "", status: "" });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.id]: e.target.value });
  };

  const filteredAppointments = appointments.filter(app => {
    return (
      (filters.client === "" || app.clientName.toLowerCase().includes(filters.client.toLowerCase())) &&
      (filters.date === "" || app.date === filters.date) &&
      (filters.status === "" || app.status === filters.status)
    );
  });

  const handleUpdateStatus = (id: string, newStatus: Appointment["status"]) => {
    setAppointments(appointments.map(app => app.id === id ? { ...app, status: newStatus } : app));
    toast.success(`Status do agendamento ${id} atualizado para ${newStatus}.`);
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Gestão de Agendamentos</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Filtros de Agendamento</CardTitle>
            <CardDescription className="text-muted-foreground">Filtre os agendamentos por cliente, data ou status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="client" className="text-foreground">Cliente</Label>
                <Input id="client" value={filters.client} onChange={handleFilterChange} placeholder="Nome do cliente" className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-foreground">Data</Label>
                <Input id="date" type="date" value={filters.date} onChange={handleFilterChange} className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-foreground">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
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
            <CardTitle className="text-foreground">Agendamentos</CardTitle>
            <CardDescription className="text-muted-foreground">Visualize e gerencie todos os agendamentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Serviço</TableHead>
                    <TableHead className="text-muted-foreground">Data</TableHead>
                    <TableHead className="text-muted-foreground">Hora</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((app) => (
                    <TableRow key={app.id} className="border-b border-border/50 hover:bg-background">
                      <TableCell className="font-medium text-foreground">{app.clientName}</TableCell>
                      <TableCell className="text-muted-foreground">{app.serviceName}</TableCell>
                      <TableCell className="text-muted-foreground">{app.date}</TableCell>
                      <TableCell className="text-muted-foreground">{app.time}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          app.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                          app.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          app.status === "completed" ? "bg-blue-500/20 text-blue-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {app.status}
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
                            <DropdownMenuItem className="hover:bg-muted cursor-pointer" onClick={() => handleUpdateStatus(app.id, "confirmed")}>Confirmar</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-muted cursor-pointer" onClick={() => handleUpdateStatus(app.id, "completed")}>Concluir</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem className="text-destructive hover:bg-destructive/20 cursor-pointer" onClick={() => handleUpdateStatus(app.id, "cancelled")}>Cancelar</DropdownMenuItem>
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
    </MasterDashboardLayout>
  );
};

export default AppointmentsPage;