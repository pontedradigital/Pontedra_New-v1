import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import {
  Service,
  Appointment,
  Client,
  BlogPost,
  ChannelState,
  CompanyInfo,
  SystemParams,
  AIInsight,
  ClientNotificationSettings,
  ClientPrivacySettings,
  ClientNotification,
  NotificationType,
  MOCK_CLIENT_SERVICES,
  MOCK_CLIENT_APPOINTMENTS,
  MOCK_CLIENTS,
  MOCK_BLOG_POSTS,
  MOCK_CHANNELS,
  MOCK_COMPANY_INFO,
  MOCK_SYSTEM_PARAMS,
  MOCK_AI_INSIGHTS,
  MOCK_CLIENT_NOTIFICATION_SETTINGS,
  MOCK_CLIENT_PRIVACY_SETTINGS,
  MOCK_CLIENT_NOTIFICATIONS,
  // Removidas as importações de ClientFinancialSummary, ClientTransaction, ClientFinancialInsight, ClientSpendingChartData
  // MOCK_CLIENT_FINANCIAL_SUMMARY,
  // MOCK_CLIENT_TRANSACTIONS,
  // MOCK_CLIENT_FINANCIAL_INSIGHTS,
  // MOCK_CLIENT_SPENDING_CHART_DATA,
} from "@/data/mockData";
import { useAuth } from "./AuthContext"; // Import useAuth to filter notifications by user

interface MockContextType {
  // Master Data
  clients: Client[];
  services: Service[];
  appointments: Appointment[];
  blogPosts: BlogPost[];
  channels: ChannelState[];
  companyInfo: CompanyInfo;
  systemParams: SystemParams;
  aiInsights: AIInsight[];

  // Client Data (specific to the logged-in client)
  clientAppointments: Appointment[];
  clientNotificationSettings: ClientNotificationSettings;
  clientPrivacySettings: ClientPrivacySettings;
  clientNotifications: ClientNotification[];
  unreadNotificationCount: number;
  // Removidos os tipos de estado da carteira digital
  // clientFinancialSummary: ClientFinancialSummary;
  // clientTransactions: ClientTransaction[];
  // clientFinancialInsights: ClientFinancialInsight[];
  // clientSpendingChartData: ClientSpendingChartData[];

  // Master Actions
  addClient: (client: Omit<Client, "id" | "registrationDate">) => Promise<void>;
  updateClient: (id: string, updatedClient: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addService: (service: Omit<Service, "id">) => Promise<void>;
  updateService: (id: string, updatedService: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addAppointment: (appointment: Omit<Appointment, "id">) => Promise<void>;
  updateAppointment: (id: string, updatedAppointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  addBlogPost: (post: Omit<BlogPost, "id" | "author" | "date">) => Promise<void>;
  updateBlogPost: (id: string, updatedPost: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;

  toggleChannelConnection: (id: string) => Promise<void>;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => Promise<void>;
  updateSystemParams: (params: Partial<SystemParams>) => Promise<void>;
  generateNewAIInsights: () => Promise<void>;

  // Client Actions
  addClientAppointment: (appointment: Omit<Appointment, "id" | "clientEmail">, clientEmail: string) => Promise<void>;
  updateClientNotificationSettings: (settings: Partial<ClientNotificationSettings>) => Promise<void>;
  updateClientPrivacySettings: (settings: Partial<ClientPrivacySettings>) => Promise<void>;
  addClientNotification: (notification: Omit<ClientNotification, "id" | "timestamp" | "read">) => Promise<void>;
  markClientNotificationAsRead: (id: string) => Promise<void>;
  // Removidas as ações da carteira digital
  // addClientCredit: (amount: number, method: string) => Promise<void>;
  // updateClientTransaction: (id: string, updatedTransaction: Partial<ClientTransaction>) => Promise<void>;
  // generateNewClientFinancialInsights: () => Promise<void>;

  isLoading: boolean;
}

const MockContext = createContext<MockContextType | undefined>(undefined);

export const MockProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // Get logged-in user from AuthContext
  const [isLoading, setIsLoading] = useState(false);

  // Master States
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [services, setServices] = useState<Service[]>(MOCK_CLIENT_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_CLIENT_APPOINTMENTS);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS);
  const [channels, setChannels] = useState<ChannelState[]>(MOCK_CHANNELS);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(MOCK_COMPANY_INFO);
  const [systemParams, setSystemParams] = useState<SystemParams>(MOCK_SYSTEM_PARAMS);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>(MOCK_AI_INSIGHTS);

  // Client States (these would typically be filtered by the logged-in user's email)
  const [clientNotificationSettings, setClientNotificationSettings] = useState<ClientNotificationSettings>(MOCK_CLIENT_NOTIFICATION_SETTINGS);
  const [clientPrivacySettings, setClientPrivacySettings] = useState<ClientPrivacySettings>(MOCK_CLIENT_PRIVACY_SETTINGS);
  const [allClientNotifications, setAllClientNotifications] = useState<ClientNotification[]>(MOCK_CLIENT_NOTIFICATIONS);
  // Removidos os estados da carteira digital
  // const [clientFinancialSummary, setClientFinancialSummary] = useState<ClientFinancialSummary>(MOCK_CLIENT_FINANCIAL_SUMMARY);
  // const [clientTransactions, setClientTransactions] = useState<ClientTransaction[]>(MOCK_CLIENT_TRANSACTIONS);
  // const [clientFinancialInsights, setClientFinancialInsights] = useState<ClientFinancialInsight[]>(MOCK_CLIENT_FINANCIAL_INSIGHTS);
  // const [clientSpendingChartData, setClientSpendingChartData] = useState<ClientSpendingChartData[]>(MOCK_CLIENT_SPENDING_CHART_DATA);


  // Filter notifications for the current user
  const currentClientNotifications = user
    ? allClientNotifications.filter(n => n.clientEmail === user.email)
    : [];

  const unreadNotificationCount = currentClientNotifications.filter(n => !n.read).length;

  const simulateApiCall = async <T>(callback: () => T, successMessage?: string, errorMessage?: string): Promise<T> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = callback();
          if (successMessage) toast.success(successMessage);
          resolve(result);
        } catch (error) {
          if (errorMessage) toast.error(errorMessage);
          reject(error);
        } finally {
          setIsLoading(false);
        }
      }, 1000); // Simulate network delay
    });
  };

  // Master Actions
  const addClient = (client: Omit<Client, "id" | "registrationDate">) =>
    simulateApiCall(() => {
      const newClient: Client = { ...client, id: `c${clients.length + 1}`, registrationDate: new Date().toISOString().slice(0, 10) };
      setClients((prev) => [...prev, newClient]);
    }, "Cliente adicionado com sucesso!");

  const updateClient = (id: string, updatedClient: Partial<Client>) =>
    simulateApiCall(() => {
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedClient } : c)));
    }, "Cliente atualizado com sucesso!");

  const deleteClient = (id: string) =>
    simulateApiCall(() => {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }, "Cliente excluído.");

  const addService = (service: Omit<Service, "id">) =>
    simulateApiCall(() => {
      const newService: Service = { ...service, id: `s${services.length + 1}` };
      setServices((prev) => [...prev, newService]);
    }, "Serviço adicionado com sucesso!");

  const updateService = (id: string, updatedService: Partial<Service>) =>
    simulateApiCall(() => {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedService } : s)));
    }, "Serviço atualizado com sucesso!");

  const deleteService = (id: string) =>
    simulateApiCall(() => {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }, "Serviço excluído.");

  const addAppointment = (appointment: Omit<Appointment, "id">) =>
    simulateApiCall(() => {
      const newAppointment: Appointment = { ...appointment, id: `a${appointments.length + 1}` };
      setAppointments((prev) => [...prev, newAppointment]);
    }, "Agendamento adicionado com sucesso!");

  const updateAppointment = (id: string, updatedAppointment: Partial<Appointment>) =>
    simulateApiCall(() => {
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updatedAppointment } : a)));
    }, "Agendamento atualizado com sucesso!");

  const deleteAppointment = (id: string) =>
    simulateApiCall(() => {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }, "Agendamento excluído.");

  const addBlogPost = (post: Omit<BlogPost, "id" | "author" | "date">) =>
    simulateApiCall(() => {
      const newPost: BlogPost = { ...post, id: `blog${blogPosts.length + 1}`, author: "Equipe Pontedra", date: new Date().toISOString().slice(0, 10) };
      setBlogPosts((prev) => [...prev, newPost]);
    }, "Post criado com sucesso!");

  const updateBlogPost = (id: string, updatedPost: Partial<BlogPost>) =>
    simulateApiCall(() => {
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedPost } : p)));
    }, "Post atualizado com sucesso!");

  const deleteBlogPost = (id: string) =>
    simulateApiCall(() => {
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    }, "Post excluído.");

  const toggleChannelConnection = (id: string) =>
    simulateApiCall(() => {
      setChannels((prev) =>
        prev.map((ch) => (ch.id === id ? { ...ch, connected: !ch.connected } : ch))
      );
    }, "Status do canal atualizado!");

  const updateCompanyInfo = (info: Partial<CompanyInfo>) =>
    simulateApiCall(() => {
      setCompanyInfo((prev) => ({ ...prev, ...info }));
    }, "Informações da empresa salvas!");

  const updateSystemParams = (params: Partial<SystemParams>) =>
    simulateApiCall(() => {
      setSystemParams((prev) => ({ ...prev, ...params }));
    }, "Parâmetros do sistema salvos!");

  const generateNewAIInsights = () =>
    simulateApiCall(() => {
      const newInsights: AIInsight[] = [
        { id: `ai${aiInsights.length + 1}`, type: "suggestion", title: "Nova Sugestão de Marketing", description: `Sugestão gerada em ${new Date().toLocaleTimeString()}`, date: new Date().toISOString().slice(0, 10) },
        { id: `ai${aiInsights.length + 2}`, type: "trend", title: "Nova Tendência de Mercado", description: `Tendência detectada em ${new Date().toLocaleTimeString()}`, date: new Date().toISOString().slice(0, 10) },
      ];
      setAiInsights((prev) => [...prev.slice(-2), ...newInsights]); // Keep a few recent ones
    }, "Novos insights de IA gerados!");

  // Client Actions
  const addClientAppointment = (appointment: Omit<Appointment, "id" | "clientEmail">, clientEmail: string) =>
    simulateApiCall(() => {
      const newAppointment: Appointment = { ...appointment, id: `a${appointments.length + 1}`, clientEmail };
      setAppointments((prev) => [...prev, newAppointment]);
    }, "Agendamento criado com sucesso!");

  const updateClientNotificationSettings = (settings: Partial<ClientNotificationSettings>) =>
    simulateApiCall(() => {
      setClientNotificationSettings((prev) => ({ ...prev, ...settings }));
    }, "Configurações de notificação salvas!");

  const updateClientPrivacySettings = (settings: Partial<ClientPrivacySettings>) =>
    simulateApiCall(() => {
      setClientPrivacySettings((prev) => ({ ...prev, ...settings }));
    }, "Configurações de privacidade salvas!");

  const addClientNotification = (notification: Omit<ClientNotification, "id" | "timestamp" | "read">) =>
    simulateApiCall(() => {
      if (!user) {
        console.warn("Cannot add notification: no user logged in.");
        return;
      }
      const newNotification: ClientNotification = {
        ...notification,
        id: `notif${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
        clientEmail: user.email,
      };
      setAllClientNotifications((prev) => [newNotification, ...prev]);
    }, "Nova notificação recebida!");

  const markClientNotificationAsRead = (id: string) =>
    simulateApiCall(() => {
      setAllClientNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }, "Notificação marcada como lida.");

  // Removidas as ações da carteira digital
  // const addClientCredit = (amount: number, method: string) =>
  //   simulateApiCall(() => {
  //     const newTransaction: ClientTransaction = {
  //       id: `t${Date.now()}`,
  //       date: new Date().toISOString().slice(0, 10),
  //       description: `Recarga de Saldo via ${method.toUpperCase()}`,
  //       type: "credit",
  //       amount: amount,
  //       status: "completed",
  //     };
  //     setClientFinancialSummary(prev => ({
  //       ...prev,
  //       currentBalance: prev.currentBalance + amount,
  //       availableCredits: prev.availableCredits + amount,
  //     }));
  //     setClientTransactions(prev => [newTransaction, ...prev]);
  //   }, `R$${amount.toFixed(2)} adicionados com sucesso via ${method.toUpperCase()}!`);

  // const updateClientTransaction = (id: string, updatedTransaction: Partial<ClientTransaction>) =>
  //   simulateApiCall(() => {
  //     setClientTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t));
  //   }, "Transação atualizada com sucesso!");

  // const generateNewClientFinancialInsights = () =>
  //   simulateApiCall(() => {
  //     const newInsights: ClientFinancialInsight[] = [
  //       { id: `fi${Date.now()}`, message: "Você gastou 10% menos este mês em comparação com o anterior. Bom trabalho!", category: "Economia" },
  //       { id: `fi${Date.now() + 1}`, message: "Considere usar seus créditos disponíveis para o próximo agendamento.", category: "Oportunidade" },
  //     ];
  //     setClientFinancialInsights(newInsights);
  //   }, "Novos insights financeiros gerados!");


  return (
    <MockContext.Provider
      value={{
        clients,
        services,
        appointments,
        blogPosts,
        channels,
        companyInfo,
        systemParams,
        aiInsights,
        clientAppointments: appointments, // This will be filtered in client pages
        clientNotificationSettings,
        clientPrivacySettings,
        clientNotifications: currentClientNotifications,
        unreadNotificationCount,
        // Removidos os valores da carteira digital
        // clientFinancialSummary,
        // clientTransactions,
        // clientFinancialInsights,
        // clientSpendingChartData,
        addClient,
        updateClient,
        deleteClient,
        addService,
        updateService,
        deleteService,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        toggleChannelConnection,
        updateCompanyInfo,
        updateSystemParams,
        generateNewAIInsights,
        addClientAppointment,
        updateClientNotificationSettings,
        updateClientPrivacySettings,
        addClientNotification,
        markClientNotificationAsRead,
        // Removidas as ações da carteira digital
        // addClientCredit,
        // updateClientTransaction,
        // generateNewClientFinancialInsights,
        isLoading,
      }}
    >
      {children}
    </MockContext.Provider>
  );
};

export const useMockData = () => {
  const context = useContext(MockContext);
  if (context === undefined) {
    throw new Error("useMockData must be used within a MockProvider");
  }
  return context;
};