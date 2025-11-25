import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/dataClient'
import type {
  User,
  Session,
  AuthError,
  AuthResponse,
  OAuthResponse,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@/lib/dataClient'

type Profile = {
  id: string
  role: 'prospect' | 'client' | 'master' | 'colaborador'
  first_name?: string | null
  last_name?: string | null
  telefone?: string | null
  email?: string | null
  client_id?: string | null
}

type AuthContextValue = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (data: SignInWithPasswordCredentials) => Promise<AuthResponse>
  signUp: (data: SignUpWithPasswordCredentials) => Promise<AuthResponse>
  signOut: () => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<OAuthResponse>
  signInWithFacebook: () => Promise<OAuthResponse>
  devLogin: (email: string) => void
  devBypassEnabled: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const MASTER_UID = '05a3fbd2-3a83-4011-ae22-89195f0ff9a8'
  const MASTER_EMAIL = 'master1@teste.com'
  const devBypassEnabled = Boolean(import.meta.env.VITE_DEV_LOGIN_BYPASS) && typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const localAuthEnabled = String(import.meta.env.VITE_LOCAL_AUTH ?? '').toLowerCase() === 'true'
  const localUserEmail = String(import.meta.env.VITE_LOCAL_USER_EMAIL ?? 'teste@teste.com').toLowerCase().trim()
  const localUserPassword = String(import.meta.env.VITE_LOCAL_USER_PASSWORD ?? '123456')
  const ATTEMPT_MAX = Number(import.meta.env.VITE_LOCAL_AUTH_MAX_ATTEMPTS ?? 5)
  const ATTEMPT_WINDOW_MS = Number(import.meta.env.VITE_LOCAL_AUTH_WINDOW_MS ?? 120000)
  const queryClient = useQueryClient()

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const { data: { session } } = await db.auth.getSession()
        if (!isMounted) return
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          const { data } = await db
            .from('profiles')
            .select('id, role, first_name, last_name, telefone, email, client_id')
            .eq('id', session.user.id)
            .maybeSingle()
          let p: Profile | null = data ? { ...data } as Profile : null
          if (!p) {
            let nextCode = 'US000001'
            try {
              const { data: rpcCode } = await db.rpc('next_client_id')
              if (rpcCode && typeof rpcCode === 'string') nextCode = rpcCode
            } catch {
              try {
                const { data: rows } = await db
                  .from('profiles')
                  .select('client_id')
                const max = (rows || [])
                  .map(r => typeof r?.client_id === 'string' ? parseInt(String(r.client_id).replace('US', '')) : 0)
                  .filter(n => !isNaN(n))
                  .reduce((m, n) => Math.max(m, n), 0)
                const next = max + 1
                nextCode = `US${String(next).padStart(6, '0')}`
              } catch { void 0 }
            }
            let payload: {
              id: string
              role: 'client'
              status: 'ativo'
              email: string | null
              client_id: string
              first_name?: string | null
              last_name?: string | null
              telefone?: string | null
              company_organization?: string | null
            } = { id: session.user.id, role: 'client', status: 'ativo', email: session.user.email ?? null, client_id: nextCode }
            try {
              const key = `signup:profile:${(session.user.email ?? '').toLowerCase()}`
              const raw = localStorage.getItem(key)
              const sp = raw ? (JSON.parse(raw) as Partial<{
                first_name: string | null
                last_name: string | null
                telefone: string | null
                email: string | null
                company_organization?: string | null
              }>) : null
              if (sp) {
                payload = { ...payload, ...sp }
              }
            } catch { void 0 }
            try {
              const { error } = await db.from('profiles').upsert(payload, { onConflict: 'id' })
              if (error) throw error
              p = { id: session.user.id, role: 'client', first_name: payload.first_name as string | null, last_name: payload.last_name as string | null, telefone: payload.telefone as string | null, email: payload.email as string | null, client_id: nextCode }
              try { localStorage.removeItem(`signup:profile:${(session.user.email ?? '').toLowerCase()}`) } catch { void 0 }
            } catch (e) {
              const msg = String((e as { message?: string }).message ?? '')
              const { company_organization: _co, ...retryPayload } = payload
              if (msg.includes('company_organization') || msg.includes('column')) {
                const { error: errorRetry } = await db.from('profiles').upsert(retryPayload, { onConflict: 'id' })
                if (!errorRetry) {
                  p = { id: session.user.id, role: 'client', first_name: retryPayload.first_name ?? null, last_name: retryPayload.last_name ?? null, telefone: retryPayload.telefone ?? null, email: retryPayload.email ?? session.user.email ?? null, client_id: nextCode }
                  try { localStorage.removeItem(`signup:profile:${(session.user.email ?? '').toLowerCase()}`) } catch { void 0 }
                } else {
                  p = { id: session.user.id, role: 'client', email: session.user.email ?? null }
                }
              } else {
                p = { id: session.user.id, role: 'client', email: session.user.email ?? null }
              }
            }
          } else if (!p.client_id) {
            let nextCode = 'US000001'
            try {
              const { data: rpcCode } = await db.rpc('next_client_id')
              if (rpcCode && typeof rpcCode === 'string') nextCode = rpcCode
            } catch {
              try {
                const { data: rows } = await db
                  .from('profiles')
                  .select('client_id')
                const max = (rows || [])
                  .map(r => typeof r?.client_id === 'string' ? parseInt(String(r.client_id).replace('US', '')) : 0)
                  .filter(n => !isNaN(n))
                  .reduce((m, n) => Math.max(m, n), 0)
                const next = max + 1
                nextCode = `US${String(next).padStart(6, '0')}`
              } catch { void 0 }
            }
            try {
              const { error } = await db
                .from('profiles')
                .update({ client_id: nextCode })
                .eq('id', session.user.id)
              if (!error) p = { ...p, client_id: nextCode }
            } catch { void 0 }
          }
          const isMaster = session.user.id === MASTER_UID || (session.user.email ?? '').toLowerCase() === MASTER_EMAIL
          setProfile(isMaster ? { ...p, role: 'master' } : p)
        } else {
          setProfile(null)
        }
      } catch (_e) {
        if (!isMounted) return
        try { await db.auth.signOut() } catch { void 0 }
        try {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i)
            if (key && key.startsWith('sb-')) {
              localStorage.removeItem(key)
            }
          }
        } catch { void 0 }
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
      } finally {
        if (isMounted) void 0
      }
    }

    init()

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        const isMaster = session.user.id === MASTER_UID || (session.user.email ?? '').toLowerCase() === MASTER_EMAIL
        const minimal: Profile = { id: session.user.id, role: isMaster ? 'master' : 'client', email: session.user.email ?? null }
        setProfile(minimal)
        ;(async () => {
          try {
            const { data } = await db
              .from('profiles')
              .select('id, role, first_name, last_name, telefone, email, client_id')
              .eq('id', session.user.id)
              .maybeSingle()
            if (data) {
              const nextRole = isMaster ? 'master' : (data.role as Profile['role'])
              setProfile(prev => {
                const base = prev ?? { id: data.id, role: nextRole, email: data.email ?? null }
                return { ...base, ...data, role: nextRole }
              })
              try { queryClient.invalidateQueries({ queryKey: ['perfil_prefs', session.user.id] }) } catch { void 0 }
            }
          } catch { /* ignore */ }
        })()
      } else {
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [queryClient])

  useEffect(() => {
    if (!user) return
    const isMaster = user.id === MASTER_UID || (user.email ?? '').toLowerCase() === MASTER_EMAIL
    const channel = db
      .channel(`profiles:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, async (_payload) => {
        try {
          const { data } = await db
            .from('profiles')
            .select('id, role, first_name, last_name, telefone, email, client_id')
            .eq('id', user.id)
            .maybeSingle()
          if (data) {
            const nextRole = isMaster ? 'master' : (data.role as Profile['role'])
            setProfile(prev => {
              const base = prev ?? { id: data.id, role: nextRole, email: data.email ?? null }
              return { ...base, ...data, role: nextRole }
            })
            queryClient.invalidateQueries({ queryKey: ['perfil_prefs', user.id] })
          }
        } catch { void 0 }
      })
      .subscribe()
    return () => {
      try { if (db.removeChannel) { db.removeChannel(channel) } } catch { void 0 }
    }
  }, [user, queryClient])

  const value: AuthContextValue = {
    user,
    session,
    profile,
    loading,
    signIn: async (data) => {
      if (localAuthEnabled) {
        try {
          const now = Date.now()
          const raw = localStorage.getItem('auth:attempts')
          const arr = raw ? (JSON.parse(raw) as number[]) : []
          const recent = arr.filter(ts => now - ts < ATTEMPT_WINDOW_MS)
          if (recent.length >= ATTEMPT_MAX) {
            return { data: { user: null, session: null }, error: { message: 'Muitas tentativas. Tente novamente mais tarde.' } as AuthError } as unknown as AuthResponse
          }
          const email = String(data.email ?? '').toLowerCase().trim()
          const pass = String(data.password ?? '')
          if (email === localUserEmail && pass === localUserPassword) {
            const mockUser = {
              id: 'local-user-1', aud: 'authenticated', role: 'authenticated', email,
              app_metadata: {}, user_metadata: {}, identities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            } as unknown as User
            setUser(mockUser)
            const isMaster = email === MASTER_EMAIL
            const p: Profile = { id: mockUser.id, role: isMaster ? 'master' : 'client', email }
            setProfile(p)
            setSession(null)
            return { data: { user: mockUser, session: null }, error: null } as unknown as AuthResponse
          }
          recent.push(now)
          localStorage.setItem('auth:attempts', JSON.stringify(recent))
          return { data: { user: null, session: null }, error: { message: 'Invalid login' } as AuthError } as unknown as AuthResponse
        } catch {
          return { data: { user: null, session: null }, error: { message: 'Falha ao autenticar' } as AuthError } as unknown as AuthResponse
        }
      }
      return db.auth.signInWithPassword(data)
    },
    signUp: (data) => db.auth.signUp(data),
    signOut: async () => {
      try {
        const result = await db.auth.signOut()
        setUser(null)
        setSession(null)
        setProfile(null)
        try {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i)
            if (key && (key.startsWith('signup:profile:') || key.startsWith('sb-'))) {
              localStorage.removeItem(key)
            }
          }
        } catch { void 0 }
        try {
          queryClient.clear()
        } catch { void 0 }
        return result
      } catch (error) {
        return { error: error as AuthError }
      }
    },
    signInWithGoogle: () => db.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'email profile',
        queryParams: { prompt: 'consent' },
      },
    }),
    signInWithFacebook: () => db.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'email public_profile',
      },
    }),
    devLogin: (email: string) => {
      if (!devBypassEnabled) return
      const mockUser = {
        id: 'dev-user',
        aud: 'authenticated',
        role: 'authenticated',
        email,
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as User
      setUser(mockUser)
      const p: Profile = { id: mockUser.id, role: (email || '').toLowerCase() === MASTER_EMAIL ? 'master' : 'client', email }
      setProfile(p)
      setSession(null)
      setLoading(false)
    },
    devBypassEnabled,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
