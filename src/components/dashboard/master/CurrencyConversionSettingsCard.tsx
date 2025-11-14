import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Percent, DollarSign, Loader2, Edit, Save, XCircle } from 'lucide-react';

interface Setting {
  key: string;
  value: number;
}

export default function CurrencyConversionSettingsCard() {
  const queryClient = useQueryClient();
  const [iofPercentage, setIofPercentage] = useState<number>(0.38); // Default fallback
  const [usdToBrlRate, setUsdToBrlRate] = useState<number>(5.00); // Default fallback
  const [isEditing, setIsEditing] = useState(false);

  // Fetch IOF percentage
  const { data: iofData, isLoading: isLoadingIof } = useQuery<Setting | null, Error>({
    queryKey: ['settings', 'iof_percentage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'iof_percentage')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    onSuccess: (setting) => {
      if (setting) setIofPercentage(setting.value);
    },
    staleTime: Infinity,
  });

  // Fetch USD to BRL rate
  const { data: usdRateData, isLoading: isLoadingUsdRate } = useQuery<Setting | null, Error>({
    queryKey: ['settings', 'usd_to_brl_rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'usd_to_brl_rate')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    onSuccess: (setting) => {
      if (setting) setUsdToBrlRate(setting.value);
    },
    staleTime: Infinity,
  });

  // Mutation to update settings
  const updateSettingsMutation = useMutation<void, Error, { key: string; value: number }[]>({
    mutationFn: async (settingsToUpdate) => {
      const { error } = await supabase
        .from('settings')
        .upsert(settingsToUpdate, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'iof_percentage'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'usd_to_brl_rate'] });
      toast.success('Configurações de conversão de moeda atualizadas com sucesso!');
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar configurações: ${err.message}`);
    },
  });

  const handleSave = () => {
    if (iofPercentage < 0 || iofPercentage > 100) {
      toast.error('A porcentagem de IOF deve ser entre 0 e 100.');
      return;
    }
    if (usdToBrlRate <= 0) {
      toast.error('A taxa de câmbio USD para BRL deve ser maior que zero.');
      return;
    }

    updateSettingsMutation.mutate([
      { key: 'iof_percentage', value: iofPercentage },
      { key: 'usd_to_brl_rate', value: usdToBrlRate },
    ]);
  };

  if (isLoadingIof || isLoadingUsdRate) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Conversão de Moeda</CardTitle>
          <CardDescription className="text-muted-foreground">
            Carregando configurações de conversão...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">Conversão de Moeda</CardTitle>
        <CardDescription className="text-muted-foreground">
          Defina a porcentagem de IOF e a taxa de câmbio para conversão de USD para BRL.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* IOF Percentage */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="iof-percentage" className="text-right md:col-span-1">IOF (%)</Label>
            <div className="relative col-span-3">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="iof-percentage"
                type="number"
                step="0.01"
                value={iofPercentage}
                onChange={(e) => setIofPercentage(parseFloat(e.target.value))}
                className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                disabled={!isEditing || updateSettingsMutation.isPending}
              />
            </div>
          </div>

          {/* USD to BRL Rate */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="usd-to-brl-rate" className="text-right md:col-span-1">USD para BRL</Label>
            <div className="relative col-span-3">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="usd-to-brl-rate"
                type="number"
                step="0.0001"
                value={usdToBrlRate}
                onChange={(e) => setUsdToBrlRate(parseFloat(e.target.value))}
                className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                disabled={!isEditing || updateSettingsMutation.isPending}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); setIofPercentage(iofData?.value || 0.38); setUsdToBrlRate(usdRateData?.value || 5.00); }} className="bg-background border-border text-foreground hover:bg-muted">
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button onClick={handleSave} disabled={updateSettingsMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {updateSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}