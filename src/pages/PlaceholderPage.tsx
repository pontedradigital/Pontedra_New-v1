import { useAuth } from '@/context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Clock } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function PlaceholderPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">Carregando...</div>
  }

  if (!user) {
    return null
  }

  const getPageName = () => {
    const path = location.pathname.replace('/', '').replace('-', ' ')
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />
      <main className="flex-1 lg:ml-0">
        <div className="p-6">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-slate-300 hover:text-white mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-white">{getPageName()}</h1>
            <p className="text-slate-300">Esta página está sendo desenvolvida</p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="mr-2 h-5 w-5 text-green-400" />
                Página em Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Módulo "{getPageName()}" em Construção
                </h3>
                <p className="text-slate-400 mb-6">
                  Esta funcionalidade será implementada nas próximas fases do desenvolvimento.
                  Por enquanto, você pode navegar pelas outras seções disponíveis.
                </p>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>📅 <strong>Previsão:</strong> Próximas semanas</p>
                  <p>⚡ <strong>Status:</strong> Aguardando desenvolvimento</p>
                  <p>🚀 <strong>Prioridade:</strong> Conforme roteiro definido</p>
                </div>
                <div className="mt-8 space-x-4">
                  <Button onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700">
                    Ir para Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/clientes')} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Ver Clientes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}