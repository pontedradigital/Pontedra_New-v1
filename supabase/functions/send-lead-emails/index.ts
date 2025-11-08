import { serve } from "https://deno.land/std@0.190.0/http/server.ts"; // Usando a versão mais recente do Deno std
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"; // Usando a versão mais recente do Supabase JS
import { Resend } from "npm:resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, email, telefone, assunto, mensagem, origem, url_captura, ip_address } = await req.json();

    console.log('Dados recebidos na Edge Function:', { nome, email, telefone, assunto, mensagem, origem, url_captura, ip_address });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    const { error: insertError } = await supabase.from("site_contato").insert([
      {
        nome,
        email,
        telefone,
        assunto,
        mensagem,
        origem,
        url_captura,
        ip_address,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      throw new Error(`Falha ao inserir contato: ${insertError.message}`);
    }

    await resend.emails.send({
      from: "contato@pontedra.com", // Certifique-se de que este e-mail é verificado no Resend
      to: "contato@pontedra.com", // E-mail para onde os leads serão enviados
      subject: `Novo contato recebido: ${assunto}`,
      html: `
        <h2>Novo contato recebido</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${mensagem}</p>
        <hr/>
        <p><strong>Origem:</strong> ${origem}</p>
        <p><strong>URL Captura:</strong> ${url_captura}</p>
        <p><strong>IP:</strong> ${ip_address}</p>
      `,
    });

    console.log('E-mail enviado via Resend');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao processar contato na Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});