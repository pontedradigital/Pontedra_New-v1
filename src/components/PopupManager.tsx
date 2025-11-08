import { useEffect, useState, useRef } from 'react'
import { usePopupControl } from '@/hooks/usePopupControl'
import { LeadCapturePopup } from './LeadCapturePopup'

export function PopupManager() {
  const { shouldShowPopup, popupTipo, exibirPopup, fecharPopup } = usePopupControl()
  const [tempoInicio] = useState(Date.now())
  const popupJaExibido = useRef(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Regra 2: Exibir após 15 segundos navegando
  useEffect(() => {
    if (popupJaExibido.current) return

    const timer = setTimeout(() => {
      if (!popupJaExibido.current) {
        const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000)
        exibirPopup('tempo', tempoDecorrido)
        popupJaExibido.current = true
      }
    }, 15000) // 15 segundos

    return () => clearTimeout(timer)
  }, [exibirPopup, tempoInicio])

  // Regra 1: Exibir quando visualizar seção de Soluções
  useEffect(() => {
    if (popupJaExibido.current) return

    const solucoes = document.getElementById('solucoes')
    if (!solucoes) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !popupJaExibido.current) {
            const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000)
            exibirPopup('solucoes', tempoDecorrido)
            popupJaExibido.current = true
          }
        })
      },
      { threshold: 0.5 }
    )

    observerRef.current.observe(solucoes)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [exibirPopup, tempoInicio])

  // Regra 3: Exibir quando tentar fechar a página
  useEffect(() => {
    if (popupJaExibido.current) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!popupJaExibido.current) {
        e.preventDefault()
        const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000)
        exibirPopup('saida', tempoDecorrido)
        popupJaExibido.current = true
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !popupJaExibido.current) {
        const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000)
        exibirPopup('saida', tempoDecorrido)
        popupJaExibido.current = true
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [exibirPopup, tempoInicio])

  // Regra 4: Exibir quando voltar para a página
  useEffect(() => {
    if (popupJaExibido.current) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !popupJaExibido.current) {
        const visitouAntes = sessionStorage.getItem('pontedra_visitou_antes')
        
        if (visitouAntes === 'true') {
          const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000)
          exibirPopup('retorno', tempoDecorrido)
          popupJaExibido.current = true
        } else {
          sessionStorage.setItem('pontedra_visitou_antes', 'true')
        }
      } else if (document.visibilityState === 'hidden') {
        sessionStorage.setItem('pontedra_visitou_antes', 'true')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [exibirPopup, tempoInicio])

  if (!shouldShowPopup || !popupTipo) return null

  return (
    <LeadCapturePopup
      isOpen={shouldShowPopup}
      onClose={fecharPopup}
      tipo={popupTipo}
    />
  )
}