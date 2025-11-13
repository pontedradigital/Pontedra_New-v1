import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Edit, Loader2, Percent, Save, XCircle } from 'lucide-react';

interface InstallmentRate {
  installments: number;
  merchant_pays_rate: number;
  client_pays_rate: number;
}

export default function InstallmentRatesSettingCard() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentRates, setCurrentRates] = useState<Partial<InstallmentRate>>({});

  const { data: rates, isLoading, isError, error } = useQuery<InstallmentRate[], Error>({
    queryKey: ['installment_rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installment_rates')
        .select('*')
        .order('installments', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const updateRateMutation = useMutation<void, Error, InstallmentRate>({
    mutationFn: async (updatedRate) => {
      const { error } = await supabase
        .from('installment_rates')
        .update({
          merchant_pays_rate: updatedRate.merchant_pays_rate,
          client_pays_rate: updatedRate.client_pays_rate,
        })
        .eq('installments', updatedRate.installments);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installment_rates'] });
      toast.success('Taxa de parcelamento atualizada com sucesso!');
      setEditingId(null);
      setCurrentRates({});
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar taxa: ${err.message}`);
    },
  });

  const handleEdit = (rate: InstallmentRate) => {
    setEditingId(rate.installments);
    setCurrentRates({
      installments: rate.installments,
      merchant_pays_rate: rate.merchant_pays_rate * 100, // Convert to percentage for display
      client_pays_rate: rate.client_pays_rate * 100,     // Convert to percentage for display
    });
  };

  const handleSave = () => {
    if (currentRates.installments === undefined || currentRates.merchant_pays_rate === undefined || currentRates.client_pays_rate === undefined) {
      toast.error('Valores inválidos para salvar.');
      return;
    }

    const merchantRate = currentRates.merchant_pays_rate / 100; // Convert back to decimal
    const clientRate = currentRates.client_pays_rate / 100;     // Convert back to decimal

    if (merchantRate < 0 || merchantRate > 1 || clientRate < 0 || clientRate > 1) {
      toast.error('As porcentagens devem estar entre 0 e 100.');
      return;
    }

    updateRateMutation.mutate({
      installments: currentRates.installments,
      merchant_pays_rate: merchantRate,
      client_pays_rate: clientRate,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setCurrentRates({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'merchant_pays_rate' | 'client_pays_rate') => {
    const value = parseFloat(e.target.value);
    setCurrentRates(prev => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value,
    }));
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Taxas de Parcelamento</CardTitle>
          <CardDescription className="text-muted-foreground">
            Carregando taxas de parcelamento...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Taxas de Parcelamento</CardTitle>
          <CardDescription className="text-destructive">
            Erro ao carregar taxas de parcelamento: {error?.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Por favor, tente novamente mais tarde.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Taxas de Parcelamento</CardTitle>
        <CardDescription className="text-muted-foreground">
          Gerencie as taxas de juros para pagamentos parcelados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {rates?.map((rate) => (
            <div key={rate.installments} className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
              <Label className="text-right md:col-span-1 text-foreground font-semibold">
                {rate.installments}x
              </Label>
              <div className="relative col-span-3">
                <Label htmlFor={`merchant-rate-${rate.installments}`} className="text-muted-foreground text-sm block mb-1">
                  Lojista Paga (%)
                </Label>
                <Percent className="absolute left-3 top-[calc(50%+8px)] transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id={`merchant-rate-${rate.installments}`}
                  type="number"
                  step="0.01"
                  value={editingId === rate.installments ? currentRates.merchant_pays_rate : (rate.merchant_pays_rate * 100).toFixed(2)}
                  onChange={(e) => handleChange(e, 'merchant_pays_rate')}
                  className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                  disabled={editingId !== rate.installments || updateRateMutation.isPending}
                />
              </div>
              <div className="relative col-span-3">
                <Label htmlFor={`client-rate-${rate.installments}`} className="text-muted-foreground text-sm block mb-1">
                  Cliente Paga (%)
                </Label>
                <Percent className="absolute left-3 top-[calc(50%+8px)] transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id={`client-rate-${rate.installments}`}
                  type="number"
                  step="0.01"
                  value={editingId === rate.installments ? currentRates.client_pays_rate : (rate.client_pays_rate * 100).toFixed(2)}
                  onChange={(e) => handleChange(e, 'client_pays_rate')}
                  className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                  disabled={editingId !== rate.installments || updateRateMutation.isPending}
                />
              </div>
              <div className="md:col-span-7 flex justify-end gap-2 mt-2 md:mt-0">
                {editingId === rate.installments ? (
                  <>
                    <Button variant="outline" onClick={handleCancel} className="bg-background border-border text-foreground hover:bg-muted">
                      <XCircle className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={updateRateMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      {updateRateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Salvar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => handleEdit(rate)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}