import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/master/StatCard';
import MiniStatCard from '@/components/dashboard/master/MiniStatCard';
import ActionButton from '@/components/dashboard/master/ActionButton';
import TicketsTable from '@/components/dashboard/master/TicketsTable';
import UpdatesList from '@/components/dashboard/master/UpdatesList';
import DistributionChart from '@/components/dashboard/master/DistributionChart';
import SaleReportChart from '@/components/dashboard/master/SaleReportChart';
import SalesOverviewCard from '@/components/dashboard/master/SalesOverviewCard';
import OpenInvoicesTable from '@/components/dashboard/master/OpenInvoicesTable';
import { Users, Folder, DollarSign, Download, ArrowUpRight, ShoppingBag, ShoppingCart, TrendingUp } from 'lucide-react';

export default function MasterHome() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0 space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-foreground">Olá, {profile?.nome || 'Master'}!</h1>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md w-full sm:w-auto">Importar</Button>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Usuários"
            value="33,956"
            change="+3.12%"
            changeType="up"
            description="Total de usuários em todo o mundo"
            chartData={[30, 40, 25, 50, 35, 60, 45]}
            chartColor="#57e389"
          />
          <StatCard
            title="Projetos"
            value="50.36%"
            change="+9.12%"
            changeType="up"
            description="Total de usuários em todo o mundo"
            chartData={[40, 30, 45, 20, 55, 30, 65]}
            chartColor="#00b4ff"
          />
          <StatCard
            title="Vendas Totais"
            value="13,956"
            change="27,219"
            changeType="up"
            description="Audiência à qual os usuários pertenciam enquanto na data atual Audiência à qual os usuários pertenciam enquanto na data atual"
            chartData={[10, 20, 15, 30, 25, 40, 35]}
            chartColor="#e35b57"
          />
        </div>

        {/* Downloads and Sales Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Downloads</h3>
              <p className="text-sm text-muted-foreground">
                Assistindo o dedo do pé derreter. Isso é divertido. Só você poderia tornar essas palavras fofas.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MiniStatCard title="Offline" value="45,324" percentage={70} color="yellow" />
              <MiniStatCard title="Online" value="12,236" percentage={30} color="blue" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <StatCard
              title="Gráfico de Vendas"
              value=""
              change=""
              changeType="up"
              description="Audiência à qual os usuários pertenciam enquanto na data atual"
              chartData={[100, 250, 180, 320, 200, 280, 150]}
              chartColor="#00b4ff"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ActionButton icon={ArrowUpRight} title="Vendas Totais" value="$508" color="green" />
          <ActionButton icon={ShoppingBag} title="Compras Totais" value="$387" color="blue" />
          <ActionButton icon={ShoppingCart} title="Pedidos Totais" value="$161" color="red" />
          <ActionButton icon={TrendingUp} title="Crescimento Total" value="$231" color="yellow" />
        </div>

        {/* Tickets and Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TicketsTable />
          <UpdatesList />
        </div>

        {/* Distribution, Sale Report, and Sales Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DistributionChart />
          <SaleReportChart />
          <SalesOverviewCard />
        </div>

        {/* Open Invoices Table */}
        <OpenInvoicesTable />
      </motion.div>
    </DashboardLayout>
  );
}