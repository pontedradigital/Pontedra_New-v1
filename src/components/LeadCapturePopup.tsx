import { useState } from 'react'
import { X, Mail, Phone, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLeadCapture } from '@/hooks/useLeadCapture'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LeadCapturePopupProps {
  isOpen: boolean
  onClose: () => void
  tipo: 'solucoes' | 'tempo' | 'saida' | 'retorno'
}

const mensagensPorTipo = {
  solucoes: {
    titulo: '🎯 Interessado em nossas soluções?',
    subtitulo: 'Deixe seus dados e receba uma consultoria gratuita!',
  },
  tempo: {
    titulo: '👋 Posso te ajudar?',
    subtitulo: 'Vejo que está explorando nosso site. Que tal conversarmos?',
  },
  saida: {
    titulo: '⚠️ Espere! Não vá ainda...',
    subtitulo: 'Antes de sair, deixe seu contato para receber conteúdos exclusivos!',
  },
  retorno: {
    titulo: '😊 Que bom te ver de volta!',
    subtitulo: 'Deixe seus dados e vamos conversar sobre seu projeto.',
  },
}

export function LeadCapturePopup({ isOpen, onClose, tipo }: LeadCapturePopupProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [enviado, setEnviado] = useState(false)
  
  const { capturarLead, loading, error } = useLeadCapture()
  
  const mensagem = mensagensPorTipo[tipo]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const origemMap = {
      solucoes: 'popup_solucoes' as const,
      tempo: 'popup_tempo' as const,
      saida: 'popup_saida' as const,
      retorno: 'popup_retorno' as const,
    }

    const result = await capturarLead({
      nome,
      email,
      telefone,
      origem: origemMap[tipo],
    })

    if (result.success) {
      setEnviado(true)
      setTimeout(() => {
        onClose()
      }, 3000)
    }
  }

  const formatarTelefone = (value: string) => {
    const numero = value.replace(/\D/g, '')
    if (numero.length <= 11) {
      return numero
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return telefone
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a2f42] rounded-2xl shadow-2xl border border-pontedra-border-light p-8 relative overflow-hidden">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-br from-pontedra-green/10 to-transparent pointer-events-none" />

              {/* Botão Fechar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              {enviado ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-pontedra-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Obrigado! 🎉
                  </h3>
                  <p className="text-gray-300">
                    Entraremos em contato em breve!
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {mensagem.titulo}
                    </h2>
                    <p className="text-gray-300">{mensagem.subtitulo}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="popup-nome" className="text-white">
                        Nome completo *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="popup-nome"
                          type="text"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                          placeholder="Seu nome"
                          className="pl-10 bg-[#0B1420] border-pontedra-border-light text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="popup-email" className="text-white">
                        E-mail *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="popup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="seu@email.com"
                          className="pl-10 bg-[#0B1420] border-pontedra-border-light text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="popup-telefone" className="text-white">
                        Telefone *
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="popup-telefone"
                          type="tel"
                          value={telefone}
                          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                          required
                          placeholder="(11) 99999-9999"
                          className="pl-10 bg-[#0B1420] border-pontedra-border-light text-white"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-pontedra-green hover:bg-pontedra-green-hover text-pontedra-dark-text font-semibold py-3 rounded-lg transition-all"
                    >
                      {loading ? 'Enviando...' : 'Quero ser contatado! 🚀'}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}