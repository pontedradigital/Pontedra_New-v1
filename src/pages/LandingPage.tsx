import React, { useEffect, useRef, useState } from "react";
import LandingNavbar from "@/components/LandingNavbar";
import Hero from "@/sections/Hero";
import Footer from "@/sections/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import QuemSomos from "@/components/landing/QuemSomos";
import NossasSolucoes from "@/sections/NossasSolucoes";
import Depoimentos from "@/sections/Depoimentos";
import { Contato } from "@/sections/Contato";
import CookieConsent from "@/components/CookieConsent";
import { toast } from 'sonner'
 

export default function LandingPage() {
  useEffect(() => {
    document.title = "Pontedra • Soluções Web para PMEs e Profissionais";
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const solucoesRef = useRef<HTMLElement>(null); // Ref para a seção "Soluções"
  const [popupOpen, setPopupOpen] = useState(false)
  const [hadHidden, setHadHidden] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '' })
  const [submitting, setSubmitting] = useState(false)
  const [utm, setUtm] = useState<{ source: string; medium: string; campaign: string; content: string; term: string }>({ source: '', medium: '', campaign: '', content: '', term: '' })
  const [referrer, setReferrer] = useState<string>('')
  const popupKey = 'pontedra_landing_popup_seen'

  const showPopupOnce = () => {
    try {
      const seen = localStorage.getItem(popupKey)
      if (seen === '1') return
      localStorage.setItem(popupKey, '1')
      setPopupOpen(true)
    } catch {
      setPopupOpen(true)
    }
  }

  // Este useEffect lida com a rolagem para uma seção se houver um hash na URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const section = document.getElementById(id);
      if (section) {
        const navHeight = 80; // Altura fixa da LandingNavbar
        const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const t = setTimeout(() => showPopupOnce(), 8000)
    const onVis = () => {
      const s = document.visibilityState
      if (s === 'hidden') setHadHidden(true)
      if (s === 'visible' && hadHidden) showPopupOnce()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearTimeout(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [hadHidden])

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
    } catch (e) { console.warn('utm parse failed') }
  }, [])

  const handlePacotesMensaisClick = () => {
    showPopupOnce()
  }

  const closePopup = () => setPopupOpen(false)
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const submitPopup = async (e: React.FormEvent) => {
    e.preventDefault()
    const nome = form.nome.trim()
    const email = form.email.trim()
    const whatsapp = form.whatsapp.trim()
    if (!nome || !email || !whatsapp) { toast.error('Preencha todos os campos'); return }
    if (!isValidEmail(email)) { toast.error('E‑mail inválido'); return }
    setSubmitting(true)
    try {
      const payload = {
        nome,
        email,
        whatsapp,
        source: 'landing_popup',
        page: 'landing',
        utm_source: utm.source || null,
        utm_medium: utm.medium || null,
        utm_campaign: utm.campaign || null,
        utm_content: utm.content || null,
        utm_term: utm.term || null,
        referrer: referrer || null,
        page_url: window.location.href,
        created_at: new Date().toISOString(),
      }
      const endpoint = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_POPUP_ENDPOINT || ''
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        toast.success('Recebemos seus dados. Em breve entraremos em contato!')
      } else {
        try { localStorage.setItem('pontedra_landing_popup_lead', JSON.stringify({ nome, email, whatsapp, utm, referrer, ts: Date.now() })) } catch { void 0 }
        toast.success('Recebemos seus dados. Em breve entraremos em contato!')
      }
      setPopupOpen(false)
    } catch (err) {
      try { localStorage.setItem('pontedra_landing_popup_lead', JSON.stringify({ nome, email, whatsapp, utm, referrer, ts: Date.now() })) } catch { void 0 }
      const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message?: string }).message || '') : ''
      toast.warning(msg ? `Falha ao enviar: ${msg}. Salvamos seus dados localmente.` : 'Não foi possível enviar agora. Salvamos seus dados localmente.')
      setPopupOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="font-sans bg-bgMain text-textPrimary min-h-screen">
      <LandingNavbar />
      <main className="pt-16">
        <section id="hero">
          <Hero />
        </section>

        <section id="quem-somos">
          <QuemSomos />
        </section>

        <section id="solucoes" ref={solucoesRef}> {/* Anexa a ref aqui */}
          <NossasSolucoes onPacotesMensaisClick={handlePacotesMensaisClick} />
        </section>

        <section id="depoimentos">
          <Depoimentos />
        </section>

        

        <section id="contato">
          <Contato />
        </section>
      </main>
      <Footer />
      <CookieConsent />
      {/* Módulos interativos desativados para modo design‑only */}
      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bgMain/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-[#0D1B2A] border border-[#1d2c3f] shadow-2xl">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-white">Avance com um diagnóstico gratuito</h3>
                <button className="text-[#9ba8b5] hover:text-white" onClick={closePopup}>✕</button>
              </div>
              <p className="mt-2 text-[#c8d5e0] text-sm">
                Soluções profissionais de Web, Marketing e Tecnologia para atrair clientes e fortalecer sua comunicação digital. Receba um direcionamento rápido e gratuito para o seu negócio.
              </p>
              <form className="mt-4 space-y-3" onSubmit={submitPopup}>
                <div>
                  <label className="text-sm text-[#c8d5e0]">Nome</label>
                  <input className="mt-1 w-full rounded-md bg-[#111d2e] border border-[#1d2c3f] px-3 py-2 text-white placeholder-[#9ba8b5] focus:outline-none focus:ring-2 focus:ring-emerald-500" value={form.nome} onChange={(e)=>setForm(f=>({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-[#c8d5e0]">E-mail</label>
                  <input type="email" className="mt-1 w-full rounded-md bg-[#111d2e] border border-[#1d2c3f] px-3 py-2 text-white placeholder-[#9ba8b5] focus:outline-none focus:ring-2 focus:ring-emerald-500" value={form.email} onChange={(e)=>setForm(f=>({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-[#c8d5e0]">WhatsApp</label>
                  <input className="mt-1 w-full rounded-md bg-[#111d2e] border border-[#1d2c3f] px-3 py-2 text-white placeholder-[#9ba8b5] focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="(11) 98777-7308" value={form.whatsapp} onChange={(e)=>setForm(f=>({ ...f, whatsapp: e.target.value }))} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-[#57e389] text-[#0D1B2A] font-semibold hover:bg-[#48d47a] disabled:opacity-70">{submitting ? 'Enviando...' : 'Quero meu diagnóstico gratuito'}</button>
                  <button type="button" className="px-4 py-2 rounded-md bg-[#111d2e] border border-[#1d2c3f] text-[#c8d5e0] hover:bg-[#142235]" onClick={closePopup}>Fechar</button>
                </div>
                <div className="text-xs text-[#9ba8b5]">Prometemos uma análise objetiva e sem compromisso. Conte com direcionamento profissional para os próximos passos.</div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
