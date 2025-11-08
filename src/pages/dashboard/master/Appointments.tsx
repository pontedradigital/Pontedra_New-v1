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
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Gestão de Agendamentos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Agendamento</CardTitle>
          <CardDescription>Filtre os agendamentos por cliente, data ou status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente</Label>
              <Input id="client" value={filters.client} onChange={handleFilterChange} placeholder="Nome do cliente" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={filters.date} onChange={handleFilterChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
          <CardDescription>Visualize e gerencie todos os agendamentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.clientName}</TableCell>
                  <TableCell>{app.serviceName}</TableCell>
                  <TableCell>{app.date}</TableCell>
                  <TableCell>{app.time}</TableCell>
                  <TableCell>{app.status}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "confirmed")}>Confirmar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "completed")}>Concluir</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateStatus(app.id, "cancelled")} className="text-red-600">Cancelar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MasterDashboardLayout>
  );
};

export default AppointmentsPage;