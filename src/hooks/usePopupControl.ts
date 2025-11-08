import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
// Removido: import { useLeadCapture } from './useLeadCapture'

type PopupTipo = 'solucoes' | 'tempo' | 'saida' | 'retorno'

export function usePopupControl() {
  const [shouldShowPopup, setShouldShowPopup] = useState(false)
  const [popupTipo, setPopupTipo] = useState<PopupTipo | null>(null)
  // Removido: const { verificarLeadCapturado } = useLeadCapture()

  const getSessionId = () => {
    let sessionId = localStorage.getItem('pontedra_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('pontedra_session_id', sessionId)
    }
    return sessionId
  }

  // Removido: verificarSeDeveExibirLeadCapturado

  const registrarExibicao = async (tipo: PopupTipo, tempoNaPagina?: number) => {
    const sessionId = getSessionId()

    try {
      await supabase.rpc('register_popup_shown', {
        p_session_id: sessionId,
        p_popup_tipo: tipo,
        p_url_exibicao: window.location.href,
        p_tempo_na_pagina: tempoNaPagina || null,
      })

      // Removido sessionStorage.setItem('pontedra_popup_shown', 'true')
      console.log('usePopupControl: Exibição do pop-up registrada com sucesso (analytics).')
    } catch (error) {
      console.error('usePopupControl: Erro ao registrar exibição do popup:', error)
    }
  }

  const exibirPopup = useCallback(async (tipo: PopupTipo, tempoNaPagina?: number) => {
    console.log('usePopupControl: exibirPopup chamado com tipo:', tipo)
    
    // A verificação principal de exibição única por sessão será feita no PopupManager
    // Removido: if (!verificarSeDeveExibirLeadCapturado()) { ... }

    console.log('usePopupControl: Configurando popup para exibição')
    setPopupTipo(tipo)
    setShouldShowPopup(true)
    await registrarExibicao(tipo, tempoNaPagina)
    console.log('usePopupControl: shouldShowPopup=true, popupTipo=', tipo)
  }, [registrarExibicao]) // Removido verificarSeDeveExibirLeadCapturado das dependências

  const fecharPopup = () => {
    console.log('usePopupControl: fecharPopup chamado.')
    setShouldShowPopup(false)
    setPopupTipo(null)
  }

  // Removido o useEffect de isLoginPage daqui, será tratado no PopupManager

  return {
    shouldShowPopup,
    popupTipo,
    exibirPopup,
    fecharPopup,
  }
}