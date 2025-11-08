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
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Meus Agendamentos</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agendar Novo Serviço</CardTitle>
            <CardDescription>Escolha a data, hora e serviço para seu próximo agendamento.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col items-center space-y-4">
              <Label htmlFor="date-picker">Selecione a Data</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time-select">Selecione a Hora</Label>
              <Select onValueChange={setSelectedTime} value={selectedTime}>
                <SelectTrigger id="time-select">
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_AVAILABLE_TIMES.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-select">Selecione o Serviço</Label>
              <Select onValueChange={setSelectedService} value={selectedService}>
                <SelectTrigger id="service-select">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScheduleAppointment} className="w-full">
              Agendar Serviço
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus Agendamentos</CardTitle>
            <CardDescription>Visualize seus agendamentos futuros e passados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientAppointments.length > 0 ? (
                  clientAppointments.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.serviceName}</TableCell>
                      <TableCell>{app.date}</TableCell>
                      <TableCell>{app.time}</TableCell>
                      <TableCell>{app.status}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
};

export default AgendaPage;