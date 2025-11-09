import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, Sparkles, Clock, CheckCircle, Copy, TrendingUp, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/shared/DashboardLayout';
import { ProtectedRoute } from '@/components/dashboard/shared/ProtectedRoute';
import { toast } from 'sonner';

interface Beneficio {
  id: string;
  nome: string;
  descricao: string;
  pontos_necessarios: number;
  tipo: string;
  valor_desconto_percent: number | null;
  ativo: boolean;
}

interface Resgate {
  id: string;
  beneficio_id: string;
  pontos_gastos: number;
  status: string;
  data_resgate: string;
  data_expiracao: string;
  codigo_resgate: string;
  beneficios: {
    nome: string;
    tipo: string;
  };
}

interface HistoricoPontos {
  id: string;
  tipo: string;
  pontos: number;
  descricao: string;
  created_at: string;
}

export default function Beneficios() {
  const { user } = useAuth();
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [historico, setHistorico] = useState<HistoricoPontos[]>([]);
  const [pontosAtuais, setPontosAtuais] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedBeneficio, setSelectedBeneficio] = useState<Beneficio | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [codigoResgate, setCodigoResgate] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar pontos atuais
      const { data: pontosData } = await supabase
        .from('pontos_fidelidade')
        .select('pontos')
        .eq('cliente_id', user?.id)
        .single();

      setPontosAtuais(pontosData?.pontos || 0);

      // Carregar benefícios disponíveis
      const { data: beneficiosData } = await supabase
        .from('beneficios')
        .select('*')
        .eq('ativo', true)
        .order('pontos_necessarios', { ascending: true });

      setBeneficios(beneficiosData || []);

      // Carregar resgates do cliente
      const { data: resgatesData } = await supabase
        .from('resgates_beneficios')
        .select('*, beneficios(nome, tipo)')
        .eq('cliente_id', user?.id)
        .order('created_at', { ascending: false });

      setResgates(resgatesData || []);

      // Carregar histórico de pontos
      const { data: historicoData } = await supabase
        .from('historico_pontos')
        .select('*')
        .eq('cliente_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setHistorico(historicoData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar benefícios');
    } finally {
      setLoading(false);
    }
  };

  const handleResgatar = async () => {
    if (!selectedBeneficio || !user) return;

    setIsRedeeming(true);

    try {
      const { data, error } = await supabase.rpc('resgatar_beneficio', {
        p_cliente_id: user.id,
        p_beneficio_id: selectedBeneficio.id,
      });

      if (error) throw error;

      const result = data as any;

      if (!result.success) {
        toast.error(result.error || 'Erro ao resgatar benefício');
        return;
      }

      setCodigoResgate(result.codigo);
      setConfirmDialogOpen(false);
      setSuccessDialogOpen(true);
      loadData(); // Recarregar dados
      toast.success('Benefício resgatado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao resgatar:', error);
      toast.error('Erro ao resgatar benefício');
    } finally {
      setIsRedeeming(false);
    }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoResgate);
    toast.success('Código copiado!');
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, any> = {
      desconto: '💰',
      servico_gratis: '🎁',
      upgrade: '⬆️',
      brinde: '🎉',
    };
    return icons[tipo] || '🎁';
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      desconto: 'Desconto',
      servico_gratis: 'Serviço Grátis',
      upgrade: 'Upgrade',
      brinde: 'Brinde',
    };
    return labels[tipo] || tipo;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      aprovado: 'bg-green-500/10 text-green-400 border-green-500/30',
      usado: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      expirado: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return colors[status] || colors.pendente;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      usado: 'Usado',
      expirado: 'Expirado',
    };
    return labels[status] || status;
  };

  const proximoNivel = pontosAtuais < 100 ? 100 : pontosAtuais < 300 ? 300 : pontosAtuais < 500 ? 500 : 1000;
  const progressoNivel = (pontosAtuais / proximoNivel) * 100;

  return (
    <ProtectedRoute allowedRoles={['cliente']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-[#e1e8f0] mb-2">
              Programa de Benefícios
            </h1>
            <p className="text-[#9ba8b5]">
              Acumule pontos e troque por recompensas exclusivas
            </p>
          </div>

          {/* Pontos Card */}
          <Card className="border-[#57e389]/30 bg-gradient-to-br from-[#111d2e] to-[#0c1624]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#57e389] to-[#00b4ff] flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-[#e1e8f0] text-2xl">
                      {pontosAtuais} Pontos
                    </CardTitle>
                    <CardDescription className="text-[#9ba8b5]">
                      Nível: {pontosAtuais < 100 ? 'Bronze' : pontosAtuais < 300 ? 'Prata' : pontosAtuais < 500 ? 'Ouro' : 'Diamante'}
                    </CardDescription>
                  </div>
                </div>
                <Sparkles className="w-12 h-12 text-[#57e389]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#9ba8b5]">Progresso para o próximo nível</span>
                  <span className="text-[#57e389] font-medium">
                    {pontosAtuais}/{proximoNivel} pts
                  </span>
                </div>
                <Progress value={progressoNivel} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="beneficios" className="space-y-6">
            <TabsList className="bg-[#111d2e] border border-[#1d2c3f]">
              <TabsTrigger 
                value="beneficios"
                className="data-[state=active]:bg-[#57e389] data-[state=active]:text-[#0D1B2A]"
              >
                <Gift className="w-4 h-4 mr-2" />
                Benefícios Disponíveis
              </TabsTrigger>
              <TabsTrigger 
                value="resgates"
                className="data-[state=active]:bg-[#57e389] data-[state=active]:text-[#0D1B2A]"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Meus Resgates
              </TabsTrigger>
              <TabsTrigger 
                value="historico"
                className="data-[state=active]:bg-[#57e389] data-[state=active]:text-[#0D1B2A]"
              >
                <History className="w-4 h-4 mr-2" />
                Histórico
              </TabsTrigger>
            </TabsList>

            {/* Tab: Benefícios Disponíveis */}
            <TabsContent value="beneficios">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <p className="col-span-3 text-center text-[#9ba8b5] py-8">Carregando...</p>
                ) : (
                  beneficios.map((beneficio, index) => {
                    const canRedeem = pontosAtuais >= beneficio.pontos_necessarios;
                    return (
                      <motion.div
                        key={beneficio.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`border-[#1d2c3f] ${
                          canRedeem ? 'bg-[#0c1624]' : 'bg-[#0c1624]/50'
                        } hover:border-[#57e389]/30 transition-all`}>
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-3xl">{getTipoIcon(beneficio.tipo)}</span>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#57e389]/10 text-[#57e389] border border-[#57e389]/30">
                                {getTipoLabel(beneficio.tipo)}
                              </span>
                            </div>
                            <CardTitle className="text-[#e1e8f0] text-lg">
                              {beneficio.nome}
                            </CardTitle>
                            <CardDescription className="text-[#9ba8b5]">
                              {beneficio.descricao}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[#9ba8b5] text-sm">Necessário:</span>
                                <span className="text-[#57e389] font-bold text-lg">
                                  {beneficio.pontos_necessarios} pts
                                </span>
                              </div>
                              <Button
                                onClick={() => {
                                  setSelectedBeneficio(beneficio);
                                  setConfirmDialogOpen(true);
                                }}
                                disabled={!canRedeem}
                                className={`w-full ${
                                  canRedeem
                                    ? 'bg-[#57e389] hover:bg-[#00ffae] text-[#0D1B2A]'
                                    : 'bg-[#1d2c3f] text-[#9ba8b5] cursor-not-allowed'
                                }`}
                              >
                                {canRedeem ? 'Resgatar' : 'Pontos Insuficientes'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* Tab: Meus Resgates */}
            <TabsContent value="resgates">
              <div className="space-y-4">
                {resgates.length === 0 ? (
                  <Card className="border-[#1d2c3f] bg-[#111d2e]/50">
                    <CardContent className="py-12 text-center">
                      <Gift className="w-16 h-16 mx-auto text-[#9ba8b5] mb-4" />
                      <p className="text-[#9ba8b5]">
                        Você ainda não resgatou nenhum benefício
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  resgates.map((resgate) => (
                    <Card key={resgate.id} className="border-[#1d2c3f] bg-[#111d2e]/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{getTipoIcon(resgate.beneficios.tipo)}</span>
                              <div>
                                <h3 className="text-lg font-bold text-[#e1e8f0]">
                                  {resgate.beneficios.nome}
                                </h3>
                                <p className="text-sm text-[#9ba8b5]">
                                  Código: {resgate.codigo_resgate}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#9ba8b5] mt-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Resgatado em {new Date(resgate.data_resgate).toLocaleDateString('pt-BR')}
                              </span>
                              {resgate.data_expiracao && (
                                <span className="flex items-center gap-1">
                                  ⏰ Expira em {new Date(resgate.data_expiracao).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(resgate.status)}`}>
                              {getStatusLabel(resgate.status)}
                            </span>
                            <span className="text-[#9ba8b5] text-sm">
                              -{resgate.pontos_gastos} pts
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tab: Histórico */}
            <TabsContent value="historico">
              <Card className="border-[#1d2c3f] bg-[#111d2e]/50">
                <CardContent className="p-6">
                  {historico.length === 0 ? (
                    <div className="py-12 text-center">
                      <TrendingUp className="w-16 h-16 mx-auto text-[#9ba8b5] mb-4" />
                      <p className="text-[#9ba8b5]">
                        Nenhum histórico de pontos ainda
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historico.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-[#0c1624] rounded-lg border border-[#1d2c3f]"
                        >
                          <div>
                            <p className="text-[#e1e8f0] font-medium">{item.descricao}</p>
                            <p className="text-sm text-[#9ba8b5]">
                              {new Date(item.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <span className={`text-lg font-bold ${
                            item.tipo === 'ganho' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {item.tipo === 'ganho' ? '+' : '-'}{item.pontos} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Confirm Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="bg-[#111d2e] border-[#1d2c3f]">
            <DialogHeader>
              <DialogTitle className="text-[#e1e8f0]">Confirmar Resgate</DialogTitle>
              <DialogDescription className="text-[#9ba8b5]">
                Deseja resgatar este benefício?
              </DialogDescription>
            </DialogHeader>
            {selectedBeneficio && (
              <div className="space-y-4">
                <div className="p-4 bg-[#0c1624] rounded-lg border border-[#1d2c3f]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{getTipoIcon(selectedBeneficio.tipo)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-[#e1e8f0]">
                        {selectedBeneficio.nome}
                      </h3>
                      <p className="text-sm text-[#9ba8b5]">{selectedBeneficio.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9ba8b5]">Custo:</span>
                    <span className="text-[#57e389] font-bold">
                      {selectedBeneficio.pontos_necessarios} pontos
                    </span>
                  </div>
                </div>
                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <AlertDescription className="text-amber-400">
                    Após o resgate, você terá <strong>{pontosAtuais - selectedBeneficio.pontos_necessarios}</strong> pontos restantes.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialogOpen(false)}
                className="border-[#1d2c3f] text-[#9ba8b5]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleResgatar}
                disabled={isRedeeming}
                className="bg-[#57e389] hover:bg-[#00ffae] text-[#0D1B2A]"
              >
                {isRedeeming ? 'Resgatando...' : 'Confirmar Resgate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="bg-[#111d2e] border-[#1d2c3f]">
            <DialogHeader>
              <DialogTitle className="text-[#e1e8f0] flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Resgate Realizado!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/30">
                <AlertDescription className="text-green-400">
                  Seu benefício foi resgatado com sucesso! Guarde o código abaixo.
                </AlertDescription>
              </Alert>
              
              <div className="p-6 bg-[#0c1624] rounded-lg border border-[#1d2c3f] text-center">
                <p className="text-sm text-[#9ba8b5] mb-2">Código do Resgate:</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <code className="text-2xl font-bold text-[#57e389] tracking-wider">
                    {codigoResgate}
                  </code>
                  <Button
                    onClick={copiarCodigo}
                    variant="ghost"
                    size="icon"
                    className="text-[#57e389] hover:bg-[#57e389]/10"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-[#9ba8b5]">
                  Apresente este código ao solicitar o benefício
                </p>
              </div>

              <div className="space-y-2 text-sm text-[#9ba8b5]">
                <p>✓ O código foi salvo em "Meus Resgates"</p>
                <p>✓ Você receberá um e-mail de confirmação</p>
                <p>✓ O benefício expira em 90 dias</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setSuccessDialogOpen(false)}
                className="w-full bg-[#57e389] hover:bg-[#00ffae] text-[#0D1B2A]"
              >
                Entendi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}