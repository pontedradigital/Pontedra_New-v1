import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Percent, Loader2, Edit } from 'lucide-react'; // Adicionado 'Edit' aqui

interface Setting {
  key: string;
  value: number;
}

export default function DefaultTaxSettingCard() {
  const queryClient = useQueryClient();
  const [taxPercentage, setTaxPercentage] = useState<number>(18); // Default fallback
  const [isEditing, setIsEditing] = useState(false);

  // Fetch default tax percentage
  const { data, isLoading, isError, error } = useQuery<Setting | null, Error>({
    queryKey: ['settings', 'default_tax_percentage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'default_tax_percentage')
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      return data;
    },
    onSuccess: (setting) => {
      if (setting) {
        setTaxPercentage(setting.value);
      }
    },
  });

  // Mutation to update default tax percentage
  const updateTaxMutation = useMutation<void, Error, number>({
    mutationFn: async (newValue) => {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'default_tax_percentage', value: newValue }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'default_tax_percentage'] });
      toast.success('Porcentagem de imposto padrão atualizada com sucesso!');
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar imposto: ${err.message}`);
    },
  });

  const handleSave = () => {
    if (taxPercentage < 0 || taxPercentage > 100) {
      toast.error('A porcentagem de imposto deve ser entre 0 e 100.');
      return;
    }
    updateTaxMutation.mutate(taxPercentage);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Imposto Padrão</CardTitle>
          <CardDescription className="text-muted-foreground">
            Carregando configurações de imposto...
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
          <CardTitle className="text-2xl font-semibold text-foreground">Imposto Padrão</CardTitle>
          <CardDescription className="text-destructive">
            Erro ao carregar imposto padrão: {error?.message}
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
        <CardTitle className="text-2xl font-semibold text-foreground">Imposto Padrão</CardTitle>
        <CardDescription className="text-muted-foreground">
          Defina a porcentagem de imposto que será aplicada automaticamente a novos serviços.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="default-tax" className="text-right md:col-span-1">Porcentagem (%)</Label>
            <div className="relative col-span-3">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="default-tax"
                type="number"
                step="0.01"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(parseFloat(e.target.value))}
                className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                disabled={!isEditing || updateTaxMutation.isPending}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); setTaxPercentage(data?.value || 18); }} className="bg-background border-border text-foreground hover:bg-muted">
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={updateTaxMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {updateTaxMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar'}
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