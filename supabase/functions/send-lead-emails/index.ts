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

    // --- Envio de e-mail para a equipe interna ---
    const resendInternalResponse = await fetch("https://api.resend.com/emails", {
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

    const resendInternalResult = await resendInternalResponse.json();
    console.log("✅ Resposta do Resend (Equipe Interna):", resendInternalResult);

    if (!resendInternalResponse.ok) {
      console.error("❌ Erro ao enviar e-mail para a equipe interna via Resend:", resendInternalResult);
      return new Response(JSON.stringify({ success: false, error: resendInternalResult }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // --- Envio de e-mail de confirmação para o cliente (AGORA EM HTML) ---
    const clientEmailHtml = `
      <div style="font-family: 'Poppins', sans-serif; background-color: #0D1B2A; color: #e1e8f0; padding: 20px; text-align: center;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <img src="https://qtuctrqomfwvantainjc.supabase.co/storage/v1/object/public/images/pontedra-logo.webp" alt="Pontedra Logo" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>
          <tr>
            <td align="center">
              <div style="background-color: #111d2e; border: 1px solid #1d2c3f; border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto; text-align: left;">
                <h1 style="color: #57e389; font-size: 28px; margin-bottom: 20px; text-align: center;">Olá ${nome},</h1>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                  Recebemos sua mensagem e gostaríamos de agradecer pelo seu contato com a Pontedra!
                </p>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                  Nossa equipe está analisando sua solicitação com atenção e retornaremos o mais breve possível para conversarmos sobre como podemos impulsionar o seu negócio.
                </p>
                <div style="background-color: #0a1520; border: 1px solid #1d2c3f; border-left: 4px solid #57e389; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                  <p style="font-size: 15px; color: #9ba8b5; margin-bottom: 10px;"><strong>Detalhes da sua mensagem:</strong></p>
                  <p style="font-size: 15px; line-height: 1.5; margin-bottom: 5px;"><strong>Assunto:</strong> ${assunto || 'Não informado'}</p>
                  <p style="font-size: 15px; line-height: 1.5;"><strong>Mensagem:</strong> ${mensagem}</p>
                </div>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  Enquanto isso, sinta-se à vontade para explorar nosso site e conhecer mais sobre nossas soluções em desenvolvimento web e marketing digital.
                </p>
                <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #9ba8b5;">
                  Atenciosamente,<br>
                  <strong>Equipe Pontedra</strong>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="font-size: 12px; color: #9ba8b5;">
                Este é um e-mail automático, por favor, não responda diretamente.
              </p>
              <p style="font-size: 12px; color: #9ba8b5;">
                Pontedra - Conectamos sua empresa a pessoas.
              </p>
            </td>
          </tr>
        </table>
      </div>
    `;

    const resendClientResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Pontedra <no-reply@pontedra.com>", // Remetente para o cliente
        to: [email], // E-mail do cliente
        subject: `Obrigado pelo seu contato, ${nome}!`,
        html: clientEmailHtml, // Usando o template HTML
      }),
    });

    const resendClientResult = await resendClientResponse.json();
    console.log("✅ Resposta do Resend (Cliente):", resendClientResult);

    if (!resendClientResponse.ok) {
      console.error("❌ Erro ao enviar e-mail de confirmação para o cliente via Resend:", resendClientResult);
      // Não vamos retornar um erro 500 aqui, pois o e-mail interno já foi enviado com sucesso.
      // Apenas logamos o erro para investigação.
    }

    console.log('E-mails enviados via Resend');

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