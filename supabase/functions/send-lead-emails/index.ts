import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from 'https://esm.sh/resend@3.5.0' // Usando esm.sh para importar Resend

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailLeadData {
  nome: string
  email: string
  telefone?: string
  assunto?: string
  mensagem?: string
  origem: string
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { data: leadData } = await req.json() as { data: EmailLeadData }

    if (!leadData.email || !leadData.mensagem) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios (e-mail e mensagem) ausentes" }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    if (!Deno.env.get('RESEND_API_KEY')) {
      throw new Error('RESEND_API_KEY is not set in environment variables.')
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    const origemTexto = {
      formulario_contato: 'Formulário de Contato',
      popup_solucoes: 'Pop-up - Seção Soluções',
      popup_tempo: 'Pop-up - Tempo de Navegação',
      popup_saida: 'Pop-up - Tentativa de Saída',
      popup_retorno: 'Pop-up - Retorno à Página',
    }[leadData.origem] || leadData.origem

    // E-mail para o cliente (confirmação)
    const emailCliente = {
      from: 'Pontedra <contato@pontedra.com>',
      to: leadData.email,
      subject: '✅ Recebemos seu contato - Pontedra',
      html: `
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
                          Olá <strong style="color: #00C896;">${leadData.nome}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 20px 0; color: #9ba8b5; font-size: 16px; line-height: 1.6;">
                          Recebemos sua mensagem através do <strong>${origemTexto}</strong> e agradecemos pelo interesse em nossos serviços!
                        </p>

                        ${leadData.mensagem ? `
                        <div style="background-color: #0B1420; border-left: 4px solid #00C896; padding: 20px; margin: 30px 0; border-radius: 8px;">
                          <p style="margin: 0 0 10px 0; color: #00C896; font-size: 14px; text-transform: uppercase; font-weight: bold;">
                            Sua mensagem:
                          </p>
                          <p style="margin: 0; color: #e1e8f0; font-size: 15px; line-height: 1.6;">
                            ${leadData.mensagem}
                          </p>
                        </div>
                        ` : ''}

                        <p style="margin: 30px 0 20px 0; color: #9ba8b5; font-size: 16px; line-height: 1.6;">
                          Nossa equipe analisará sua solicitação e retornaremos em breve com uma proposta personalizada para suas necessidades.
                        </p>

                        <div style="background: linear-gradient(135deg, #00C896 0%, #00E0A0 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                          <p style="margin: 0; color: #0D1B2A; font-size: 16px; font-weight: bold;">
                            ⚡ Tempo médio de resposta: 24 horas
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
      `,
    }

    // E-mail para a equipe Pontedra (notificação)
    const internalRecipients = [
      "contato@pontedra.com",
      "pontedradigital@gmail.com",
      "heitor_contato@hotmail.com"
    ]

    const emailEquipe = {
      from: 'Pontedra <contato@pontedra.com>',
      to: internalRecipients,
      subject: `🔔 Novo Lead: ${leadData.nome} - ${origemTexto}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="padding: 30px; background: linear-gradient(135deg, #00C896 0%, #00E0A0 100%);">
                        <h1 style="margin: 0; color: #0D1B2A; font-size: 24px; font-weight: bold;">
                          🎯 Novo Lead Capturado!
                        </h1>
                      </td>
                    </tr>

                    <!-- Origem -->
                    <tr>
                      <td style="padding: 20px 30px; background-color: #f8f9fa;">
                        <p style="margin: 0; color: #495057; font-size: 14px;">
                          <strong>Origem:</strong> <span style="color: #00C896; font-weight: bold;">${origemTexto}</span>
                        </p>
                      </td>
                    </tr>

                    <!-- Dados do Lead -->
                    <tr>
                      <td style="padding: 30px;">
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #6c757d; font-size: 14px; padding: 8px 0;"><strong>👤 Nome:</strong></td>
                            <td style="color: #212529; font-size: 14px; padding: 8px 0;">${leadData.nome}</td>
                          </tr>
                          <tr style="background-color: #f8f9fa;">
                            <td style="color: #6c757d; font-size: 14px; padding: 8px 0;"><strong>📧 E-mail:</strong></td>
                            <td style="color: #212529; font-size: 14px; padding: 8px 0;">
                              <a href="mailto:${leadData.email}" style="color: #00C896; text-decoration: none;">${leadData.email}</a>
                            </td>
                          </tr>
                          ${leadData.telefone ? `
                          <tr>
                            <td style="color: #6c757d; font-size: 14px; padding: 8px 0;"><strong>📱 Telefone:</strong></td>
                            <td style="color: #212529; font-size: 14px; padding: 8px 0;">
                              <a href="tel:${leadData.telefone}" style="color: #00C896; text-decoration: none;">${leadData.telefone}</a>
                            </td>
                          </tr>
                          ` : ''}
                          ${leadData.assunto ? `
                          <tr style="background-color: #f8f9fa;">
                            <td style="color: #6c757d; font-size: 14px; padding: 8px 0;"><strong>📋 Assunto:</strong></td>
                            <td style="color: #212529; font-size: 14px; padding: 8px 0;">${leadData.assunto}</td>
                          </tr>
                          ` : ''}
                        </table>

                        ${leadData.mensagem ? `
                        <div style="margin-top: 25px; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #00C896; border-radius: 6px;">
                          <p style="margin: 0 0 10px 0; color: #00C896; font-size: 14px; font-weight: bold;">
                            💬 Mensagem:
                          </p>
                          <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.6;">
                            ${leadData.mensagem}
                          </p>
                        </div>
                        ` : ''}
                      </td>
                    </tr>

                    <!-- CTA -->
                    <tr>
                      <td align="center" style="padding: 30px; background-color: #f8f9fa;">
                        <a href="mailto:${leadData.email}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00C896 0%, #00E0A0 100%); color: #0D1B2A; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          ✉️ Responder Lead
                        </a>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td align="center" style="padding: 20px; background-color: #0D1B2A;">
                        <p style="margin: 0; color: #9ba8b5; font-size: 12px;">
                          © 2025 Pontedra - Sistema de Captura de Leads
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    }

    await Promise.all([
      resend.emails.send(emailCliente),
      resend.emails.send(emailEquipe),
    ])
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})