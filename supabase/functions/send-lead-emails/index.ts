import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    console.log("📨 Dados recebidos do formulário:", { nome, email, telefone, assunto, mensagem, origem, url_captura, ip_address });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // Verificações explícitas para variáveis de ambiente
    if (!supabaseUrl) {
      console.error("❌ SUPABASE_URL environment variable is not set.");
      return new Response(JSON.stringify({ success: false, error: "Missing SUPABASE_URL environment variable." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    if (!supabaseKey) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set.");
      return new Response(JSON.stringify({ success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY environment variable." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    if (!resendKey) {
      console.error("❌ RESEND_API_KEY environment variable is not set.");
      return new Response(JSON.stringify({ success: false, error: "Missing RESEND_API_KEY environment variable. Please configure it in Supabase Project Settings -> Edge Functions -> Manage Secrets." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Inserir dados no Supabase
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
      console.error("❌ Erro ao inserir contato no Supabase:", insertError);
      throw new Error(`Falha ao inserir contato no banco de dados: ${insertError.message}`);
    }

    // Enviar e-mail via API do Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Pontedra Contato <no-reply@pontedra.com>",
        to: [
          "contato@pontedra.com",
          "heitor_contato@hotmail.com",
          "pontedradigital@gmail.com",
        ],
        subject: "Nova mensagem do formulário Pontedra",
        text: `
Nome: ${nome}
E-mail: ${email}
Telefone: ${telefone}
Assunto: ${assunto}
Mensagem: ${mensagem}
        `,
      }),
    });

    const resendResult = await resendResponse.json();
    console.log("✅ Resposta do Resend:", resendResult);

    if (!resendResponse.ok) {
      console.error("❌ Erro ao enviar e-mail via Resend:", resendResult);
      return new Response(JSON.stringify({ success: false, error: resendResult }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('E-mail enviado via Resend');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error("⚠️ Erro inesperado na Edge Function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});