import React, { useState, useEffect, useRef } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot as BotIcon, Loader2, Mic, CalendarDays, MessageSquareText, DollarSign, PhoneCall, History, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMockData } from "@/context/MockContext";
import { MOCK_CLIENT_SERVICES, MOCK_AVAILABLE_TIMES, MOCK_CLIENT_ACTIVITY_SUMMARY } from "@/data/mockData";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate, useLocation } from "react-router-dom";
import { AssistantMessage } from "@/components/chat/AssistantMessage";
import { assistentePontedraBase } from "@/data/assistentePontedraBase"; // Importar a base de conhecimento
import { registrarInteracao } from "@/utils/registroChat"; // Importar utilitário de registro
import { registrarAgendamento } from "@/utils/agendamentosFake"; // Importar utilitário de agendamento
import { atualizarBaseDeConhecimento, analisarPadroes } from "@/utils/assistentePontedraAprendizado"; // Importar módulo de aprendizado

interface Message {
  id: number;
  text: string;
  sender: "user" | "Assistente Pontedra";
  timestamp: string;
}

interface ChatState {
  messages: Message[];
  lastServiceMentioned: string | null;
  awaitingConfirmation: "service" | "date_time" | "final_confirm" | null;
  pendingAppointment: { serviceName: string; date: string; time: string } | null;
}

const LOCAL_STORAGE_KEY_CHAT = "pontedra_ia_chat_history";

const AtendimentoInteligentePage = () => {
  const { user } = useAuth();
  const { addClientAppointment, clientAppointments } = useMockData();
  const clientEmail = user?.email || "cliente@teste.com";
  const clientName = clientEmail.split('@')[0] || "Cliente";
  const navigate = useNavigate();
  const location = useLocation();

  const [chatState, setChatState] = useState<ChatState>(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY_CHAT);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        const messagesWithTimestamps = parsedState.messages.map((msg: Message) => ({
          ...msg,
          timestamp: msg.timestamp || new Date().toISOString(),
        }));
        return { ...parsedState, messages: messagesWithTimestamps };
      }
    }
    return {
      messages: [],
      lastServiceMentioned: null,
      awaitingConfirmation: null,
      pendingAppointment: null,
    };
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const proactiveTipIntervalRef = useRef<number | null>(null);

  const clientActivity = MOCK_CLIENT_ACTIVITY_SUMMARY;

  useEffect(() => {
    if (chatState.messages.length === 0) {
      setTimeout(() => {
        addBotMessage(assistentePontedraBase.saudacao[0]);
      }, 500);
    }

    if (location.state && (location.state as { initialMessage?: string }).initialMessage) {
      const initialMsg = (location.state as { initialMessage: string }).initialMessage;
      setInputMessage(initialMsg);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_CHAT, JSON.stringify(chatState));
    }
  }, [chatState]);

  useEffect(() => {
    const resetProactiveTimer = () => {
      if (proactiveTipIntervalRef.current) {
        clearInterval(proactiveTipIntervalRef.current);
      }
      proactiveTipIntervalRef.current = window.setInterval(() => {
        const tips = [
          assistentePontedraBase.promocoes,
          assistentePontedraBase.duvidas.servicos,
          assistentePontedraBase.duvidas.horario,
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        addBotMessage(randomTip);
      }, 60000); // Every 60 seconds
    };

    resetProactiveTimer();
    return () => {
      if (proactiveTipIntervalRef.current) {
        clearInterval(proactiveTipIntervalRef.current);
      }
    };
  }, [chatState.messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const addBotMessage = (text: string) => {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, { id: Date.now(), text, sender: "Assistente Pontedra", timestamp: new Date().toISOString() }],
    }));
  };

  const processUserMessage = async (userText: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    let botResponse: string = assistentePontedraBase.fallback[Math.floor(Math.random() * assistentePontedraBase.fallback.length)];
    let newLastServiceMentioned = chatState.lastServiceMentioned;
    let newAwaitingConfirmation = chatState.awaitingConfirmation;
    let newPendingAppointment = chatState.pendingAppointment;

    const lowerCaseText = userText.toLowerCase();

    // --- Lógica de Agendamento Multi-turn ---
    if (chatState.awaitingConfirmation === "service") {
      const service = MOCK_CLIENT_SERVICES.find(s => lowerCaseText.includes(s.name.toLowerCase()));
      if (service) {
        newPendingAppointment = { ...newPendingAppointment!, serviceName: service.name, date: "", time: "" };
        newAwaitingConfirmation = "date_time";
        newLastServiceMentioned = service.name;
        botResponse = assistentePontedraBase.agendamento.prompt_data_hora(service.name);
      } else {
        botResponse = assistentePontedraBase.agendamento.erro_servico_nao_encontrado;
      }
    } else if (chatState.awaitingConfirmation === "date_time" && newPendingAppointment) {
      const dateMatch = lowerCaseText.match(/(hoje|amanhã|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
      const timeMatch = lowerCaseText.match(/(\d{1,2}h(?::\d{2})?|\d{1,2}:\d{2})/);

      let parsedDate: Date | null = null;
      if (dateMatch) {
        if (dateMatch[1] === "hoje") {
          parsedDate = new Date();
        } else if (dateMatch[1] === "amanhã") {
          parsedDate = new Date();
          parsedDate.setDate(parsedDate.getDate() + 1);
        } else {
          const parts = dateMatch[1].split('/');
          if (parts.length === 2) {
            const year = new Date().getFullYear();
            parsedDate = parseISO(`${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
          } else if (parts.length === 3) {
            const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            parsedDate = parseISO(`${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
          }
        }
      }

      const formattedDate = parsedDate && isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd") : null;
      const formattedTime = timeMatch ? timeMatch[1].replace('h', ':').padEnd(5, '0') : null;

      if (formattedDate && formattedTime && MOCK_AVAILABLE_TIMES.includes(formattedTime)) {
        newPendingAppointment = { ...newPendingAppointment, date: formattedDate, time: formattedTime };
        newAwaitingConfirmation = "final_confirm";
        botResponse = assistentePontedraBase.agendamento.confirmacao(
          newPendingAppointment.serviceName,
          format(parseISO(newPendingAppointment.date), "dd/MM/yyyy", { locale: ptBR }),
          newPendingAppointment.time
        );
      } else {
        botResponse = assistentePontedraBase.agendamento.erro_data_hora_invalida;
      }
    } else if (chatState.awaitingConfirmation === "final_confirm" && newPendingAppointment) {
      if (lowerCaseText.includes("sim") || lowerCaseText.includes("confirmar")) {
        await addClientAppointment({
          clientEmail: clientEmail,
          serviceName: newPendingAppointment.serviceName,
          date: newPendingAppointment.date,
          time: newPendingAppointment.time,
          status: "confirmed",
        }, clientEmail);
        
        registrarAgendamento(
          newPendingAppointment.serviceName,
          format(parseISO(newPendingAppointment.date), "dd/MM/yyyy", { locale: ptBR }),
          newPendingAppointment.time,
          clientEmail
        );

        botResponse = assistentePontedraBase.agendamento.sucesso(
          newPendingAppointment.serviceName,
          format(parseISO(newPendingAppointment.date), "dd/MM/yyyy", { locale: ptBR }),
          newPendingAppointment.time
        );
        newAwaitingConfirmation = null;
        newPendingAppointment = null;
        newLastServiceMentioned = null;
        toast.success("Agendamento criado com sucesso!");
      } else if (lowerCaseText.includes("não") || lowerCaseText.includes("cancelar")) {
        botResponse = "Agendamento cancelado. Posso ajudar com outra coisa?";
        newAwaitingConfirmation = null;
        newPendingAppointment = null;
        newLastServiceMentioned = null;
      } else {
        botResponse = "Por favor, responda 'sim' para confirmar ou 'não' para cancelar.";
      }
    }
    // --- Fim da Lógica de Agendamento Multi-turn ---

    // --- Outras Intenções (se não estiver em um fluxo multi-turn) ---
    else if (lowerCaseText.includes("oi") || lowerCaseText.includes("olá") || lowerCaseText.includes("bom dia") || lowerCaseText.includes("boa tarde") || lowerCaseText.includes("boa noite")) {
      botResponse = assistentePontedraBase.saudacao[Math.floor(Math.random() * assistentePontedraBase.saudacao.length)];
    }
    else if (lowerCaseText.includes("horário") || lowerCaseText.includes("funciona")) {
      botResponse = assistentePontedraBase.duvidas.horario;
    }
    else if (lowerCaseText.includes("serviço") || lowerCaseText.includes("preço") || lowerCaseText.includes("o que vocês oferecem")) {
      botResponse = assistentePontedraBase.duvidas.servicos;
    }
    else if (lowerCaseText.includes("pagamento") || lowerCaseText.includes("formas de pagamento")) {
      botResponse = assistentePontedraBase.duvidas.pagamento;
    }
    else if (lowerCaseText.includes("agendar") || lowerCaseText.includes("marcar")) {
      botResponse = assistentePontedraBase.agendamento.prompt_servico;
      newAwaitingConfirmation = "service";
    }
    else if (lowerCaseText.includes("promoção") || lowerCaseText.includes("desconto") || lowerCaseText.includes("oferta")) {
      botResponse = assistentePontedraBase.promocoes;
    }
    else if (lowerCaseText.includes("falar com alguém") || lowerCaseText.includes("atendente") || lowerCaseText.includes("suporte")) {
      botResponse = assistentePontedraBase.suporte_humano;
    }
    else if (lowerCaseText.includes("obrigado") || lowerCaseText.includes("valeu")) {
      botResponse = assistentePontedraBase.agradecimento;
    }
    else if (lowerCaseText.includes("tchau") || lowerCaseText.includes("até mais")) {
      botResponse = assistentePontedraBase.despedida;
    }
    else if (lowerCaseText.includes("cancelar agendamento")) {
      botResponse = assistentePontedraBase.cancelar_agendamento_prompt;
    }
    else if (lowerCaseText.includes("reagendar")) {
      botResponse = assistentePontedraBase.reagendar_prompt;
    }
    else if (lowerCaseText.includes("status do meu agendamento") || lowerCaseText.includes("meu agendamento") || lowerCaseText.includes("próximo agendamento")) {
      const upcoming = clientAppointments.filter(app => app.clientEmail === clientEmail && (app.status === "pending" || app.status === "confirmed"));
      if (upcoming.length > 0) {
        botResponse = assistentePontedraBase.agendamento_existente(
          upcoming[0].serviceName,
          format(parseISO(upcoming[0].date), "dd/MM/yyyy", { locale: ptBR }),
          upcoming[0].time
        );
      } else {
        botResponse = assistentePontedraBase.sem_agendamento_futuro;
      }
    }

    addBotMessage(botResponse);
    registrarInteracao(clientName, userText, botResponse); // Registrar interação
    atualizarBaseDeConhecimento(userText, botResponse); // Registrar para aprendizado
    setChatState(prev => ({
      ...prev,
      lastServiceMentioned: newLastServiceMentioned,
      awaitingConfirmation: newAwaitingConfirmation,
      pendingAppointment: newPendingAppointment,
    }));
    setIsTyping(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    const newUserMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, newUserMessage] }));
    setInputMessage("");
    processUserMessage(inputMessage);

    if (proactiveTipIntervalRef.current) {
      clearInterval(proactiveTipIntervalRef.current);
      proactiveTipIntervalRef.current = null;
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return "agora";
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    if (diffMinutes < 24 * 60) return `há ${Math.floor(diffMinutes / 60)}h`;
    return format(date, "dd/MM HH:mm");
  };

  return (
    <ClientDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Atendimento Inteligente (Assistente Pontedra)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 h-[calc(100vh-180px)]">
        {/* Janela Principal de Conversa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col bg-card border-border shadow-lg rounded-2xl"
        >
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <img
                src="/assistant-avatar.png"
                alt="Assistente Pontedra"
                className="w-8 h-8 rounded-full border-2 border-primary"
              />
              Assistente Pontedra
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Online | pronta para ajudar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatState.messages.map((message) => (
              message.sender === "Assistente Pontedra" ? (
                <AssistantMessage key={message.id} message={message.text} />
              ) : (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end gap-2 justify-end"
                  )}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-[70%] p-3 rounded-lg relative bg-primary text-primary-foreground rounded-br-none shadow-md"
                  >
                    {message.text}
                    <span className="absolute text-[0.65rem] opacity-70 bottom-1 -left-10 text-primary-foreground/80">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </motion.div>
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-background flex items-center justify-center text-foreground border border-border">
                    {clientName.charAt(0).toUpperCase()}
                  </div>
                </div>
              )
            ))}
            {isTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary border border-border">
                  <BotIcon className="h-4 w-4" />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[70%] p-3 rounded-lg bg-muted text-muted-foreground rounded-bl-none border border-border shadow-sm flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Assistente Pontedra está digitando...</span>
                </motion.div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Digite sua dúvida ou solicitação..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-background border-border text-foreground focus:ring-primary"
                disabled={isTyping}
              />
              <Button type="button" size="icon" variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => toast.info("Entrada de voz simulada.")} disabled={isTyping}>
                <Mic className="h-4 w-4" />
              </Button>
              <Button type="submit" size="icon" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" disabled={isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Painel Lateral de Apoio */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:flex flex-col bg-card border-border shadow-lg rounded-2xl p-4 space-y-6"
        >
          <h2 className="text-lg font-semibold text-foreground">Sua Atividade</h2>

          <div className="grid gap-4">
            <Card className="bg-background border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" /> Próximo Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientActivity.nextAppointment ? (
                  <>
                    <p className="text-lg font-bold text-foreground">{clientActivity.nextAppointment.service}</p>
                    <p className="text-sm text-muted-foreground">{clientActivity.nextAppointment.date} às {clientActivity.nextAppointment.time}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum agendamento futuro.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-background border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" /> Último Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientActivity.lastService ? (
                  <>
                    <p className="text-lg font-bold text-foreground">{clientActivity.lastService.name}</p>
                    <p className="text-sm text-muted-foreground">{clientActivity.lastService.date}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum serviço recente.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-background border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" /> Pontos de Fidelidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{clientActivity.loyaltyPoints}</p>
                <p className="text-xs text-muted-foreground">Acumulados</p>
              </CardContent>
            </Card>

            {clientActivity.pendingPayment && (
              <Card className="bg-background border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-destructive" /> Pagamento Pendente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-destructive">R$ {clientActivity.pendingPayment.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Vencimento: {clientActivity.pendingPayment.dueDate}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Button
            onClick={() => navigate("/dashboard/cliente/minha-experiencia")}
            className="w-full uppercase mt-auto bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20"
          >
            Ver Histórico de Atendimentos
          </Button>
        </motion.div>
      </div>
    </ClientDashboardLayout>
  );
};

export default AtendimentoInteligentePage;