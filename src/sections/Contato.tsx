import React, { useEffect, useState } from "react";
import { toast } from 'sonner'
 
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

export const Contato: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [utm, setUtm] = useState<{ source: string; medium: string; campaign: string; content: string; term: string }>({ source: '', medium: '', campaign: '', content: '', term: '' })
  const [referrer, setReferrer] = useState<string>('')

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const next = {
        source: sp.get('utm_source') || '',
        medium: sp.get('utm_medium') || '',
        campaign: sp.get('utm_campaign') || '',
        content: sp.get('utm_content') || '',
        term: sp.get('utm_term') || '',
      }
      setUtm(next)
      setReferrer(document.referrer || '')
    } catch { /* ignore */ }
  }, [])

  const [submitting, setSubmitting] = useState(false)
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nome = name.trim()
    const emailVal = email.trim()
    const tel = phone.trim()
    const assunto = subject.trim()
    const mensagem = message.trim()
    if (!nome || !emailVal || !mensagem) { toast.error('Preencha nome, e‑mail e mensagem'); return }
    if (!isValidEmail(emailVal)) { toast.error('E‑mail inválido'); return }
    setSubmitting(true)
    try {
      const payload = {
        nome,
        email: emailVal,
        telefone: tel || null,
        assunto: assunto || null,
        mensagem,
        origem: 'landing_contato',
        page: 'landing',
        utm_source: utm.source || null,
        utm_medium: utm.medium || null,
        utm_campaign: utm.campaign || null,
        utm_content: utm.content || null,
        utm_term: utm.term || null,
        referrer: referrer || null,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        created_at: new Date().toISOString()
      }
      const endpoint = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CONTACT_ENDPOINT || ''
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        toast.success('Mensagem enviada! Em breve retornaremos.')
      } else {
        const subjectLine = assunto || 'Contato pelo site'
        const body = `${mensagem}\n\nNome: ${nome}\nE-mail: ${emailVal}${tel ? `\nTelefone: ${tel}` : ''}`
        window.location.href = `mailto:contato@pontedra.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`
        toast.success('Abrimos seu e-mail para concluir o envio.')
      }
      setName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
    } catch (err) {
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message?: string }).message || '') : ''
      toast.warning(msg ? `Falha ao enviar: ${msg}` : 'Não foi possível enviar agora. Tente novamente mais tarde.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative w-full py-20 md:py-28 bg-[#0D1B2A]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#00ffae] via-[#57e389] to-[#00b4ff] bg-clip-text text-transparent">CONTATO</h2>
          <p className="text-[#9ba8b5] text-base md:text-lg max-w-2xl mx-auto mt-4">
            Tem um projeto em mente ou quer saber mais sobre como podemos ajudar sua empresa a crescer? Entre em contato!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#57e389]">Nossos Contatos</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#57e389] flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#9ba8b5]">Telefone</p>
                  <a href="tel:+5511978777308" className="text-white font-medium">+55 11 97877-7308</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#57e389] flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#9ba8b5]">E-mail</p>
                  <a href="mailto:contato@pontedra.com" className="text-white font-medium">contato@pontedra.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#57e389] flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#9ba8b5]">Endereço</p>
                  <p className="text-white font-medium">Avenida Vila Ema 4191 - Vila Ema - São Paulo/SP</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-[#9ba8b5] mb-3">Siga-nos nas redes sociais</p>
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/pontedradigital/#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-lg border border-[#1d2c3f] text-[#57e389] hover:bg-[#57e389]/10 transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/pontedradigital/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-lg border border-[#1d2c3f] text-[#57e389] hover:bg-[#57e389]/10 transition">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#0c1624] border border-[#1d2c3f] rounded-2xl p-6 md:p-8 shadow-xl">
            <h3 className="text-xl md:text-2xl font-bold text-[#57e389] mb-6">Envie sua Mensagem</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="contato-nome" className="text-white">Nome*</label>
                <input id="contato-nome" value={name} onChange={(e) => setName(e.target.value)} type="text" className="bg-[#0a1520] border border-[#1d2c3f] rounded-md px-4 py-3 text-white placeholder:text-[#4a5a6a]" placeholder="Seu nome completo" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contato-email" className="text-white">E‑mail*</label>
                <input id="contato-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="bg-[#0a1520] border border-[#1d2c3f] rounded-md px-4 py-3 text-white placeholder:text-[#4a5a6a]" placeholder="seu@email.com" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contato-telefone" className="text-white">Telefone</label>
                <input id="contato-telefone" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} type="tel" className="bg-[#0a1520] border border-[#1d2c3f] rounded-md px-4 py-3 text-white placeholder:text-[#4a5a6a]" placeholder="(11) 99999-9999" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contato-assunto" className="text-white">Assunto</label>
                <input id="contato-assunto" value={subject} onChange={(e) => setSubject(e.target.value)} type="text" className="bg-[#0a1520] border border-[#1d2c3f] rounded-md px-4 py-3 text-white placeholder:text-[#4a5a6a]" placeholder="Assunto da mensagem" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label htmlFor="contato-mensagem" className="text-white">Mensagem*</label>
                <textarea id="contato-mensagem" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="bg-[#0a1520] border border-[#1d2c3f] rounded-md px-4 py-3 text-white placeholder:text-[#4a5a6a]" placeholder="Conte-nos sobre seu projeto ou dúvida..." />
              </div>
              <p className="md:col-span-2 text-xs text-[#9ba8b5]">* Campos obrigatórios. Seu e‑mail será usado apenas para resposta.</p>
              <div className="md:col-span-2 mt-2">
                <button type="submit" disabled={submitting} className="w-full px-6 py-3 bg-[#57e389] text-[#0D1B2A] font-bold rounded-full hover:bg-[#4bc979] disabled:opacity-70 transition-all duration-300">{submitting ? 'Enviando...' : 'Enviar Mensagem'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
