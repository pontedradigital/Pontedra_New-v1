import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/dataClient'
import { toast } from 'sonner'

export default function LoadingPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [stepIndex, setStepIndex] = useState(0)
  const [timeProgress, setTimeProgress] = useState(0)
  const [navigated, setNavigated] = useState(false)
  const steps = [
    'Verificando sessão',
    'Carregando perfil',
    'Sincronizando ID do cliente',
    'Carregando preferências',
    'Carregando configurações financeiras',
  ]

  const perfMode = useMemo(() => {
    const rm = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nav = (typeof navigator !== 'undefined' ? navigator : undefined) as (Navigator & { deviceMemory?: number }) | undefined
    const hc = !!nav && typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4
    const dm = !!nav && typeof nav.deviceMemory === 'number' && (nav.deviceMemory as number) <= 4
    return Boolean(rm || hc || dm)
  }, [])

  useEffect(() => {
    const runFast = async () => {
      if (loading) { setStepIndex(0); return }
      if (!user) { navigate('/login', { replace: true }); return }
      try {
        setStepIndex(1)
        const { data: prof } = await db
          .from('profiles')
          .select('id, client_id')
          .eq('id', user.id)
          .maybeSingle()
        if (!prof) {
          await db.from('profiles').upsert({ id: user.id, role: 'client', status: 'ativo', email: user.email ?? null }, { onConflict: 'id' })
        }
        setStepIndex(2)
        const needsId = !prof || !prof.client_id
        if (needsId) {
          try {
            const { data: rpcCode } = await db.rpc('next_client_id')
            if (rpcCode && typeof rpcCode === 'string') {
              await db.from('profiles').update({ client_id: rpcCode }).eq('id', user.id)
            }
          } catch { /* ignore */ }
        }
        void (async () => {
          setStepIndex(3)
          await Promise.allSettled([
            (async () => {
              try {
                const { data } = await db
                  .from('profiles')
                  .select('com_pref_email, com_pref_whatsapp, com_pref_ligacao')
                  .eq('id', user.id)
                  .maybeSingle()
                if (data) {
                  localStorage.setItem(`perfil:prefs:${user.id}`, JSON.stringify({
                    prefEmail: Boolean(data.com_pref_email),
                    prefWhatsapp: Boolean(data.com_pref_whatsapp),
                    prefLigacao: Boolean(data.com_pref_ligacao),
                  }))
                }
              } catch { /* ignore */ }
            })(),
            (async () => {
              try {
                const { data, error } = await db.rpc('get_global_financeiro_configs')
                if (!error) {
                  type Row = { usd_to_brl?: number | null; iof_percentual?: number | null; imposto_percentual?: number | null } | null
                  const row = (Array.isArray(data) ? (data[0] ?? null) : (data as Row))
                  if (row) {
                    localStorage.setItem('financeiro:moeda', JSON.stringify({
                      usdToBrl: row.usd_to_brl ?? undefined,
                      iof: row.iof_percentual ?? undefined,
                    }))
                    localStorage.setItem('financeiro:imposto', JSON.stringify({
                      percentual: row.imposto_percentual ?? undefined,
                    }))
                  }
                }
              } catch { /* ignore */ }
            })(),
          ])
        })()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        toast.error('Falha ao preparar painel: ' + msg)
        navigate('/dashboard', { replace: true })
      }
    }
    runFast()
    return () => void 0
  }, [loading, user, navigate])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeProgress(p => Math.min(p + 2, 100))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const stepProgress = useMemo(() => Math.min(((stepIndex + 1) / steps.length) * 100, 100), [stepIndex, steps.length])
  const progress = Math.max(timeProgress, stepProgress)

  useEffect(() => {
    if (progress >= 100 && !navigated && user) {
      setNavigated(true)
      navigate('/dashboard', { replace: true })
    }
  }, [progress, navigated, navigate, user])

  return (
    <section className="relative min-h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-[#07121a] via-[#0c1624] to-[#0a1520]">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="loading-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#57e389" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loading-grid)" />
        </svg>
      </div>
      <div className="flex-1 px-4 py-16 md:py-24 lg:py-32 flex items-center justify-center">
        <div className="w-full max-w-lg bg-[#0f1f1a]/60 backdrop-blur-sm border border-[#57e389]/30 rounded-2xl shadow-[0_0_30px_rgba(87,227,137,0.15)] p-10 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full blur-2xl ring-2 ring-white/40" />
            <img
              src="/pontedra-logo.webp"
              alt="Pontedra"
              className="h-16 w-auto relative drop-shadow-[0_0_25px_rgba(255,255,255,0.8)] mx-auto"
            />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-6" />
          <p className="text-white text-lg font-semibold">Preparando seu painel...</p>
          <p className="text-[#9ba8b5] mt-2 text-sm">{steps[stepIndex]}</p>
          <div className="mt-6 h-2 w-full bg-[#0b1420] rounded-full overflow-hidden">
            <div
              className="h-2 bg-[#57e389] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </section>
  )
}
