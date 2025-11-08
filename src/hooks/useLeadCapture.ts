import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface LeadData {
  nome: string
  email: string
  telefone?: string
  assunto?: string
  mensagem?: string
  origem: 'formulario_contato' | 'popup_solucoes' | 'popup_tempo' | 'popup_saida' | 'popup_retorno'
}

export function useLeadCapture() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSessionId = () => {
    let sessionId = localStorage.getItem('pontedra_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('pontedra_session_id', sessionId)
    }
    return sessionId
  }

  const getTrackingData = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      url_captura: window.location.href,
      user_agent: navigator.userAgent,
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      referrer: document.referrer || undefined,
    }
  }

  const capturarLead = async (leadData: LeadData) => {
    setLoading(true)
    setError(null)

    try {
      const sessionId = getSessionId()
      const trackingData = getTrackingData()

      // 1. Registrar o lead no Supabase Database
      const { data: dbResponse, error: supabaseError } = await supabase.rpc('register_lead_captured', {
        p_session_id: sessionId,
        p_nome: leadData.nome,
        p_email: leadData.email,
        p_telefone: leadData.telefone || undefined, // Alterado de null para undefined
        p_origem: leadData.origem || undefined, // Alterado de null para undefined
        p_assunto: leadData.assunto || undefined, // Alterado de null para undefined
        p_mensagem: leadData.mensagem || undefined, // Alterado de null para undefined
        p_url_captura: trackingData.url_captura || undefined, // Alterado de null para undefined
        p_ip_address: undefined, // Alterado de null para undefined
        p_user_agent: trackingData.user_agent || undefined, // Alterado de null para undefined
        p_utm_source: trackingData.utm_source || undefined, // Alterado de null para undefined
        p_utm_medium: trackingData.utm_medium || undefined, // Alterado de null para undefined
        p_utm_campaign: trackingData.utm_campaign || undefined, // Alterado de null para undefined
        p_referrer: trackingData.referrer || undefined, // Alterado de null para undefined
      })

      if (supabaseError) throw supabaseError

      // 2. Invocar a Edge Function para enviar e-mails
      const { data: emailResponse, error: edgeFunctionError } = await supabase.functions.invoke('send-lead-emails', {
        body: { data: leadData },
      })

      if (edgeFunctionError) throw edgeFunctionError
      if (!emailResponse.success) throw new Error(emailResponse.error || 'Erro ao enviar e-mails pela Edge Function.')

      return { success: true, data: dbResponse }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao capturar lead'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    capturarLead,
    loading,
    error,
  }
}