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
}

export const MOCK_CLIENT_SERVICES: Service[] = [
  { id: "s1", name: "Corte de Cabelo Masculino", description: "Corte moderno com lavagem e finalização.", price: 55.00, category: "Cabelo", availability: "available", imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Corte" },
  { id: "s2", name: "Manicure e Pedicure", description: "Serviço completo de unhas.", price: 85.00, category: "Estética", availability: "available", imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Manicure" },
  { id: "s3", name: "Massagem Relaxante", description: "Sessão de 60 minutos para alívio do estresse.", price: 130.00, category: "Bem-estar", availability: "available", imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?text=Massagem" },
  { id: "s4", name: "Coloração Feminina", description: "Aplicação de tintura e tratamento pós-coloração.", price: 180.00, category: "Cabelo", availability: "available", imageUrl: "https://via.placeholder.com/150/FFFF00/000000?text=Coloracao" },
  { id: "s5", name: "Limpeza de Pele", description: "Limpeza profunda com extração e hidratação.", price: 100.00, category: "Estética", availability: "available", imageUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?text=Pele" },
];

export const MOCK_CLIENT_APPOINTMENTS: Appointment[] = [
  { id: "a1", clientEmail: "cliente@teste.com", serviceName: "Corte de Cabelo Masculino", date: "2024-11-20", time: "10:00", status: "confirmed" },
  { id: "a2", clientEmail: "cliente@teste.com", serviceName: "Manicure e Pedicure", date: "2024-11-22", time: "14:30", status: "pending" },
  { id: "a3", clientEmail: "cliente@teste.com", serviceName: "Massagem Relaxante", date: "2024-10-10", time: "11:00", status: "completed" },
];

export const MOCK_AVAILABLE_TIMES = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];