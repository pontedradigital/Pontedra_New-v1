import React, { useState, useEffect, useRef } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot as BotIcon } from "lucide-react";
import { CHATBOT_RESPONSES } from "@/data/chatbotResponses";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial bot message
    if (messages.length === 0) {
      setTimeout(() => {
        setMessages([{ id: 1, text: CHATBOT_RESPONSES[0], sender: "bot" }]);
      }, 500);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponseIndex = Math.floor(Math.random() * (CHATBOT_RESPONSES.length - 1)) + 1; // Exclude initial message
      const botResponse: Message = {
        id: messages.length + 2,
        text: CHATBOT_RESPONSES[botResponseIndex],
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <ClientDashboardLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Chat com IA Pontedra</h1>
      </div>

      <Card className="flex flex-col h-[calc(100vh-180px)]"> {/* Adjust height based on header/footer */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotIcon className="h-5 w-5" /> Assistente Pontedra
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
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
              <div
                className={cn(
                  "max-w-[70%] p-3 rounded-lg",
                  message.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                )}
              >
                {message.text}
              </div>
              {message.sender === "user" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-800">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </ClientDashboardLayout>
  );
};

export default ChatPage;