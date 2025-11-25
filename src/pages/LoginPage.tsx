import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/dataClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import Footer from '@/sections/Footer'
import LandingNavbar from '@/components/LandingNavbar'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, signInWithFacebook, loading } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const perfMode = useMemo(() => {
    const rm = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nav = (typeof navigator !== 'undefined' ? navigator : undefined) as (Navigator & { deviceMemory?: number }) | undefined
    const hc = !!nav && typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4
    const dm = !!nav && typeof nav.deviceMemory === 'number' && (nav.deviceMemory as number) <= 4
    return Boolean(rm || hc || dm)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      try {
        await db.auth.signOut()
      } catch { /* ignore */ }
      try {
        void 0
      } catch { /* ignore */ }
      const withTimeout = async <T,>(p: Promise<T>, ms: number) => {
        return Promise.race<T>([
          p,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
        ])
      }
      const { data, error } = await withTimeout(signIn(formData), 10000)
      if (error) {
        if (error.message.includes('Invalid')) {
          setError('Email ou senha incorretos')
        } else {
          setError('Erro ao fazer login. Tente novamente.')
        }
      } else {
        navigate('/loading')
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'timeout') {
        setError('Falha de conexão com o servidor. Tente novamente.')
      } else {
        setError('Erro de conexão. Verifique sua internet.')
      }
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-[#07121a] via-[#0c1624] to-[#0a1520]">
      <LandingNavbar showCTA={false} mode="backOnly" />
      <div className="flex-1 px-4 py-16 md:py-24 lg:py-32 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="login-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#57e389" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: perfMode ? 12 : 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#57e389] rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -40, 0], opacity: [0.1, 0.6, 0.1], scale: [1, 2, 1] }}
            transition={{ duration: 4 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#57e389]/10 rounded-full"
        style={{ filter: `blur(${perfMode ? 60 : 120}px)` }}
        animate={perfMode ? { opacity: 0.3 } : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: perfMode ? 0.01 : 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00b4ff]/10 rounded-full"
        style={{ filter: `blur(${perfMode ? 60 : 120}px)` }}
        animate={perfMode ? { opacity: 0.3 } : { scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: perfMode ? 0.01 : 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <Card className="w-full max-w-md bg-[#0f1f1a]/60 backdrop-blur-sm border border-[#57e389]/30 rounded-2xl shadow-[0_0_30px_rgba(87,227,137,0.15)]">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl ring-2 ring-white/40" />
              <img
                src="/pontedra-logo.webp"
                alt="Pontedra"
                className="h-20 w-auto relative drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]"
              />
            </div>
            <CardTitle className="text-2xl text-white">Login</CardTitle>
          </div>
          <CardDescription className="text-[#9ba8b5]">Entre com seu e‑mail e senha para acessar sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="mb-4 bg-[#1a2a24] border-[#57e389]/40 text-[#e1e8f0]">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-white">E‑mail</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seuemail@exemplo.com"
                disabled={isLoading}
                className="bg-[#0b1420] border-[#2a3b4b] text-white placeholder:text-[#7b8a99]"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-white">Senha</label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="********"
                disabled={isLoading}
                className="bg-[#0b1420] border-[#2a3b4b] text-white placeholder:text-[#7b8a99]"
                required
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => navigate('/login')} className="text-[#57e389] text-sm hover:text-[#00ffae]">Esqueceu sua senha?</button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#57e389] text-[#0D1B2A] font-bold shadow-lg shadow-[#57e389]/30 hover:shadow-[#57e389]/50 hover:scale-[1.02] transition-all" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'ENTRAR'}
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#2a3b4b]" />
              <span className="text-[#9ba8b5] text-xs">ou</span>
              <div className="h-px flex-1 bg-[#2a3b4b]" />
            </div>
          
          <div className="mt-2 text-center"></div>
        </form>
          <Separator className="my-6 bg-[#2a3b4b]" />
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-full px-4 py-2.5 bg-white text-[#3c4043] border border-[#dadce0] hover:bg-[#f8f9fa] transition-all disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
              <span className="font-medium">Continuar com o Google</span>
            </button>
            <button
              type="button"
              onClick={() => signInWithFacebook()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-full px-4 py-2.5 bg-[#1877F2] text-white hover:bg-[#166FE5] transition-all shadow-md disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" alt="Facebook" className="h-5 w-5" />
              <span className="font-semibold">Continuar com o Facebook</span>
            </button>
          </div>
        </CardContent>
        <CardFooter />
      </Card>
      </div>
      <Footer />
    </section>
  )
}
