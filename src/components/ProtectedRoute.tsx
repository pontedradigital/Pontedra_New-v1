import { useAuth } from '@/context/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'
import { ReactNode, useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ('master' | 'client' | 'prospect' | 'colaborador')[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, profile } = useAuth()
  const navigate = useNavigate()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 9000)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    if (timedOut) {
      navigate('/login', { replace: true })
      return null
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/perfil" replace />
  }

  return <>{children}</>
}