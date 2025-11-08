import React, { useState, useEffect } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMockData } from "@/context/MockContext";
import { format } from "date-fns";
import { MOCK_AVAILABLE_TIMES } from "@/data/mockData";

interface Appointment {
  id: string;
  clientEmail: string;
  serviceName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

const AppointmentsPage = () => {
  const { appointments, clients, services, updateAppointment, addAppointment, isLoading } = useMockData();
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(appointments);
  const [filters, setFilters] = useState({ client: "", date: "", status: "" });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientEmail: "",
    serviceName: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
  });

  useEffect(() => {
    const currentAppointments = appointments.filter(app => {
      const clientMatch = filters.client === "" || clients.find(c => c.email === app.clientEmail)?.name.toLowerCase().includes(filters.client.toLowerCase());
      const dateMatch = filters.date === "" || app.date === filters.date;
      const statusMatch = filters.status === "" || app.status === filters.status;
      return clientMatch && dateMatch && statusMatch;
    });
    setFilteredAppointments(currentAppointments);
  }, [appointments, filters, clients]);

  useEffect(() => {
    if (selectedDate) {
      setNewAppointment(prev => ({ ...prev, date: format(selectedDate, "yyyy-MM-dd") }));
    }
  }, [selectedDate]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.id]: e.target.value });
  };

  const handleUpdateStatus = async (id: string, newStatus: Appointment["status"]) => {
    await updateAppointment(id, { status: newStatus });
    toast.success(`Status do agendamento atualizado para ${newStatus}.`);
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.clientEmail || !newAppointment.serviceName || !newAppointment.date || !newAppointment.time) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    try {
      await addAppointment(newAppointment);
      setIsAddModalOpen(false);
      setNewAppointment({
        clientEmail: "",
        serviceName: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "",
        status: "pending",
      });
    } catch (error: any) {
      // A toast de erro já é exibida pelo MockContext
      console.error("Erro ao adicionar agendamento:", error.message);
    }
  };

  const getClientName = (email: string) => {
    return clients.find(c => c.email === email)?.name || email;
  };

  const getBookedTimesForNewAppointmentDate = () => {
    if (!newAppointment.date) return [];
    return appointments
      .filter(app => app.date === newAppointment.date)
      .map(app => app.time);
  };

  const bookedTimesForNewAppointment = getBookedTimesForNewAppointmentDate();

  return (
    <MasterDashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Gestão de Agendamentos</h1>
        <Button size="sm" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento
        </Button>
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
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              <div className="flex-1 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-border bg-background text-foreground"
                  classNames={{
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-muted text-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    nav_button: "text-foreground hover:bg-muted",
                    caption_label: "text-foreground",
                    head_cell: "text-muted-foreground",
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Agendamentos para {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "a data selecionada"}</h3>
                {filteredAppointments.filter(app => app.date === (selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")).length > 0 ? (
                  <ul className="space-y-2">
                    {filteredAppointments
                      .filter(app => app.date === (selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""))
                      .sort((a, b) => b.time.localeCompare(a.time)) // Descending time for same day
                      .map(app => (
                        <li key={app.id} className="flex justify-between items-center p-3 bg-background border border-border rounded-md shadow-sm">
                          <div>
                            <p className="font-medium text-foreground">{app.serviceName}</p>
                            <p className="text-sm text-muted-foreground">{getClientName(app.clientEmail)} às {app.time}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            app.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                            app.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                            app.status === "completed" ? "bg-blue-500/20 text-blue-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {app.status}
                          </span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Nenhum agendamento para esta data.</p>
                )}
              </div>
            </div>

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
                  {filteredAppointments
                    .sort((a, b) => {
                      const dateTimeA = new Date(`${a.date}T${a.time}`);
                      const dateTimeB = new Date(`${b.date}T${b.time}`);
                      return dateTimeB.getTime() - dateTimeA.getTime(); // Descending order (most recent first)
                    })
                    .map((app) => (
                      <TableRow key={app.id} className="border-b border-border/50 hover:bg-background">
                        <TableCell className="font-medium text-foreground">{getClientName(app.clientEmail)}</TableCell>
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

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Novo Agendamento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Crie um novo agendamento para um cliente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAppointment} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientEmail" className="text-foreground">Cliente</Label>
              <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, clientEmail: value })} value={newAppointment.clientEmail}>
                <SelectTrigger id="clientEmail" className="bg-background border-border text-foreground focus:ring-primary">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.email} className="hover:bg-muted cursor-pointer">
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceName" className="text-foreground">Serviço</Label>
              <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, serviceName: value })} value={newAppointment.serviceName}>
                <SelectTrigger id="serviceName" className="bg-background border-border text-foreground focus:ring-primary">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {services.filter(s => s.availability === "available").map((service) => (
                    <SelectItem key={service.id} value={service.name} className="hover:bg-muted cursor-pointer">
                      {service.name} (R$ {service.price.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-foreground">Data</Label>
              <Input
                id="date"
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                required
                className="bg-background border-border text-foreground focus:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time" className="text-foreground">Hora</Label>
              <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, time: value })} value={newAppointment.time}>
                <SelectTrigger id="time" className="bg-background border-border text-foreground focus:ring-primary">
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {MOCK_AVAILABLE_TIMES.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      className="hover:bg-muted cursor-pointer"
                      disabled={bookedTimesForNewAppointment.includes(time)}
                    >
                      {time} {bookedTimesForNewAppointment.includes(time) && "(Indisponível)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-foreground">Status Inicial</Label>
              <Select onValueChange={(value: "pending" | "confirmed" | "completed" | "cancelled") => setNewAppointment({ ...newAppointment, status: value })} value={newAppointment.status}>
                <SelectTrigger id="status" className="bg-background border-border text-foreground focus:ring-primary">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
          <DialogFooter className="border-t border-border/50 pt-4">
            <Button type="submit" onClick={handleAddAppointment} disabled={isLoading} className="uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
              {isLoading ? "Agendando..." : "Criar Agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MasterDashboardLayout>
  );
};

export default AppointmentsPage;