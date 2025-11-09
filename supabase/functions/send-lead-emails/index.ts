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
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #0D1B2A;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1B2A; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111d2e; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            
            <!-- Logo -->
            <tr>
              <td align="center" style="padding: 40px 40px 20px 40px; background: linear-gradient(135deg, #0D1B2A 0%, #1a2f42 100%);">
                <img src="https://qtuctrqomfwvantainjc.supabase.co/storage/v1/object/public/images/pontedra-logo.webp" alt="Pontedra" style="width: 180px; height: auto;">
              </td>
            </tr>

            <!-- Título -->
            <tr>
              <td align="center" style="padding: 30px 40px; background: linear-gradient(135deg, #0D1B2A 0%, #1a2f42 100%);">
                <h1 style="margin: 0; color: #00C896; font-size: 32px; font-weight: bold;">
                  Obrigado pelo contato!
                </h1>
              </td>
            </tr>

            <!-- Conteúdo -->
            <tr>
              <td style="padding: 40px;">
                <p style="margin: 0 0 20px 0; color: #e1e8f0; font-size: 18px; line-height: 1.6;">
                  Olá <strong style="color: #00C896;">${nome}</strong>,
                </p>
                
                <p style="margin: 0 0 20px 0; color: #9ba8b5; font-size: 16px; line-height: 1.6;">
                  😊 Ficamos muito felizes em saber que você entrou em contato com a Pontedra! Cada mensagem que recebemos representa uma nova oportunidade de entender necessidades reais e criar algo que gere impacto de verdade.
                </p>

                <p style="margin: 0 0 20px 0; color: #9ba8b5; font-size: 16px; line-height: 1.6;">
                  👩‍💻 Nossa equipe já está analisando sua solicitação com atenção e em breve retornaremos com uma resposta personalizada, feita especialmente para você.
                </p>

                <p style="margin: 0 0 30px 0; color: #9ba8b5; font-size: 16px; line-height: 1.6;">
                  🚀 Estamos empolgados para dar o próximo passo junto com você.
                </p>

                <div style="background-color: #0B1420; border-left: 4px solid #00C896; padding: 20px; margin: 30px 0; border-radius: 8px;">
                  <p style="margin: 0; color: #e1e8f0; font-size: 15px; line-height: 1.6;">
                    Enquanto aguarda nosso retorno, aproveite para acessar nossa plataforma de clientes através do site <a href="https://www.pontedra.com" style="color: #00C896; text-decoration: none; font-weight: bold;">www.pontedra.com</a> e, na aba <strong>Login</strong>, você já poderá conhecer algumas das ferramentas disponíveis, agendar uma consultoria e se aproximar ainda mais do nosso time.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Informações de Contato -->
            <tr>
              <td style="padding: 30px 40px; background-color: #0B1420; border-top: 1px solid #1d2c3f;">
                <p style="margin: 0 0 15px 0; color: #00C896; font-size: 16px; font-weight: bold;">
                  📞 Entre em contato:
                </p>
                <p style="margin: 0 0 8px 0; color: #9ba8b5; font-size: 14px;">
                  <strong style="color: #e1e8f0;">Telefone:</strong> +55 11 97877-7308
                </p>
                <p style="margin: 0 0 8px 0; color: #9ba8b5; font-size: 14px;">
                  <strong style="color: #e1e8f0;">E-mail:</strong> contato@pontedra.com
                </p>
                <p style="margin: 0; color: #9ba8b5; font-size: 14px;">
                  <strong style="color: #e1e8f0;">Site:</strong> www.pontedra.com
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 30px 40px; background-color: #0a0f1c;">
                <p style="margin: 0 0 10px 0; color: #9ba8b5; font-size: 12px;">
                  © 2025 Pontedra - Conectando empresas a pessoas
                </p>
                <p style="margin: 0; color: #6b7885; font-size: 11px;">
                  Avenida Vila Ema 4191 - Vila Ema - São Paulo/SP
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
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