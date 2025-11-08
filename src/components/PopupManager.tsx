import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePopupControl } from '@/hooks/usePopupControl'
import { LeadCapturePopup } from './LeadCapturePopup'

export function PopupManager() {
  const { shouldShowPopup, popupTipo, exibirPopup, fecharPopup } = usePopupControl()
  const [tempoInicio] = useState(Date.now())
  const popupJaExibido = useRef(false)
  const location = useLocation()

  // Regra 6: Não aparecer nas páginas de Login e Cadastro
  const isPaginaBloqueada = location.pathname.includes('/login') || 
                            location.pathname.includes('/cadastro')

  // Teste manual do pop-up
  useEffect(() => {
    const handleTestPopup = () => {
      console.log('Teste manual: Forçando abertura do pop-up')
      exibirPopup('solucoes', 0)
      popupJaExibido.current = false // Permite reabrir para testes
    }

    window.addEventListener('test-popup', handleTestPopup)
    return () => window.removeEventListener('test-popup', handleTestPopup)
  }, [exibirPopup])

  useEffect(() => {
    if (isPaginaBloqueada || popupJaExibido.current) return

    console.log('PopupManager: Iniciando detecção de pop-up')

    // Regra 2: Exibir após 15 segundos navegando
    const timerTempo = setTimeout(() => {
      if (!popupJaExibido.current && !isPaginaBloqueada) {
        console.log('PopupManager: Exibindo por tempo (15s)')
        const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000)
        exibirPopup('tempo', tempoDecorrido)
        popupJaExibido.current = true
      }
    }, 15000)

    return () => clearTimeout(timerTempo)
  }, [exibirPopup, tempoInicio, isPaginaBloqueada])

  // Regra 1: Exibir quando visualizar seção de Soluções
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
              popupJaExibido.current = true
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

  // Regra 3: Exibir quando tentar sair da página
  useEffect(() => {
    if (isPaginaBloqueada || popupJaExibido.current) return

    console.log('PopupManager: Configurando detecção de saída')

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !popupJaExibido.current && !isPaginaBloqueada) {
        console.log('PopupManager: Mouse saindo do topo! Exibindo pop-up')
        const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000)
        exibirPopup('saida', tempoDecorrido)
        popupJaExibido.current = true
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [exibirPopup, tempoInicio, isPaginaBloqueada])

  // Regra 4: Exibir quando voltar para a página
  useEffect(() => {
    if (isPaginaBloqueada || popupJaExibido.current) return

    console.log('PopupManager: Configurando detecção de retorno')

    const handleVisibilityChange = () => {
      console.log('PopupManager: Mudança de visibilidade:', document.visibilityState)
      
      if (document.visibilityState === 'visible' && !popupJaExibido.current && !isPaginaBloqueada) {
        const visitouAntes = sessionStorage.getItem('pontedra_visitou_antes')
        console.log('PopupManager: Visitou antes?', visitouAntes)
        
        if (visitouAntes === 'true') {
          console.log('PopupManager: Usuário retornou! Exibindo pop-up')
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
  }, [exibirPopup, tempoInicio, isPaginaBloqueada])

  if (!shouldShowPopup || !popupTipo || isPaginaBloqueada) return null

  return (
    <LeadCapturePopup
      isOpen={shouldShowPopup}
      onClose={fecharPopup}
      tipo={popupTipo}
    />
  )
}