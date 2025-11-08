export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  availability: "available" | "unavailable";
  imageUrl?: string;
}

export interface Appointment {
  id: string;
  clientEmail: string;
  serviceName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive";
  registrationDate: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  imageUrl?: string;
  tags: string[];
}

export interface ChannelState {
  id: string;
  name: string;
  icon: string; // e.g., "whatsapp", "messenger", "instagram"
  connected: boolean;
  description: string;
}

export interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
}

export interface SystemParams {
  clientLimit: number;
  activePlan: "Free" | "Basic" | "Premium" | "Enterprise";
}

export interface AIInsight {
  id: string;
  type: "suggestion" | "alert" | "trend";
  title: string;
  description: string;
  date: string;
}

export interface ClientNotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
}

export interface ClientPrivacySettings {
  dataSharing: boolean;
  marketingEmails: boolean;
}

export interface AISuggestion {
  id: string;
  category: string;
  message: string;
  icon: string; // Lucide icon name
}

export interface RecentActivity {
  id: string;
  type: "client_register" | "appointment_created" | "report_generated" | "whatsapp_message" | "service_added" | "blog_post";
  description: string;
  timestamp: string;
  link: string;
  icon: string; // Lucide icon name
  iconColor: string; // Tailwind color class
}

export interface FinanceEntry {
  id: string;
  date: string;
  clientName: string;
  serviceName: string;
  value: number;
  status: "Concluído" | "Pendente" | "Cancelado";
}

export interface ClientExperienceSummary {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  lastInteraction: string; // e.g., "há 3 dias"
}

export interface ClientAIRecommendation {
  id: string;
  message: string;
  category: string;
}

export interface ClientPromotion {
  id: string;
  title: string;
  description: string;
  actionMessage: string; // Message to pre-fill chat
}

export interface ClientActivitySummary {
  nextAppointment: { service: string; date: string; time: string } | null;
  lastService: { name: string; date: string } | null;
  loyaltyPoints: number;
  pendingPayment: { amount: number; dueDate: string } | null;
}

export type NotificationType = "lembrete" | "promoção" | "confirmação" | "cancelamento" | "suporte" | "info";

export interface ClientNotification {
  id: string;
  clientEmail: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface SupportMessage {
  id: string;
  sender: "user" | "support";
  message: string;
  timestamp: string;
}

// New interface for detailed client appointment history
export type AppointmentStatus = "Agendado" | "Concluído" | "Cancelado" | "Pendente";

export interface DetailedClientAppointment {
  id: string;
  clientEmail: string;
  service: string;
  professional: string;
  dateTime: string; // "YYYY-MM-DD HH:mm"
  status: AppointmentStatus;
  value: number;
  notes?: string;
}


export const MOCK_CLIENT_SERVICES: Service[] = [
  { id: "s1", name: "Corte de Cabelo Masculino", description: "Corte moderno com lavagem e finalização.", price: 55.00, category: "Cabelo", availability: "available", imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Corte" },
  { id: "s2", name: "Manicure e Pedicure", description: "Serviço completo de unhas.", price: 85.00, category: "Estética", availability: "available", imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Manicure" },
  { id: "s3", name: "Massagem Relaxante", description: "Sessão de 60 minutos para alívio do estresse.", price: 130.00, category: "Bem-estar", availability: "unavailable", imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?text=Massagem" },
  { id: "s4", name: "Coloração Feminina", description: "Aplicação de tintura e tratamento pós-coloração.", price: 180.00, category: "Cabelo", availability: "available", imageUrl: "https://via.placeholder.com/150/FFFF00/000000?text=Coloracao" },
  { id: "s5", name: "Limpeza de Pele", description: "Limpeza profunda com extração e hidratação.", price: 100.00, category: "Estética", availability: "available", imageUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?text=Pele" },
];

export const MOCK_CLIENT_APPOINTMENTS: Appointment[] = [
  { id: "a1", clientEmail: "cliente@teste.com", serviceName: "Corte de Cabelo Masculino", date: "2024-11-20", time: "10:00", status: "confirmed", notes: "Cliente prefere corte mais curto nas laterais." },
  { id: "a2", clientEmail: "cliente@teste.com", serviceName: "Manicure e Pedicure", date: "2024-11-22", time: "14:30", status: "pending", notes: "Pedir esmalte vermelho." },
  { id: "a3", clientEmail: "cliente@teste.com", serviceName: "Massagem Relaxante", date: "2024-10-10", time: "11:00", status: "completed", notes: "Sessão muito boa, cliente relaxou bastante." },
  { id: "a4", clientEmail: "master@teste.com", serviceName: "Consultoria de Negócios", date: "2024-12-01", time: "09:00", status: "pending", notes: "Reunião inicial para novo projeto." },
];

export const MOCK_AVAILABLE_TIMES = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "João Silva", email: "joao@example.com", phone: "11987654321", company: "Empresa A", status: "active", registrationDate: "2023-01-15" },
  { id: "c2", name: "Maria Souza", email: "maria@example.com", phone: "21912345678", company: "Empresa B", status: "active", registrationDate: "2023-03-20" },
  { id: "c3", name: "Pedro Lima", email: "pedro@example.com", phone: "31998765432", company: "Empresa C", status: "inactive", registrationDate: "2023-05-10" },
  { id: "c4", name: "Ana Costa", email: "ana@example.com", phone: "41987651234", company: "Empresa D", status: "active", registrationDate: "2024-02-01" },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog1",
    title: "Otimizando o Atendimento com IA: Guia Completo",
    author: "Equipe Pontedra",
    date: "2024-10-26",
    content: "Descubra como a inteligência artificial pode revolucionar a forma como você interage com seus clientes, automatizando tarefas e personalizando a experiência. Este guia completo aborda desde os conceitos básicos até as implementações avançadas, mostrando como a Pontedra pode ser sua aliada estratégica.",
    imageUrl: "https://via.placeholder.com/400x200/57e389/0c1624?text=IA+Atendimento",
    tags: ["IA", "Atendimento", "Automação"]
  },
  {
    id: "blog2",
    title: "Centralização Multicanal: A Chave para a Eficiência",
    author: "Equipe Pontedra",
    date: "2024-10-20",
    content: "Gerenciar WhatsApp, Instagram e Messenger em um só lugar nunca foi tão fácil. Veja os benefícios de uma plataforma unificada que otimiza o tempo da sua equipe e melhora a satisfação do cliente.",
    imageUrl: "https://via.placeholder.com/400x200/111d2e/e1e8f0?text=Multicanal",
    tags: ["Canais", "Integração", "Eficiência"]
  },
  {
    id: "blog3",
    title: "Agendamentos Inteligentes: Menos Esforço, Mais Clientes",
    author: "Equipe Pontedra",
    date: "2024-10-15",
    content: "Automatize o processo de agendamento e libere sua equipe para focar no que realmente importa: o serviço ao cliente. Com a Pontedra, seus clientes agendam com autonomia e você reduz a carga operacional.",
    imageUrl: "https://via.placeholder.com/400x200/9ba8b5/0c1624?text=Agenda+IA",
    tags: ["Agendamento", "Automação", "Produtividade"]
  },
];

export const MOCK_CHANNELS: ChannelState[] = [
  { id: "ch1", name: "WhatsApp Business", icon: "MessageCircle", connected: false, description: "Simulação de integração com o WhatsApp para mensagens automatizadas e atendimento ao cliente." },
  { id: "ch2", name: "Messenger (Facebook)", icon: "MessageSquare", connected: false, description: "Simulação de gerenciamento de conversas e automações no Facebook Messenger." },
  { id: "ch3", name: "Instagram Direct", icon: "Camera", connected: false, description: "Simulação de interação com clientes e automação de respostas no Instagram Direct." },
];

export const MOCK_COMPANY_INFO: CompanyInfo = {
  name: "Pontedra SaaS Ltda.",
  email: "contato@pontedra.com",
  phone: "5511999998888",
  address: "Rua da Inovação, 456 - Centro, São Paulo - SP",
  logoUrl: "https://via.placeholder.com/150/57e389/0c1624?text=Pontedra",
};

export const MOCK_SYSTEM_PARAMS: SystemParams = {
  clientLimit: 1000,
  activePlan: "Premium",
};

export const MOCK_AI_INSIGHTS: AIInsight[] = [
  { id: "ai1", type: "suggestion", title: "Otimização de Pacotes", description: "Clientes que agendam 'Corte de Cabelo Masculino' frequentemente também se interessam por 'Barba e Bigode'. Considere oferecer um pacote combinado.", date: "2024-11-01" },
  { id: "ai2", type: "trend", title: "Tendência de Agendamento", description: "Aumento de 15% nos agendamentos para serviços de 'Estética' nas últimas 4 semanas. Invista mais em marketing para esta categoria.", date: "2024-11-01" },
  { id: "ai3", type: "alert", title: "Clientes Inativos", description: "Identificamos 50 clientes inativos há mais de 3 meses. Sugerimos uma campanha de reengajamento com um desconto especial.", date: "2024-11-01" },
  { id: "ai4", type: "suggestion", title: "Melhor Horário para Promoções", description: "Nossos dados indicam que as 17h de terças e quintas-feiras são os melhores horários para enviar promoções, com maior taxa de abertura.", date: "2024-11-01" },
];

export const MOCK_CLIENT_NOTIFICATION_SETTINGS: ClientNotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  whatsappNotifications: true,
};

export const MOCK_CLIENT_PRIVACY_SETTINGS: ClientPrivacySettings = {
  dataSharing: false,
  marketingEmails: true,
};

// Mock data for charts (example)
export const MOCK_CHART_DATA = {
  monthlyAppointments: [
    { name: 'Jan', value: 400 },
    { name: 'Fev', value: 300 },
    { name: 'Mar', value: 200 },
    { name: 'Abr', value: 278 },
    { name: 'Mai', value: 189 },
    { name: 'Jun', value: 239 },
    { name: 'Jul', value: 349 },
  ],
  servicePopularity: [
    { name: 'Corte', value: 240 },
    { name: 'Manicure', value: 139 },
    { name: 'Massagem', value: 98 },
    { name: 'Coloração', value: 390 },
    { name: 'Limpeza', value: 480 },
  ],
};

// New Mock Data for IA Insights and Planejamento Inteligente
export const MOCK_AI_SUGGESTIONS: AISuggestion[] = [
  { id: "ia1", category: "Marketing", message: "Sugestão de Marketing: publique mais conteúdo nas redes sociais para atrair novos clientes.", icon: "Lightbulb" },
  { id: "ia2", category: "Promoções", message: "Promoção sugerida: desconto de 10% em serviços com baixa demanda (março).", icon: "Tag" },
  { id: "ia3", category: "Preço", message: "Revisar preço de Manicure — aumento de 5% pode elevar o lucro sem afetar volume.", icon: "DollarSign" },
  { id: "ia4", category: "Atendimento", message: "Otimizar tempo de resposta no WhatsApp em horários de pico para melhorar a satisfação.", icon: "MessageSquare" },
  { id: "ia5", category: "Retenção de Clientes", message: "Campanha de e-mail para clientes inativos há mais de 3 meses com oferta especial.", icon: "Users" },
  { id: "ia6", category: "Serviços", message: "Considere adicionar um novo serviço de 'Spa dos Pés' devido à alta procura por bem-estar.", icon: "Briefcase" },
];

// New Mock Data for Atividades Recentes
export const MOCK_RECENT_ACTIVITIES: RecentActivity[] = [
  { id: "act1", type: "client_register", description: "Cadastro de novo cliente: Ana Beatriz", timestamp: "02/11 - 14:32", link: "/dashboard/master/users", icon: "UserPlus", iconColor: "text-primary" },
  { id: "act2", type: "appointment_created", description: "Novo agendamento criado: Corte de Cabelo para João Silva", timestamp: "03/11 - 09:10", link: "/dashboard/master/appointments", icon: "CalendarPlus", iconColor: "text-blue-400" },
  { id: "act3", type: "report_generated", description: "Relatório de vendas gerado", timestamp: "03/11 - 18:47", link: "/dashboard/master/financeiro", icon: "BarChart", iconColor: "text-yellow-400" },
  { id: "act4", type: "whatsapp_message", description: "Mensagem recebida no WhatsApp Business de Maria", timestamp: "04/11 - 10:15", link: "/dashboard/master/comunicacao/whatsapp", icon: "MessageCircle", iconColor: "text-green-400" },
  { id: "act5", type: "service_added", description: "Novo serviço 'Limpeza de Pele' adicionado", timestamp: "04/11 - 11:00", link: "/dashboard/master/services", icon: "Briefcase", iconColor: "text-purple-400" },
  { id: "act6", type: "blog_post", description: "Novo post no blog: 'Dicas de Verão'", timestamp: "04/11 - 14:00", link: "/dashboard/master/blog", icon: "Newspaper", iconColor: "text-orange-400" },
];

// New Mock Data for Financeiro
export const MOCK_FINANCE_SUMMARY = {
  totalRevenue: 12340.00,
  revenueChange: 18.0, // percentage change from previous month
  netProfit: 8950.00,
  mostProfitableService: "Coloração",
};

export const MOCK_FINANCE_ENTRIES: FinanceEntry[] = [
  { id: "fe1", date: "2024-11-02", clientName: "Ana Beatriz", serviceName: "Corte de Cabelo Masculino", value: 80.00, status: "Concluído" },
  { id: "fe2", date: "2024-11-03", clientName: "João Pedro", serviceName: "Manicure e Pedicure", value: 65.00, status: "Concluído" },
  { id: "fe3", date: "2024-11-04", clientName: "Camila Silva", serviceName: "Coloração Feminina", value: 150.00, status: "Concluído" },
  { id: "fe4", date: "2024-11-05", clientName: "Lucas Mendes", serviceName: "Limpeza de Pele", value: 100.00, status: "Pendente" },
  { id: "fe5", date: "2024-11-06", clientName: "Fernanda Lima", serviceName: "Massagem Relaxante", value: 130.00, status: "Cancelado" },
];

export const MOCK_FINANCE_CHART_DATA = {
  monthlyRevenue: [
    { name: 'Jan', value: 8000 },
    { name: 'Fev', value: 9500 },
    { name: 'Mar', value: 7000 },
    { name: 'Abr', value: 10200 },
    { name: 'Mai', value: 11500 },
    { name: 'Jun', value: 9800 },
    { name: 'Jul', value: 13000 },
    { name: 'Ago', value: 12500 },
    { name: 'Set', value: 14000 },
    { name: 'Out', value: 11000 },
    { name: 'Nov', value: 12340 }, // Current month
  ],
  accumulatedProfit: [
    { name: 'Jan', value: 5000 },
    { name: 'Fev', value: 6200 },
    { name: 'Mar', value: 4500 },
    { name: 'Abr', value: 7000 },
    { name: 'Mai', value: 8500 },
    { name: 'Jun', value: 7200 },
    { name: 'Jul', value: 10000 },
    { name: 'Ago', value: 9500 },
    { name: 'Set', value: 11000 },
    { name: 'Out', value: 8800 },
    { name: 'Nov', value: 8950 }, // Current month
  ],
};

// New Mock Data for Client Experience Page
export const MOCK_CLIENT_EXPERIENCE_SUMMARY: ClientExperienceSummary = {
  totalAppointments: 15,
  completedAppointments: 12,
  pendingAppointments: 3,
  lastInteraction: "há 3 dias",
};

export const MOCK_CLIENT_APPOINTMENT_HISTORY = [
  { id: "h1", date: "2024-11-20", serviceName: "Corte de Cabelo Masculino", status: "Concluído", value: 55.00, clientEmail: "cliente@teste.com" },
  { id: "h2", date: "2024-11-15", serviceName: "Manicure e Pedicure", status: "Concluído", value: 85.00, clientEmail: "cliente@teste.com" },
  { id: "h3", date: "2024-11-10", serviceName: "Limpeza de Pele", status: "Concluído", value: 100.00, clientEmail: "cliente@teste.com" },
  { id: "h4", date: "2024-11-05", serviceName: "Coloração Feminina", status: "Concluído", value: 180.00, clientEmail: "cliente@teste.com" },
  { id: "h5", date: "2024-10-28", serviceName: "Corte de Cabelo Masculino", status: "Concluído", value: 55.00, clientEmail: "cliente@teste.com" },
  { id: "h6", date: "2024-12-01", serviceName: "Massagem Relaxante", status: "Pendente", value: 130.00, clientEmail: "cliente@teste.com" },
  { id: "h7", date: "2024-12-05", serviceName: "Manicure e Pedicure", status: "Pendente", value: 85.00, clientEmail: "cliente@teste.com" },
];

export const MOCK_CLIENT_AI_RECOMMENDATIONS: ClientAIRecommendation[] = [
  { id: "rec1", message: "Você costuma agendar aos sábados. Deseja garantir seu próximo horário?", category: "Agendamento" },
  { id: "rec2", message: "Faz 30 dias desde seu último corte, gostaria de repetir o serviço?", category: "Serviço Recorrente" },
  { id: "rec3", message: "Baseado nos seus agendamentos, sugerimos o serviço de limpeza facial para complementar sua rotina.", category: "Sugestão de Serviço" },
  { id: "rec4", message: "Notamos que você não experimentou nossa Massagem Relaxante. Que tal agendar uma sessão?", category: "Novidade" },
  { id: "rec5", message: "Seu feedback é importante! Avalie seu último serviço de Manicure e Pedicure.", category: "Feedback" },
];

export const MOCK_CLIENT_PROMOTIONS: ClientPromotion[] = [
  { id: "promo1", title: "Desconto de 10% em Coloração", description: "Aproveite 10% de desconto na sua próxima coloração feminina este mês!", actionMessage: "Quero aproveitar a promoção de 10% em coloração!" },
  { id: "promo2", title: "Pacote Bem-Estar", description: "Agende Massagem Relaxante + Limpeza de Pele e ganhe 15% de desconto.", actionMessage: "Tenho interesse no pacote Bem-Estar com 15% de desconto." },
  { id: "promo3", title: "Aniversariante do Mês", description: "Parabéns! Você tem um presente especial de 20% de desconto em qualquer serviço.", actionMessage: "Quero usar meu desconto de aniversário de 20%!" },
];

export const MOCK_CLIENT_30_DAY_STATS = [
  { name: 'Semana 1', agendamentos: 3 },
  { name: 'Semana 2', agendamentos: 5 },
  { name: 'Semana 3', agendamentos: 2 },
  { name: 'Semana 4', agendamentos: 4 },
];

export const MOCK_CLIENT_ACTIVITY_SUMMARY: ClientActivitySummary = {
  nextAppointment: { service: "Manicure e Pedicure", date: "2024-12-05", time: "14:30" },
  lastService: { name: "Corte de Cabelo Masculino", date: "2024-11-20" },
  loyaltyPoints: 150,
  pendingPayment: null, // { amount: 75.00, dueDate: "2024-12-10" },
};

export const MOCK_CLIENT_NOTIFICATIONS: ClientNotification[] = [
  {
    id: "notif1",
    clientEmail: "cliente@teste.com",
    type: "lembrete",
    title: "Lembrete de Agendamento",
    message: "Você tem um corte de cabelo agendado amanhã, 23/11, às 14h. Não se atrase! ⏰",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: "notif2",
    clientEmail: "cliente@teste.com",
    type: "promoção",
    title: "Nova Promoção Disponível!",
    message: "Aproveite 10% de desconto no seu próximo serviço de Massagem Relaxante. Válido até 30/11! 🎉",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    read: false,
  },
  {
    id: "notif3",
    clientEmail: "cliente@teste.com",
    type: "confirmação",
    title: "Agendamento Confirmado",
    message: "Seu agendamento para Manicure e Pedicure em 22/11 às 14:30h foi confirmado com sucesso! ✅",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    read: true,
  },
  {
    id: "notif4",
    clientEmail: "cliente@teste.com",
    type: "info",
    title: "Atualização da Plataforma",
    message: "Novas funcionalidades foram adicionadas à sua Carteira Digital. Confira! 💳",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
  },
];

// New mock data for "Histórico e Controle de Agendamentos"
export const MOCK_CLIENT_DETAILED_APPOINTMENT_HISTORY: DetailedClientAppointment[] = [
  {
    id: "dca1",
    clientEmail: "cliente@teste.com",
    service: "Limpeza de Pele",
    professional: "Dra. Ana Paula",
    dateTime: "2024-12-10 14:00",
    status: "Agendado",
    value: 100.00,
    notes: "Preparar a pele para extração, foco na zona T."
  },
  {
    id: "dca2",
    clientEmail: "cliente@teste.com",
    service: "Corte Masculino",
    professional: "Carlos Mendes",
    dateTime: "2024-11-05 10:30",
    status: "Concluído",
    value: 55.00,
    notes: "Corte degradê nas laterais, tesoura em cima."
  },
  {
    id: "dca3",
    clientEmail: "cliente@teste.com",
    service: "Massagem Relaxante",
    professional: "Marina Souza",
    dateTime: "2024-12-12 09:00",
    status: "Pendente",
    value: 130.00,
    notes: "Foco em ombros e pescoço, usar óleo de lavanda."
  },
  {
    id: "dca4",
    clientEmail: "cliente@teste.com",
    service: "Tratamento Capilar",
    professional: "Camila Alves",
    dateTime: "2024-11-03 15:00",
    status: "Cancelado",
    value: 180.00,
    notes: "Cliente cancelou por imprevisto, reagendar."
  },
  {
    id: "dca5",
    clientEmail: "cliente@teste.com",
    service: "Manicure e Pedicure",
    professional: "Beatriz Costa",
    dateTime: "2024-11-25 16:00",
    status: "Concluído",
    value: 85.00,
    notes: "Esmalte vermelho, unhas quadradas."
  },
  {
    id: "dca6",
    clientEmail: "cliente@teste.com",
    service: "Coloração Feminina",
    professional: "Fernanda Dias",
    dateTime: "2024-12-20 10:00",
    status: "Agendado",
    value: 200.00,
    notes: "Retoque de raiz, tom loiro acinzentado."
  },
];

export const assistantProfile = {
  name: "Assistente Pontedra",
  status: "Online",
  description: "Assistente virtual da Pontedra para auxiliar clientes em dúvidas, agendamentos e promoções em tempo real."
};