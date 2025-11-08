import React, { useState, useEffect, useRef } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot as BotIcon, Loader2, Mic, CalendarDays, MessageSquareText, DollarSign, PhoneCall } from "lucide-react";
import { CHATBOT_RESPONSES } from "@/data/chatbotResponses";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMockData } from "@/context/MockContext";
import { MOCK_CLIENT_SERVICES, MOCK_AVAILABLE_TIMES } from "@/data/mockData";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface ChatState {
  messages: Message[];
  lastServiceMentioned: string | null;
  awaitingConfirmation: "service" | "date_time" | null;
  pendingAppointment: { serviceName: string; date: string; time: string } | null;
}

interface ConversationHistoryItem {
  id: string;
  date: string;
  summary: string;
  messages: Message[];
}

const LOCAL_STORAGE_KEY_CHAT = "pontedra_chat_history";
const LOCAL_STORAGE_KEY_CONVERSATIONS = "pontedra_conversation_history";

const CentralAtendimentoPage = () => {
  const { user } = useAuth();
  const { addClientAppointment, clientAppointments } = useMockData();
  const clientName = user?.email?.split('@')[0] || "Cliente";
  const navigate = useNavigate();

  const [chatState, setChatState] = useState<ChatState>(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY_CHAT);
      if (savedState) {
        return JSON.parse(savedState);
      }
    }
    return {
      messages: [],
      lastServiceMentioned: null,
      awaitingConfirmation: null,
      pendingAppointment: null,
    };
  });

  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY_CONVERSATIONS);
      if (savedHistory) {
        return JSON.parse(savedHistory);
      }
    }
    return [];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const proactiveTipIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (chatState.messages.length === 0) {
      setTimeout(() => {
        addBotMessage(CHATBOT_RESPONSES.find(r => r.type === "greeting")?.text || "Olá! Como posso ajudar?");
      }, 500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_CHAT, JSON.stringify(chatState));
    }
  }, [chatState]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversationHistory));
    }
  }, [conversationHistory]);

  // Proactive AI tip
  useEffect(() => {
    const resetProactiveTimer = () => {
      if (proactiveTipIntervalRef.current) {
        clearInterval(proactiveTipIntervalRef.current);
      }
      proactiveTipIntervalRef.current = window.setInterval(() => {
        const tips = CHATBOT_RESPONSES.filter(r => r.type.startsWith("proactive_tip_"));
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        addBotMessage(randomTip.text);
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
      messages: [...prev.messages, { id: Date.now(), text, sender: "bot" }],
    }));
  };

  const processUserMessage = async (userText: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing time

    let botResponse = CHATBOT_RESPONSES.find(r => r.type === "fallback")?.text || "Desculpe, não entendi.";
    let newLastServiceMentioned = chatState.lastServiceMentioned;
    let newAwaitingConfirmation = chatState.awaitingConfirmation;
    let newPendingAppointment = chatState.pendingAppointment;

    const lowerCaseText = userText.toLowerCase();

    // Intent: Scheduling
    if (chatState.awaitingConfirmation === "service") {
      const service = MOCK_CLIENT_SERVICES.find(s => lowerCaseText.includes(s.name.toLowerCase()));
      if (service) {
        newPendingAppointment = { ...newPendingAppointment!, serviceName: service.name, date: "", time: "" };
        newAwaitingConfirmation = "date_time";
        newLastServiceMentioned = service.name;
        botResponse = CHATBOT_RESPONSES.find(r => r.type === "scheduling_prompt_date_time")?.text?.replace('{serviceName}', service.name) || "Ótimo! E qual dia e horário você prefere?";
      } else {
        botResponse = "Não encontrei este serviço. Por favor, escolha um dos nossos serviços: Corte de Cabelo Masculino, Manicure e Pedicure, Massagem Relaxante, Coloração Feminina ou Limpeza de Pele.";
      }
    } else if (chatState.awaitingConfirmation === "date_time" && newPendingAppointment) {
      const dateMatch = lowerCaseText.match(/(hoje|amanhã|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
      const timeMatch = lowerCaseText.match(/(\d{1,2}h(?::\d{2})?)/);

      let parsedDate: Date | null = null;
      if (dateMatch) {
        if (dateMatch[1] === "hoje") {
          parsedDate = new Date();
        } else if (dateMatch[1] === "amanhã") {
          parsedDate = new Date();
          parsedDate.setDate(parsedDate.getDate() + 1);
        } else {
          // Try to parse dd/mm or dd/mm/yyyy
          const parts = dateMatch[1].split('/');
          if (parts.length === 2) {
            const year = new Date().getFullYear(); // Assume current year
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
        await addClientAppointment({
          clientEmail: user?.email || "cliente@teste.com",
          serviceName: newPendingAppointment.serviceName,
          date: newPendingAppointment.date,
          time: newPendingAppointment.time,
          status: "pending",
        }, user?.email || "cliente@teste.com");

        botResponse = CHATBOT_RESPONSES.find(r => r.type === "scheduling_confirm_success")?.text
          ?.replace('{serviceName}', newPendingAppointment.serviceName)
          .replace('{date}', format(parseISO(newPendingAppointment.date), "dd/MM/yyyy", { locale: ptBR }))
          .replace('{time}', newPendingAppointment.time) || "Agendamento confirmado!";
        newAwaitingConfirmation = null;
        newPendingAppointment = null;
        newLastServiceMentioned = null;
        toast.success("Agendamento criado com sucesso!");
      } else {
        botResponse = CHATBOT_RESPONSES.find(r => r.type === "scheduling_confirm_fail")?.text || "Não consegui entender a data ou hora. Por favor, tente novamente com um formato como 'amanhã às 14h' ou '25/12 às 10h'.";
      }
    }
    // Intent: General Services
    else if (lowerCaseText.includes("serviços") || lowerCaseText.includes("o que vocês oferecem")) {
      botResponse = CHATBOT_RESPONSES.find(r => r.type === "services_general")?.text || "Nossos serviços incluem Corte, Manicure, Coloração e Limpeza. Qual deles você deseja mais informações?";
      newAwaitingConfirmation = "service";
    }
    // Intent: Service Price
    else if (lowerCaseText.includes("valor") || lowerCaseText.includes("preço")) {
      if (lowerCaseText.includes("corte")) {
        botResponse = CHATBOT_RESPONSES.find(r => r.type === "service_price_corte")?.text || "O Corte de Cabelo Masculino custa R$55,00.";
        newLastServiceMentioned = "Corte de Cabelo Masculino";
      } else if (lowerCaseText.includes("manicure") || lowerCaseText.includes("pedicure")) {
        botResponse = CHATBOT_RESPONSES.find(r => r.type === "service_price_manicure")?.text || "O serviço de Manicure e Pedicure custa R$85,00.";
        newLastServiceMentioned = "Manicure e Pedicure";
      } else if (lowerCaseText.includes("coloração")) {
        botResponse = CHATBOT_RESPONSES.find(r => r.type === "service_price_coloracao")?.text || "A Coloração Feminina custa R$180,00.";
        newLastServiceMentioned = "Coloração Feminina";
      } else if (lowerCaseText.includes("limpeza de pele")) {
        botResponse = CHATBOT_RESPONSES.find(r => r.type === "service_price_limpeza")?.text || "A Limpeza de Pele custa R$100,00.";
        newLastServiceMentioned = "Limpeza de Pele";
      } else if (lowerCaseText.includes("massagem")) {
        botResponse = CHATBOT_RESPONSES.find(r => r.type === "service_price_massagem")?.text || "A Massagem Relaxante custa R$130,00.";
        newLastServiceMentioned = "Massagem Relaxante";
      } else if (chatState.lastServiceMentioned) {
        const service = MOCK_CLIENT_SERVICES.find(s => s.name === chatState.lastServiceMentioned);
        if (service) {
          botResponse = `O serviço de ${service.name} custa R$${service.price.toFixed(2)}. Deseja agendar?`;
        }
      } else {
        botResponse = "Para qual serviço você gostaria de saber o valor?";
      }
    }
    // Intent: Promotions
    else if (lowerCaseText.includes("promoção") || lowerCaseText.includes("desconto")) {
      botResponse = CHATBOT_RESPONSES.find(r => r.type === "promotion_general")?.text || "Temos algumas promoções! A IA identificou que o serviço de Manicure e Pedicure está com 10% de desconto essa semana. Deseja aproveitar?";
    }
    // Intent: Human Assistance
    else if (lowerCaseText.includes("falar com alguém") || lowerCaseText.includes("atendente") || lowerCaseText.includes("suporte")) {
      botResponse = CHATBOT_RESPONSES.find(r => r.type === "human_assistance")?.text || "Um de nossos atendentes será notificado.";
    }
    // Intent: Thank you / Goodbye
    else if (lowerCaseText.includes("obrigado") || lowerCaseText.includes("valeu")) {
      botResponse = CHATBOT_RESPONSES.find(r => r.type === "thank_you")?.text || "De nada!";
    }
    else if (lowerCaseText.includes("tchau") || lowerCaseText.includes("até mais")) {
      botResponse = CHATBOT_RESPONSES.find(r => r.type === "goodbye")?.text || "Até mais!";
    }
    // Intent: Scheduling trigger
    else if (lowerCaseText.includes("agendar") || lowerCaseText.includes("marcar")) {
      botResponse = CHATBOT_RESPONSES.find(r => r.type === "scheduling_prompt_service")?.text || "Claro! Para qual serviço você gostaria de agendar?";
      newAwaitingConfirmation = "service";
    }
    // Intent: Cancel/Reschedule (simulated)
    else if (lowerCaseText.includes("cancelar agendamento")) {
      botResponse = "Para cancelar um agendamento, por favor, acesse a página 'Meus Agendamentos' ou informe o ID do agendamento que deseja cancelar. (Funcionalidade simulada)";
    }
    else if (lowerCaseText.includes("reagendar")) {
      botResponse = "Para reagendar, por favor, acesse a página 'Meus Agendamentos' e selecione a opção de reagendamento. (Funcionalidade simulada)";
    }
    // Intent: Check appointment status
    else if (lowerCaseText.includes("status do meu agendamento") || lowerCaseText.includes("meu agendamento")) {
      const upcoming = clientAppointments.filter(app => app.clientEmail === user?.email && (app.status === "pending" || app.status === "confirmed"));
      if (upcoming.length > 0) {
        botResponse = `Seu próximo agendamento é para '${upcoming[0].serviceName}' em ${format(parseISO(upcoming[0].date), "dd/MM/yyyy", { locale: ptBR })} às ${upcoming[0].time}. Status: ${upcoming[0].status}.`;
      } else {
        botResponse = "Você não tem agendamentos futuros registrados.";
      }
    }


    addBotMessage(botResponse);
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
    };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, newUserMessage] }));
    setInputMessage("");
    processUserMessage(inputMessage);

    // Reset proactive tip timer on user activity
    if (proactiveTipIntervalRef.current) {
      clearInterval(proactiveTipIntervalRef.current);
      proactiveTipIntervalRef.current = null; // Clear ref to ensure new interval is set
    }
  };

  const handleQuickAction = (action: string) => {
    let simulatedMessage = "";
    switch (action) {
      case "agendar":
        simulatedMessage = "Quero agendar um novo serviço.";
        break;
      case "ver_agendamentos":
        navigate("/dashboard/cliente/agenda");
        toast.info("Redirecionando para Meus Agendamentos.");
        return;
      case "suporte_humano":
        simulatedMessage = "Preciso falar com um atendente humano.";
        break;
      case "duvidas_precos":
        simulatedMessage = "Quais são os preços dos serviços?";
        break;
      default:
        return;
    }
    const newUserMessage: Message = {
      id: Date.now(),
      text: simulatedMessage,
      sender: "user",
    };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, newUserMessage] }));
    processUserMessage(simulatedMessage);
  };

  const handleLoadConversation = (conversation: ConversationHistoryItem) => {
    setChatState({
      messages: conversation.messages,
      lastServiceMentioned: null, // Reset context for loaded conversation
      awaitingConfirmation: null,
      pendingAppointment: null,
    });
    toast.info(`Conversa de ${conversation.date} carregada.`);
  };

  const handleNewConversation = () => {
    if (chatState.messages.length > 1) { // Save current conversation if it has more than just the greeting
      const summary = chatState.messages.length > 2 ? chatState.messages[1].text.substring(0, 50) + "..." : "Nova conversa";
      setConversationHistory(prev => [
        { id: `conv-${Date.now()}`, date: format(new Date(), "dd/MM/yyyy HH:mm"), summary, messages: chatState.messages },
        ...prev,
      ]);
    }
    setChatState({
      messages: [],
      lastServiceMentioned: null,
      awaitingConfirmation: null,
      pendingAppointment: null,
    });
    setTimeout(() => {
      addBotMessage(CHATBOT_RESPONSES.find(r => r.type === "greeting")?.text || "Olá! Como posso ajudar?");
    }, 500);
    toast.info("Nova conversa iniciada.");
  };

  return (
    <ClientDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Central de Atendimento com IA</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 h-[calc(100vh-180px)]">
        {/* Histórico de Conversas Recentes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden lg:flex flex-col bg-card border-border shadow-lg rounded-2xl p-4"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Histórico de Conversas</h2>
          <Button onClick={handleNewConversation} className="w-full mb-4 uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
            Nova Conversa
          </Button>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {conversationHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center">Nenhuma conversa anterior.</p>
            ) : (
              conversationHistory.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 bg-background border border-border rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleLoadConversation(conv)}
                >
                  <p className="text-sm font-medium text-foreground">{conv.summary}</p>
                  <p className="text-xs text-muted-foreground">{conv.date}</p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Janela de Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col bg-card border-border shadow-lg rounded-2xl"
        >
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BotIcon className="h-5 w-5 text-primary" /> Assistente Pontedra
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Botões de Acesso Rápido */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => handleQuickAction("agendar")}>
                <CalendarDays className="h-4 w-4 mr-2" /> Agendar novo serviço
              </Button>
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => handleQuickAction("ver_agendamentos")}>
                <MessageSquareText className="h-4 w-4 mr-2" /> Ver meus agendamentos
              </Button>
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => handleQuickAction("suporte_humano")}>
                <PhoneCall className="h-4 w-4 mr-2" /> Falar com suporte humano
              </Button>
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => handleQuickAction("duvidas_precos")}>
                <DollarSign className="h-4 w-4 mr-2" /> Dúvidas sobre preços
              </Button>
            </div>

            {chatState.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === "bot" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <BotIcon className="h-4 w-4" />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg",
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-md" // Azul para usuário
                      : "bg-primary text-background rounded-bl-none border border-primary/50 shadow-sm" // Verde para IA
                  )}
                >
                  {message.text}
                </motion.div>
                {message.sender === "user" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                    {clientName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <BotIcon className="h-4 w-4" />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[70%] p-3 rounded-lg bg-background text-foreground rounded-bl-none border border-border shadow-sm flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Digitando...</span>
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
              <Button type="button" size="icon" variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => toast.info("Entrada de voz simulada.")}>
                <Mic className="h-4 w-4" />
              </Button>
              <Button type="submit" size="icon" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" disabled={isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </ClientDashboardLayout>
  );
};

export default CentralAtendimentoPage;