import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  title: string;
  value: string;
  color: string; // Tailwind color class, e.g., 'green', 'blue', 'red', 'yellow'
}

export default function ActionButton({ icon: Icon, title, value, color }: ActionButtonProps) {
  return (
    <Button
      className={`w-full h-auto py-4 px-6 rounded-xl flex flex-col items-start justify-center 
                  bg-${color}-500 hover:bg-${color}-600 text-white shadow-lg 
                  shadow-${color}-500/30 transition-all duration-300`}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <Icon className="w-6 h-6" />
        <span className="text-xs font-medium opacity-80">{title}</span>
      </div>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs opacity-70">este mês</span>
    </Button>
  );
}