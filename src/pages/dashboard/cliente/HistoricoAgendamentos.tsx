import React, { useState, useEffect } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  CalendarCheck,
  Clock,
  XCircle,
  List,
  Search,
  CalendarDays,
  User,
  DollarSign,
  Info,
  RefreshCcw,
  PlusCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { DetailedClientAppointment, AppointmentStatus, MOCK_CLIENT_DETAILED_APPOINTMENT_HISTORY } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.3, ease: "easeIn" } },
};

const HistoricoAgendamentosPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allAppointments, setAllAppointments] = useState<DetailedClientAppointment[]>(
    MOCK_CLIENT_DETAILED_APPOINTMENT_HISTORY.filter(app => app.clientEmail === user?.email)
  );
  const [filteredAppointments, setFilteredAppointments] = useState<DetailedClientAppointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | "Todos">("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState<DetailedClientAppointment | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<DetailedClientAppointment | null>(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<DetailedClientAppointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<Date | undefined>(undefined);
  const [newRescheduleTime, setNewRescheduleTime] = useState<string | undefined>(undefined);

  useEffect(() => {
    let tempAppointments = allAppointments;

    // Filter by status
    if (filterStatus !== "Todos") {
      tempAppointments = tempAppointments.filter(app => app.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempAppointments = tempAppointments.filter(
        app =>
          app.service.toLowerCase().includes(lowerCaseSearchTerm) ||
          app.professional.toLowerCase().includes(lowerCaseSearchTerm) ||
          app.dateTime.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Sort by date (future first, then past)
    tempAppointments.sort((a, b) => {
      const dateA = parseISO(a.dateTime);
      const dateB = parseISO(b.dateTime);
      const now = new Date();

      const isAFuture = dateA.getTime() > now.getTime();
      const isBFuture = dateB.getTime() > now.getTime();

      if (isAFuture && !isBFuture) return -1;
      if (!isAFuture && isBFuture) return 1;
      if (isAFuture && isBFuture) return dateA.getTime() - dateB.getTime(); // Ascending for future
      return dateB.getTime() - dateA.getTime(); // Descending for past
    });

    setFilteredAppointments(tempAppointments);
  }, [allAppointments, filterStatus, searchTerm]);

  const getStatusClasses = (status: AppointmentStatus) => {
    switch (status) {
      case "Agendado":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Concluído":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Cancelado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Pendente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleViewDetails = (appointment: DetailedClientAppointment) => {
    setSelectedAppointmentDetail(appointment);
    setIsDetailModalOpen(true);
  };

  const handleCancelClick = (appointment: DetailedClientAppointment) => {
    setAppointmentToCancel(appointment);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (appointmentToCancel) {
      setAllAppointments(prev =>
        prev.map(app =>
          app.id === appointmentToCancel.id ? { ...app, status: "Cancelado" } : app
        )
      );
      toast.success(`Agendamento de ${appointmentToCancel.service} cancelado.`);
      setIsCancelModalOpen(false);
      setAppointmentToCancel(null);
    }
  };

  const handleRescheduleClick = (appointment: DetailedClientAppointment) => {
    setAppointmentToReschedule(appointment);
    setNewRescheduleDate(parseISO(appointment.dateTime.split(' ')[0]));
    setNewRescheduleTime(appointment.dateTime.split(' ')[1].substring(0, 5));
    setIsRescheduleModalOpen(true);
  };

  const confirmReschedule = () => {
    if (appointmentToReschedule && newRescheduleDate && newRescheduleTime) {
      const formattedDate = format(newRescheduleDate, "yyyy-MM-dd");
      const newDateTime = `${formattedDate} ${newRescheduleTime}`;

      setAllAppointments(prev =>
        prev.map(app =>
          app.id === appointmentToReschedule.id
            ? { ...app, dateTime: newDateTime, status: "Agendado" }
            : app
        )
      );
      toast.success(`Agendamento de ${appointmentToReschedule.service} reagendado para ${format(newRescheduleDate, "dd/MM/yyyy", { locale: ptBR })} às ${newRescheduleTime}.`);
      setIsRescheduleModalOpen(false);
      setAppointmentToReschedule(null);
      setNewRescheduleDate(undefined);
      setNewRescheduleTime(undefined);
    } else {
      toast.error("Por favor, selecione uma nova data e hora para reagendar.");
    }
  };

  const totalAppointments = allAppointments.length;
  const completedAppointments = allAppointments.filter(app => app.status === "Concluído").length;
  const pendingAppointments = allAppointments.filter(app => app.status === "Pendente" || app.status === "Agendado").length;
  const cancelledAppointments = allAppointments.filter(app => app.status === "Cancelado").length;

  return (
    <ClientDashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">Histórico e Controle de Agendamentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus compromissos, acompanhe status e visualize históricos anteriores.</p>
        </div>
        <Button size="sm" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20 uppercase" onClick={() => navigate("/dashboard/cliente/agenda")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento
        </Button>
      </div>

      {/* Resumo Estatístico */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalAppointments}</div>
              <p className="text-xs text-muted-foreground">Agendamentos</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Concluídos</CardTitle>
              <CalendarCheck className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{completedAppointments}</div>
              <p className="text-xs text-muted-foreground">Serviços finalizados</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pendingAppointments}</div>
              <p className="text-xs text-muted-foreground">Aguardando realização</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{cancelledAppointments}</div>
              <p className="text-xs text-muted-foreground">Agendamentos desfeitos</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filtros e Busca */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="mb-6">
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Filtrar Agendamentos</CardTitle>
            <CardDescription className="text-muted-foreground">Encontre rapidamente seus compromissos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por serviço ou data"
                  className="w-full pl-9 bg-background border-border text-foreground focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap justify-center md:justify-end">
                <Button
                  variant={filterStatus === "Todos" ? "default" : "outline"}
                  className={filterStatus === "Todos" ? "bg-primary text-background hover:bg-primary/90" : "bg-background border-border text-foreground hover:bg-muted"}
                  onClick={() => setFilterStatus("Todos")}
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === "Pendente" ? "default" : "outline"}
                  className={filterStatus === "Pendente" ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" : "bg-background border-border text-foreground hover:bg-muted"}
                  onClick={() => setFilterStatus("Pendente")}
                >
                  Pendentes
                </Button>
                <Button
                  variant={filterStatus === "Agendado" ? "default" : "outline"}
                  className={filterStatus === "Agendado" ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-background border-border text-foreground hover:bg-muted"}
                  onClick={() => setFilterStatus("Agendado")}
                >
                  Agendados
                </Button>
                <Button
                  variant={filterStatus === "Concluído" ? "default" : "outline"}
                  className={filterStatus === "Concluído" ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-background border-border text-foreground hover:bg-muted"}
                  onClick={() => setFilterStatus("Concluído")}
                >
                  Concluídos
                </Button>
                <Button
                  variant={filterStatus === "Cancelado" ? "default" : "outline"}
                  className={filterStatus === "Cancelado" ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-background border-border text-foreground hover:bg-muted"}
                  onClick={() => setFilterStatus("Cancelado")}
                >
                  Cancelados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lista de Agendamentos */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: index * 0.05 + 0.6 }}
              >
                <Card className="bg-card border-border shadow-lg rounded-2xl h-full flex flex-col justify-between hover:border-primary hover:scale-[1.01] transition-all duration-300 ease-out">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-xl">{appointment.service}</CardTitle>
                    <CardDescription className="text-muted-foreground flex items-center gap-1">
                      <User className="h-4 w-4" /> {appointment.professional}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{format(parseISO(appointment.dateTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <DollarSign className="h-4 w-4" />
                      <span>R$ {appointment.value.toFixed(2)}</span>
                    </div>
                    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border", getStatusClasses(appointment.status))}>
                      {appointment.status}
                    </span>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 p-4 border-t border-border/50">
                    <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => handleViewDetails(appointment)}>
                      <Info className="h-4 w-4 mr-2" /> Detalhes
                    </Button>
                    {appointment.status === "Agendado" || appointment.status === "Pendente" ? (
                      <>
                        <Button variant="secondary" size="sm" className="bg-muted text-foreground hover:bg-muted/80" onClick={() => handleRescheduleClick(appointment)}>
                          <RefreshCcw className="h-4 w-4 mr-2" /> Reagendar
                        </Button>
                        <Button variant="destructive" size="sm" className="hover:bg-destructive/80" onClick={() => handleCancelClick(appointment)}>
                          <XCircle className="h-4 w-4 mr-2" /> Cancelar
                        </Button>
                      </>
                    ) : null}
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:col-span-2 flex items-center justify-center rounded-2xl border border-dashed border-border shadow-sm bg-card p-8 text-center"
            >
              <div className="flex flex-col items-center gap-2">
                <CalendarDays className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Nenhum agendamento encontrado.
                </h3>
                <p className="text-sm text-muted-foreground">
                  Parece que você não tem agendamentos com os filtros aplicados.
                </p>
                <Button className="mt-4 uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" onClick={() => navigate("/dashboard/cliente/agenda")}>
                  Agendar um Serviço
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalhes do Agendamento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informações completas sobre o serviço agendado.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointmentDetail && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Serviço:</span>
                <span className="col-span-2 text-muted-foreground">{selectedAppointmentDetail.service}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Profissional:</span>
                <span className="col-span-2 text-muted-foreground">{selectedAppointmentDetail.professional}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Data e Hora:</span>
                <span className="col-span-2 text-muted-foreground">{format(parseISO(selectedAppointmentDetail.dateTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Valor:</span>
                <span className="col-span-2 text-muted-foreground">R$ {selectedAppointmentDetail.value.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Status:</span>
                <span className={cn("col-span-2 font-medium", getStatusClasses(selectedAppointmentDetail.status))}>{selectedAppointmentDetail.status}</span>
              </div>
              {selectedAppointmentDetail.notes && (
                <div className="grid grid-cols-3 items-start gap-4">
                  <span className="text-foreground font-medium">Observações:</span>
                  <span className="col-span-2 text-muted-foreground">{selectedAppointmentDetail.notes}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="border-t border-border/50 pt-4">
            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => setIsDetailModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Cancelamento */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirmar Cancelamento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tem certeza que deseja cancelar o agendamento de <span className="font-semibold text-foreground">{appointmentToCancel?.service}</span> em <span className="font-semibold text-foreground">{appointmentToCancel ? format(parseISO(appointmentToCancel.dateTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ''}</span>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-border/50 pt-4">
            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => setIsCancelModalOpen(false)}>
              Manter Agendamento
            </Button>
            <Button variant="destructive" onClick={confirmCancel} className="hover:bg-destructive/80">
              Sim, Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Reagendamento */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Reagendar Agendamento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Selecione uma nova data e hora para o agendamento de <span className="font-semibold text-foreground">{appointmentToReschedule?.service}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center space-y-4">
              <Label htmlFor="new-date-picker" className="text-foreground">Nova Data</Label>
              <Calendar
                mode="single"
                selected={newRescheduleDate}
                onSelect={setNewRescheduleDate}
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
              <Label htmlFor="new-time-select" className="text-foreground">Nova Hora</Label>
              <Input
                id="new-time-select"
                type="time"
                value={newRescheduleTime}
                onChange={(e) => setNewRescheduleTime(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-primary"
                required
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border/50 pt-4">
            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => setIsRescheduleModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmReschedule} className="uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
              Confirmar Reagendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientDashboardLayout>
  );
};

export default HistoricoAgendamentosPage;