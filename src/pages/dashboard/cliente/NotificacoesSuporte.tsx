import React, { useState, useEffect, useRef } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BellRing, Info, CheckCircle2, Clock, AlertCircle, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useMockData } from "@/context/MockContext";
import { useAuth } from "@/context/AuthContext";
import { ClientNotification, NotificationType, SupportMessage } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const notificationCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.3, ease: "easeIn" } },
};

const NotificacoesSuportePage = () => {
  const { user } = useAuth();
  const { clientNotifications, addClientNotification, markClientNotificationAsRead } = useMockData();
  const [supportMessage, setSupportMessage] = useState("");
  const [supportChat, setSupportChat] = useState<SupportMessage[]>([]);
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const supportChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate new notifications every 30 seconds
    const interval = setInterval(() => {
      if (user) {
        const randomType: NotificationType = ["lembrete", "promoção", "confirmação", "info"][Math.floor(Math.random() * 4)] as NotificationType;
        const messages = {
          lembrete: "Não se esqueça do seu próximo agendamento de Massagem Relaxante amanhã! 🧘‍♀️",
          promoção: "Nova oferta exclusiva: 15% de desconto em Limpeza de Pele! ✨",
          confirmação: "Seu agendamento de Corte de Cabelo foi confirmado para hoje! ✅",
          info: "Atualização importante: Melhorias na sua Carteira Digital! 💳",
        };
        const titles = {
          lembrete: "Lembrete Importante",
          promoção: "Promoção Imperdível",
          confirmação: "Agendamento Confirmado",
          info: "Novidades na Plataforma",
        };
        addClientNotification({
          clientEmail: user.email,
          type: randomType,
          title: titles[randomType],
          message: messages[randomType],
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user, addClientNotification]);

  useEffect(() => {
    supportChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [supportChat]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "lembrete":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case "promoção":
        return <Info className="h-5 w-5 text-blue-400" />;
      case "confirmação":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case "cancelamento":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "suporte":
        return <BellRing className="h-5 w-5 text-purple-400" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "lembrete":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "promoção":
        return "border-blue-500/50 bg-blue-500/10";
      case "confirmação":
        return "border-green-500/50 bg-green-500/10";
      case "cancelamento":
        return "border-red-500/50 bg-red-500/10";
      case "suporte":
        return "border-purple-500/50 bg-purple-500/10";
      case "info":
      default:
        return "border-blue-500/50 bg-blue-500/10";
    }
  };

  const handleMarkAsRead = (id: string) => {
    markClientNotificationAsRead(id);
    toast.success("Notificação marcada como lida.");
  };

  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (supportMessage.trim() === "") return;

    const newUserMessage: SupportMessage = {
      id: `msg${Date.now()}`,
      sender: "user",
      message: supportMessage,
      timestamp: new Date().toISOString(),
    };
    setSupportChat((prev) => [...prev, newUserMessage]);
    setSupportMessage("");
    setIsSupportTyping(true);

    setTimeout(() => {
      const botResponse: SupportMessage = {
        id: `msg${Date.now() + 1}`,
        sender: "support",
        message: "Olá! Recebemos sua solicitação e entraremos em contato em breve. Agradecemos a sua paciência! 🧑‍💻",
        timestamp: new Date().toISOString(),
      };
      setSupportChat((prev) => [...prev, botResponse]);
      setIsSupportTyping(false);
    }, 2000); // Simulate 2-second delay for support response
  };

  const formatTimestamp = (isoString: string) => {
    const date = parseISO(isoString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  return (
    <ClientDashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">Notificações e Suporte Rápido</h1>
          <p className="text-sm text-muted-foreground">Acompanhe alertas, atualizações e mensagens da plataforma em tempo real.</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <BellRing className="h-8 w-8 text-primary" />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-200px)]">
        {/* Seção de Notificações Automáticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col bg-card border-border shadow-lg rounded-2xl p-4"
        >
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-foreground">Suas Notificações</CardTitle>
            <CardDescription className="text-muted-foreground">Alertas e atualizações importantes do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto custom-scrollbar pt-4 space-y-4">
            <AnimatePresence initial={false}>
              {clientNotifications.filter(n => n.clientEmail === user?.email).sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()).map((notification) => (
                <motion.div
                  key={notification.id}
                  variants={notificationCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border",
                    getNotificationColor(notification.type),
                    notification.read ? "opacity-70" : "opacity-100"
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{formatTimestamp(notification.timestamp)}</span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-primary hover:bg-primary/10"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Marcar como lida
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {clientNotifications.filter(n => n.clientEmail === user?.email).length === 0 && (
              <p className="text-center text-muted-foreground mt-8">Nenhuma notificação recente.</p>
            )}
          </CardContent>
        </motion.div>

        {/* Seção de Suporte Rápido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col bg-card border-border shadow-lg rounded-2xl p-4"
        >
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-foreground">Fale com o Suporte</CardTitle>
            <CardDescription className="text-muted-foreground">Envie sua dúvida ou solicitação e receba ajuda.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto custom-scrollbar pt-4 space-y-4">
            {supportChat.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2",
                  msg.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender === "support" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary border border-border">
                    <BellRing className="h-4 w-4" />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg relative",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none shadow-md"
                      : "bg-muted text-muted-foreground rounded-bl-none border border-border shadow-sm"
                  )}
                >
                  {msg.message}
                  <span className={cn(
                    "absolute text-[0.65rem] opacity-70",
                    msg.sender === "user" ? "bottom-1 -left-10 text-primary-foreground/80" : "bottom-1 -right-10 text-muted-foreground/80"
                  )}>
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </motion.div>
                {msg.sender === "user" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-background flex items-center justify-center text-foreground border border-border">
                    {user?.email?.charAt(0).toUpperCase() || "C"}
                  </div>
                )}
              </div>
            ))}
            {isSupportTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary border border-border">
                  <BellRing className="h-4 w-4" />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[70%] p-3 rounded-lg bg-muted text-muted-foreground rounded-bl-none border border-border shadow-sm flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Suporte digitando...</span>
                </motion.div>
              </div>
            )}
            <div ref={supportChatEndRef} />
          </CardContent>
          <CardFooter className="p-4 border-t border-border/50">
            <form onSubmit={handleSendSupportMessage} className="flex gap-2 w-full">
              <Textarea
                placeholder="Digite sua dúvida ou solicitação..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="flex-1 bg-background border-border text-foreground focus:ring-primary min-h-[40px] max-h-[120px]"
                rows={1}
                disabled={isSupportTyping}
              />
              <Button type="submit" size="icon" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" disabled={isSupportTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </motion.div>
      </div>
    </ClientDashboardLayout>
  );
};

export default NotificacoesSuportePage;