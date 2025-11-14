import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Edit, Loader2, Save, XCircle, MessageCircle } from 'lucide-react';

interface Setting {
  key: string;
  value: string; // O número de WhatsApp será uma string
}

export default function WhatsAppNumberSettingCard() {
  const queryClient = useQueryClient();
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch WhatsApp contact number
  const { data, isLoading, isError, error } = useQuery<Setting | null, Error>({
    queryKey: ['settings', 'whatsapp_contact_number'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'whatsapp_contact_number')
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      return data;
    },
    onSuccess: (setting) => {
      if (setting) {
        setWhatsappNumber(setting.value);
      }
    },
  });

  // Mutation to update WhatsApp contact number
  const updateWhatsappMutation = useMutation<void, Error, string>({
    mutationFn: async (newValue) => {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'whatsapp_contact_number', value: newValue }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'whatsapp_contact_number'] });
      toast.success('Número de WhatsApp atualizado com sucesso!');
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar número de WhatsApp: ${err.message}`);
    },
  });

  const handleSave = () => {
    // Basic validation for phone number format (optional, can be more robust)
    const cleanedNumber = whatsappNumber.replace(/\D/g, ''); // Remove non-digits
    if (cleanedNumber.length < 10 || cleanedNumber.length > 11) {
      toast.error('Por favor, insira um número de WhatsApp válido (DDD + 8 ou 9 dígitos).');
      return;
    }
    updateWhatsappMutation.mutate(whatsappNumber);
  };

  const formatPhoneNumberDisplay = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 10) { // Fixo (DDD + 8 dígitos)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length === 11) { // Celular (DDD + 9 dígitos)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
    return value; // Retorna o valor original se não corresponder aos formatos
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground">Número de WhatsApp</CardTitle>
          <CardDescription className="text-muted-foreground">
            Carregando configurações de WhatsApp...
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
          <CardTitle className="text-2xl font-semibold text-foreground">Número de WhatsApp</CardTitle>
          <CardDescription className="text-destructive">
            Erro ao carregar número de WhatsApp: {error?.message}
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
        <CardTitle className="text-2xl font-semibold text-foreground">Número de WhatsApp</CardTitle>
        <CardDescription className="text-muted-foreground">
          Defina o número de WhatsApp para contato em propostas e outras comunicações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="whatsapp-number" className="text-right md:col-span-1">Número</Label>
            <div className="relative col-span-3">
              <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="whatsapp-number"
                type="tel"
                value={isEditing ? whatsappNumber : formatPhoneNumberDisplay(whatsappNumber)}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                disabled={!isEditing || updateWhatsappMutation.isPending}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); setWhatsappNumber(data?.value || ''); }} className="bg-background border-border text-foreground hover:bg-muted">
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button onClick={handleSave} disabled={updateWhatsappMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {updateWhatsappMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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