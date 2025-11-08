import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Instagram, Facebook, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLeadCapture } from '@/hooks/useLeadCapture'
import { toast } from 'sonner'

export function Contato() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  
  const { capturarLead, loading } = useLeadCapture()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await capturarLead({
      nome,
      email,
      telefone,
      assunto,
      mensagem,
      origem: 'formulario_contato',
    })

    if (result.success) {
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      
      // Limpar formulário
      setNome('')
      setEmail('')
      setTelefone('')
      setAssunto('')
      setMensagem('')
    } else {
      toast.error('Erro ao enviar mensagem. Tente novamente.')
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
    <section id="contato" className="py-20 bg-[#0D1B2A] relative overflow-hidden">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pontedra-green/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-pontedra-green mb-4">
            CONTATO
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tem um projeto em mente ou quer saber mais sobre como podemos ajudar sua empresa a crescer? Entre em contato!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Informações de Contato */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-pontedra-green mb-6">
                Nossos Contatos
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-pontedra-green/10 flex items-center justify-center group-hover:bg-pontedra-green/20 transition-colors">
                    <Phone className="text-pontedra-green" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Telefone</p>
                    <a href="tel:+5511978777308" className="text-lg text-white hover:text-pontedra-green transition-colors">
                      +55 11 97877-7308
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-pontedra-green/10 flex items-center justify-center group-hover:bg-pontedra-green/20 transition-colors">
                    <Mail className="text-pontedra-green" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">E-mail</p>
                    <a href="mailto:contato@pontedra.com" className="text-lg text-white hover:text-pontedra-green transition-colors">
                      contato@pontedra.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-pontedra-green/10 flex items-center justify-center group-hover:bg-pontedra-green/20 transition-colors">
                    <MapPin className="text-pontedra-green" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Endereço</p>
                    <p className="text-lg text-white">
                      Avenida Vila Ema 4191 - Vila Ema - São Paulo/SP
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-white mb-4">
                Siga-nos nas redes sociais
              </h4>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-pontedra-green/10 flex items-center justify-center hover:bg-pontedra-green hover:scale-110 transition-all"
                >
                  <Instagram className="text-pontedra-green hover:text-white" size={24} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-pontedra-green/10 flex items-center justify-center hover:bg-pontedra-green hover:scale-110 transition-all"
                >
                  <Facebook className="text-pontedra-green hover:text-white" size={24} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Formulário de Contato */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gradient-to-br from-[#111d2e] to-[#0a1420] rounded-2xl p-8 border border-pontedra-border-light">
              <h3 className="text-2xl font-bold text-pontedra-green mb-6">
                Envie sua Mensagem
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-white">
                      Nome *
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      placeholder="Seu nome completo"
                      className="bg-[#0B1420] border-pontedra-border-light text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      className="bg-[#0B1420] border-pontedra-border-light text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-white">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="bg-[#0B1420] border-pontedra-border-light text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assunto" className="text-white">
                      Assunto
                    </Label>
                    <Input
                      id="assunto"
                      type="text"
                      value={assunto}
                      onChange={(e) => setAssunto(e.target.value)}
                      placeholder="Assunto da mensagem"
                      className="bg-[#0B1420] border-pontedra-border-light text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem" className="text-white">
                    Mensagem *
                  </Label>
                  <Textarea
                    id="mensagem"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    required
                    placeholder="Conte-nos sobre seu projeto ou dúvida..."
                    rows={5}
                    className="bg-[#0B1420] border-pontedra-border-light text-white placeholder:text-gray-500 resize-none"
                  />
                </div>

                <p className="text-sm text-gray-400">
                  * Campos obrigatórios. Seu e-mail será usado apenas para resposta.
                </p>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pontedra-green hover:bg-pontedra-green-hover text-pontedra-dark-text font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}