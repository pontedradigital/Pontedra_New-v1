import React, { useState } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { MOCK_CLIENT_SERVICES, MOCK_AVAILABLE_TIMES, Service, Appointment } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { useMockData } from "@/context/MockContext";
import AgendaCalendar from "@/components/AgendaCalendar";
import { CheckCircle2, XCircle } from "lucide-react";

const AgendaPage = () => {
  const { user } = useAuth();
  const { addClientAppointment, appointments } = useMockData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>(
    appointments.filter(app => app.clientEmail === user?.email)
  );

  React.useEffect(() => {
    setClientAppointments(appointments.filter(app => app.clientEmail === user?.email));
  }, [appointments, user]);

  const availableServices = MOCK_CLIENT_SERVICES.filter(service => service.availability === "available");

  const handleScheduleAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !user?.email) {
      toast.error("Por favor, selecione uma data, hora e serviço.");
      return;
    }

    const serviceDetails = availableServices.find(s => s.id === selectedService);
    if (!serviceDetails) {
      toast.error("Serviço inválido.");
      return;
    }

    const newAppointmentData: Omit<Appointment, "id" | "clientEmail"> = {
      serviceName: serviceDetails.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      status: "pending",
    };

    try {
      await addClientAppointment(newAppointmentData, user.email);
      setSelectedTime(undefined);
      setSelectedService(undefined);
    } catch (error: any) {
      console.error("Erro ao agendar:", error.message);
      toast.error(error.message || "Erro ao agendar serviço.");
    }
  };

  const getBookedTimesForSelectedDate = () => {
    if (!selectedDate) return [];
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    return appointments
      .filter(app => app.date === formattedDate)
      .map(app => app.time);
  };

  const bookedTimes = getBookedTimesForSelectedDate();

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
                <AgendaCalendar onSelectDate={setSelectedDate} selectedDate={selectedDate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time-select" className="text-foreground">Selecione a Hora</Label>
                <div className="grid grid-cols-3 gap-2">
                  {MOCK_AVAILABLE_TIMES.map((time) => {
                    const isBooked = bookedTimes.includes(time);
                    const isSelected = selectedTime === time;
                    return (
                      <Button
                        key={time}
                        variant={isSelected ? "default" : "outline"}
                        className={`flex items-center justify-center gap-1 ${
                          isBooked
                            ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border-border"
                            : isSelected
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-background border-border text-foreground hover:bg-muted"
                        }`}
                        onClick={() => !isBooked && setSelectedTime(time)}
                        disabled={isBooked}
                      >
                        {isBooked ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {time}
                      </Button>
                    );
                  })}
                </div>
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
                      clientAppointments
                        .sort((a, b) => {
                          const dateTimeA = new Date(`${a.date}T${a.time}`);
                          const dateTimeB = new Date(`${b.date}T${b.time}`);
                          return dateTimeB.getTime() - dateTimeA.getTime();
                        })
                        .map((app) => (
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