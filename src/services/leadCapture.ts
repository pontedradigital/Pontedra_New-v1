import { supabase } from "@/lib/supabase";

interface LeadData {
  name: string;
  phone: string;
  email: string;
}

export const submitLeadPopup = async ({ name, phone, email }: LeadData): Promise<boolean> => {
  try {
    let ipAddress: string | null = null;
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      ipAddress = ipData.ip;
    } catch (ipError) {
      console.warn("Falha ao buscar endereço IP para o popup:", ipError);
    }

    const formData = {
      nome: name,
      email: email,
      telefone: phone,
      assunto: 'Lead via Popup de Captura',
      mensagem: 'Interesse em consultoria gratuita.',
      origem: 'Popup de Captura',
      url_captura: window.location.href,
      ip_address: ipAddress, // Passa o IP do cliente se disponível
    };

    // Invoca a mesma Edge Function usada pelo formulário de contato
    const { data, error } = await supabase.functions.invoke('send-lead-emails', {
      body: formData,
    });

    if (error) {
      console.error("Erro ao invocar a Edge Function para o popup:", error);
      return false;
    }

    if (data && data.success) {
      console.log('Lead do popup enviado com sucesso:', data);
      return true;
    } else {
      console.error('Erro na resposta da Edge Function para o popup:', data);
      return false;
    }
  } catch (error) {
    console.error("Erro inesperado ao enviar lead do popup:", error);
    return false;
  }
};