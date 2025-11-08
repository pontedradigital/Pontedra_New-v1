import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useLeadCapture } from './useLeadCapture'

type PopupTipo = 'solucoes' | 'tempo' | 'saida' | 'retorno'

export function usePopupControl() {
  const [shouldShowPopup, setShouldShowPopup] = useState(false)
  const [popupTipo, setPopupTipo] = useState<PopupTipo | null>(null)
  const { verificarLeadCapturado } = useLeadCapture()

  const getSessionId = () => {
    let sessionId = localStorage.getItem('pontedra_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('pontedra_session_id', sessionId)
    }
    return sessionId
  }

  const verificarSeDeveExibir = useCallback(async () => {
    // Regra 5: Não exibir se já preencheu formulário de contato
    if (verificarLeadCapturado()) {
      return false
    }

    // Verifica se já foi exibido nesta sessão
    const popupExibido = sessionStorage.getItem('pontedra_popup_shown')
    if (popupExibido === 'true') {
      return false
    }

    // Consulta o backend
    const sessionId = getSessionId()
    const email = localStorage.getItem('pontedra_lead_email')

    const { data, error } = await supabase.rpc('should_show_popup', {
      p_session_id: sessionId,
      p_email: email,
    })

    if (error) {
      console.error('Erro ao verificar popup:', error)
      return false
    }

    return data === true
  }, [verificarLeadCapturado])

  const registrarExibicao = async (tipo: PopupTipo, tempoNaPagina?: number) => {
    const sessionId = getSessionId()

    try {
      await supabase.rpc('register_popup_shown', {
        p_session_id: sessionId,
        p_popup_tipo: tipo,
        p_url_exibicao: window.location.href,
        p_tempo_na_pagina: tempoNaPagina || null,
      })

      sessionStorage.setItem('pontedra_popup_shown', 'true')
    } catch (error) {
      console.error('Erro ao registrar exibição do popup:', error)
    }
  }

  const exibirPopup = useCallback(async (tipo: PopupTipo, tempoNaPagina?: number) => {
    const deveExibir = await verificarSeDeveExibir()
    
    if (deveExibir) {
      setPopupTipo(tipo)
      setShouldShowPopup(true)
      await registrarExibicao(tipo, tempoNaPagina)
    }
  }, [verificarSeDeveExibir])

  const fecharPopup = () => {
    setShouldShowPopup(false)
    setPopupTipo(null)
  }

  // Regra 6: Não aparecer na tela de Login
  useEffect(() => {
    const isLoginPage = window.location.pathname.includes('/login') || 
                       window.location.pathname.includes('/cadastro')
    
    if (isLoginPage) {
      setShouldShowPopup(false)
    }
  }, [])

  return {
    shouldShowPopup,
    popupTipo,
    exibirPopup,
    fecharPopup,
  }
}