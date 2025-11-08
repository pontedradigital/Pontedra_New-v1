import React, { useState } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { MOCK_CLIENT_SERVICES, MOCK_CLIENT_APPOINTMENTS, MOCK_AVAILABLE_TIMES, Service, Appointment } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label"; // Importar Label

const AgendaPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>(
    MOCK_CLIENT_APPOINTMENTS.filter(app => app.clientEmail === user?.email)
  );

  const availableServices = MOCK_CLIENT_SERVICES.filter(service => service.availability === "available");

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime || !selectedService || !user?.email) {
      toast.error("Por favor, selecione uma data, hora e serviço.");
      return;
    }

    const serviceDetails = availableServices.find(s => s.id === selectedService);
    if (!serviceDetails) {
      toast.error("Serviço inválido.");
      return;
    }

    const newAppointment: Appointment = {
      id: `a${clientAppointments.length + 1}`,
      clientEmail: user.email,
      serviceName: serviceDetails.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      status: "pending",
    };

    setClientAppointments([...clientAppointments, newAppointment]);
    toast.success("Agendamento realizado com sucesso!");
    setSelectedTime(undefined);
    setSelectedService(undefined);
  };

  return (
    <ClientDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Meus Agendamentos</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-foreground">Agendar Novo Serviço</CardTitle>
              <CardDescription className="text-muted-foreground">Escolha a data, hora e serviço para seu próximo agendamento.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-col items-center space-y-4">
                <Label htmlFor="date-picker" className="text-foreground">Selecione a Data</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="time-select" className="text-foreground">Selecione a Hora</Label>
                <Select onValueChange={setSelectedTime} value={selectedTime}>
                  <SelectTrigger id="time-select" className="bg-background border-border text-foreground focus:ring-primary">
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {MOCK_AVAILABLE_TIMES.map((time) => (
                      <SelectItem key={time} value={time} className="hover:bg-muted cursor-pointer">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-select" className="text-foreground">Selecione o Serviço</Label>
                <Select onValueChange={setSelectedService} value={selectedService}>
                  <SelectTrigger id="service-select" className="bg-background border-border text-foreground focus:ring-primary">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {availableServices.map((service) => (
                      <SelectItem key={service.id} value={service.id} className="hover:bg-muted cursor-pointer">
                        {service.name} - R$ {service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleScheduleAppointment} className="w-full uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
                Agendar Serviço
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-foreground">Meus Agendamentos</CardTitle>
              <CardDescription className="text-muted-foreground">Visualize seus agendamentos futuros e passados.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <TableHead className="text-muted-foreground">Serviço</TableHead>
                      <TableHead className="text-muted-foreground">Data</TableHead>
                      <TableHead className="text-muted-foreground">Hora</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientAppointments.length > 0 ? (
                      clientAppointments.map((app) => (
                        <TableRow key={app.id} className="border-b border-border/50 hover:bg-background">
                          <TableCell className="font-medium text-foreground">{app.serviceName}</TableCell>
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
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum agendamento encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ClientDashboardLayout>
  );
};

export default AgendaPage;