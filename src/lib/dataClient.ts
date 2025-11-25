const disconnectedError = { message: 'Serviço de dados desconectado' }
const log = (...args: unknown[]) => { try { console.warn('[dataClient]', ...args) } catch { void 0 } }

export type User = {
  id: string
  email: string | null
  aud?: string
  role?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
  identities?: unknown[]
  created_at?: string
  updated_at?: string
}

export type Session = { user: User | null } | null
export type AuthError = { message: string }
export type AuthResponse = { data: { user: User | null; session: Session } | null; error: AuthError | null }
export type OAuthResponse = { data?: unknown; error?: AuthError | null }
export type SignInWithPasswordCredentials = { email: string; password: string }
export type SignUpWithPasswordCredentials = { email: string; password: string }

type Result<T = any> = { data: T | null; error: { message?: string } | null }
type Builder<T = any> = {
  select: (...args: any[]) => Builder<T>
  update: (...args: any[]) => Builder<T>
  upsert: (...args: any[]) => Builder<T>
  insert: (...args: any[]) => Builder<T>
  delete: (...args: any[]) => Builder<T>
  eq: (...args: any[]) => Builder<T>
  in: (...args: any[]) => Builder<T>
  gte: (...args: any[]) => Builder<T>
  lte: (...args: any[]) => Builder<T>
  order: (...args: any[]) => Builder<T>
  limit: (...args: any[]) => Builder<T>
  maybeSingle: () => Promise<Result<T>>
  single: () => Promise<Result<T>>
  then: (resolve: (v: Result<T>) => unknown) => Promise<unknown>
  catch: (reject: (reason: unknown) => unknown) => Promise<unknown>
  finally: (onFinally: () => unknown) => Promise<unknown>
}

const makeQueryBuilder = <T = any>(trace?: { table?: string; ops?: string[] }): Builder<T> => {
  const result: Result<T> = { data: null, error: disconnectedError }
  const builder: Builder<T> = {
    select: () => builder,
    update: () => builder,
    upsert: () => builder,
    insert: () => builder,
    delete: () => builder,
    eq: () => builder,
    in: () => builder,
    gte: () => builder,
    lte: () => builder,
    order: () => builder,
    limit: () => builder,
    maybeSingle: async () => { log('query', trace?.table ?? '-', 'maybeSingle'); return result },
    single: async () => { log('query', trace?.table ?? '-', 'single'); return result },
    then: (resolve) => Promise.resolve(result).then(resolve),
    catch: (reject) => Promise.resolve(result).catch(reject),
    finally: (onFinally) => Promise.resolve(result).finally(onFinally),
  }
  return builder
}

type Client = {
  auth: {
    getSession: () => Promise<{ data: { session: Session | null }; error: { message?: string } | null }>
    getUser: () => Promise<{ data: { user: User | null }; error: { message?: string } | null }>
    signOut: () => Promise<{ error: null }>
    signInWithOAuth: (...args: unknown[]) => Promise<{ error: { message: string } }>
    signInWithPassword: (...args: unknown[]) => Promise<{ data: null; error: { message: string } }>
    signUp: (...args: unknown[]) => Promise<{ data: null; error: { message: string } }>
    onAuthStateChange: (...args: any[]) => { data: { subscription: { unsubscribe: () => void } } }
  }
  from: (table: string) => Builder
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<Result<any>>
  functions: { invoke: (fn: string, args: { body: unknown }) => Promise<Result<any>> }
  channel: (...args: any[]) => { subscribe: () => Promise<{ error: null }>; on: (...a: any[]) => void; send: (...a: any[]) => Promise<{ error: null }>; unsubscribe: () => Promise<{ error: null }> }
  removeChannel?: (c: unknown) => void
}

const disabledClient: Client = {
  auth: {
    getSession: async () => { log('auth', 'getSession'); return { data: { session: null as Session | null }, error: null } },
    getUser: async () => { log('auth', 'getUser'); return { data: { user: null as User | null }, error: null } },
    signOut: async () => { log('auth', 'signOut'); return { error: null } },
    signInWithOAuth: async () => { log('auth', 'signInWithOAuth'); return { error: disconnectedError } },
    signInWithPassword: async () => { log('auth', 'signInWithPassword'); return { data: null, error: disconnectedError } },
    signUp: async () => { log('auth', 'signUp'); return { data: null, error: disconnectedError } },
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => void 0 } } }),
  },
  from: (table: string) => { log('from', table); return makeQueryBuilder<any>({ table, ops: [] }) },
  rpc: async (fn: string, _params?: Record<string, unknown>) => { log('rpc', fn); return { data: null, error: disconnectedError } },
  functions: { invoke: async (fn: string, _args: { body: unknown }) => { log('fn', fn); return { data: null, error: disconnectedError } } },
  channel: () => { log('channel'); return { subscribe: async () => ({ error: null }), on: () => void 0, send: async () => ({ error: null }), unsubscribe: async () => ({ error: null }) } },
  removeChannel: () => void 0,
}

export const db: Client = disabledClient
export const dbPublic: Client = disabledClient

export const oauthSignInGoogle = async () => db.auth.signInWithOAuth({ provider: 'google' })
export const oauthSignInFacebook = async () => db.auth.signInWithOAuth({ provider: 'facebook' })
export const getCurrentUser = async () => { const { data } = await db.auth.getUser(); return data.user }
export const logOut = async () => db.auth.signOut()

export const BLOG_BUCKET = 'blog'
export const PUBLIC_BUCKET = 'public'
