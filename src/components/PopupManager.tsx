import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePopupControl } from '@/hooks/usePopupControl'
import { LeadCapturePopup } from './LeadCapturePopup'

export function PopupManager() {
  const { shouldShowPopup, popupTipo, exibirPopup, fecharPopup } = usePopupControl()
  const [tempoInicio] = useState(Date.now())
  const popupJaExibido = useRef(false) // Variável em memória para controlar exibição única por sessão
  const location = useLocation()

  // Regra: Não aparecer nas páginas de Login e Cadastro
  const isPaginaBloqueada = location.pathname.includes('/login') || 
                            location.pathname.includes('/cadastro')

  // Teste manual do pop-up (mantido para facilitar o desenvolvimento)
  useEffect(() => {
    const handleTestPopup = () => {
      if (popupJaExibido.current || isPaginaBloqueada) {
        console.log('Teste manual: Pop-up já exibido ou página bloqueada, não forçar abertura.')
        return
      }
      console.log('Teste manual: Forçando abertura do pop-up')
      exibirPopup('solucoes', 0)
      popupJaExibido.current = true // Marca como exibido
    }

    window.addEventListener('test-popup', handleTestPopup)
    return () => window.removeEventListener('test-popup', handleTestPopup)
  }, [exibirPopup, isPaginaBloqueada])

  // Regra: Exibir após 8 segundos navegando
  useEffect(() => {
    if (isPaginaBloqueada || popupJaExibido.current) return

    console.log('PopupManager: Iniciando detecção de pop-up por tempo')

    const timerTempo = setTimeout(() => {
      if (!popupJaExibido.current && !isPaginaBloqueada) {
        console.log('PopupManager: Exibindo por tempo (8s)')
        const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000)
        exibirPopup('tempo', tempoDecorrido)
        popupJaExibido.current = true // Marca como exibido
      }
    }, 8000) // Alterado de 15000ms para 8000ms

    return () => clearTimeout(timerTempo)
  }, [exibirPopup, tempoInicio, isPaginaBloqueada])

  // Regra: Exibir quando visualizar seção de Soluções
  useEffect(() => {
    if (isPaginaBloqueada || popupJaExibido.current) return

    console.log('PopupManager: Configurando observer para #solucoes')

    const checkSolucoes = () => {
      const solucoes = document.getElementById('solucoes')
      if (!solucoes) {
        console.log('PopupManager: Elemento #solucoes não encontrado ainda')
        return
      }

      console.log('PopupManager: Elemento #solucoes encontrado, criando observer')

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !popupJaExibido.current && !isPaginaBloqueada) {
              console.log('PopupManager: Seção #solucoes visível! Exibindo pop-up')
              const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000)
              exibirPopup('solucoes', tempoDecorrido)
              popupJaExibido.current = true // Marca como exibido
              observer.disconnect()
            }
          })
        },
        { threshold: 0.3 }
      )

      observer.observe(solucoes)
      return observer
    }

    // Tenta encontrar o elemento imediatamente
    let observer: IntersectionObserver | undefined = checkSolucoes()

    // Se não encontrou, tenta novamente após um delay
    if (!observer) {
      const checkInterval = setInterval(() => {
        observer = checkSolucoes()
        if (observer) {
          clearInterval(checkInterval)
        }
      }, 500)

      return () => {
        clearInterval(checkInterval)
        if (observer) observer.disconnect()
      }
    }

    return () => {
      if (observer) observer.disconnect()
    }
  }, [exibirPopup, tempoInicio, isPaginaBloqueada, location.pathname])

  // Regra de saída da página (anteriormente Regra 3) - REMOVIDA
  // Regra de retorno à página (anteriormente Regra 4) - REMOVIDA

  if (!shouldShowPopup || !popupTipo || isPaginaBloqueada) return null

  return (
    <LeadCapturePopup
      isOpen={shouldShowPopup}
      onClose={fecharPopup}
      tipo={popupTipo}
    />
  )
}