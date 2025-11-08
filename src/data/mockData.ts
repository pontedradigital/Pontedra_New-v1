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