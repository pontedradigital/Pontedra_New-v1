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

      const { data, error: supabaseError } = await supabase.rpc('register_lead_captured', {
        p_session_id: sessionId,
        p_nome: leadData.nome,
        p_email: leadData.email,
        p_telefone: leadData.telefone || null,
        p_origem: leadData.origem,
        p_assunto: leadData.assunto || null,
        p_mensagem: leadData.mensagem || null,
        p_url_captura: trackingData.url_captura,
        p_ip_address: null, // IP address should ideally be captured server-side for accuracy
        p_user_agent: trackingData.user_agent,
        p_utm_source: trackingData.utm_source,
        p_utm_medium: trackingData.utm_medium,
        p_utm_campaign: trackingData.utm_campaign,
        p_referrer: trackingData.referrer,
      })

      if (supabaseError) throw supabaseError

      // Marca que o lead foi capturado
      localStorage.setItem('pontedra_lead_captured', 'true')
      localStorage.setItem('pontedra_lead_email', leadData.email)

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao capturar lead'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const verificarLeadCapturado = () => {
    return localStorage.getItem('pontedra_lead_captured') === 'true'
  }

  return {
    capturarLead,
    verificarLeadCapturado,
    loading,
    error,
  }
}