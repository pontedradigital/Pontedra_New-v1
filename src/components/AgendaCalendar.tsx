import React from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'; // Importa o CSS padrão do react-calendar
import { motion } from "framer-motion";
import { useMockData } from "@/context/MockContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaCalendarProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date | undefined;
}

const AgendaCalendar = ({ onSelectDate, selectedDate }: AgendaCalendarProps) => {
  const { appointments } = useMockData();

  const getDatesWithAppointments = () => {
    const dates = new Set<string>();
    appointments.forEach(app => {
      dates.add(app.date); // 'YYYY-MM-DD'
    });
    return dates;
  };

  const datesWithAppointments = getDatesWithAppointments();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-card rounded-2xl shadow-lg border border-border react-calendar-container"
    >
      <Calendar
        onChange={(value) => {
          if (value instanceof Date) {
            onSelectDate(value);
          } else if (Array.isArray(value) && value[0] instanceof Date) {
            onSelectDate(value[0]);
          }
        }}
        value={selectedDate}
        locale="pt-BR"
        className="w-full border-none bg-transparent text-foreground"
        tileClassName={({ date, view }) => {
          if (view === 'month') {
            const formattedDate = format(date, 'yyyy-MM-dd');
            if (datesWithAppointments.has(formattedDate)) {
              return 'has-appointments';
            }
          }
          return null;
        }}
        // Custom navigation and tile content to match theme
        prevLabel="<"
        nextLabel=">"
        prev2Label={null}
        next2Label={null}
      />
    </motion.div>
  );
};

export default AgendaCalendar;