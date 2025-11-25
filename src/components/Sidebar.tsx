import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { db } from '@/lib/dataClient'
import {
  Home,
  User,
  Users,
  Settings,
  DollarSign,
  Package,
  Briefcase,
  FileText,
  FolderOpen,
  Calendar,
  BarChart3,
  MessageSquare,
  Zap,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

type MenuItem =
  | { path: string; icon: React.ComponentType<{ className?: string }>; label: string }
  | { label: string; icon: React.ComponentType<{ className?: string }>; submenu: { path: string; label: string }[] }

const menuItems: MenuItem[] = [
  { path: '/dashboard', icon: Home, label: 'INÍCIO' },
]

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const { user, signOut, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    setIsMobileOpen(false)
    navigate('/login', { replace: true })
    try {
      await signOut()
    } finally {
      const loginUrl = new URL('/login', window.location.origin).toString()
      setTimeout(() => {
        try {
          window.location.href = loginUrl
        } catch { void 0 }
      }, 50)
    }
  }

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label)
  }

  const isActive = (path: string) => location.pathname === path

  const getUserName = () => {
    if (!user?.email) return 'Usuário'
    const name = user.email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const getProfileNameFromForm = useCallback(() => {
    try {
      const key = `signup:profile:${(user?.email ?? '').toLowerCase()}`
      const raw = key ? localStorage.getItem(key) : null
      if (!raw) return ''
      const parsed = JSON.parse(raw) as { first_name?: string | null; last_name?: string | null }
      const f = (parsed?.first_name ?? '').trim()
      const l = (parsed?.last_name ?? '').trim()
      const full = `${f} ${l}`.trim()
      return full || ''
    } catch { return '' }
  }, [user?.email])

  const fullProfileName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  const formProfileName = getProfileNameFromForm()
  const [resolvedName, setResolvedName] = useState<string>(fullProfileName || formProfileName || '')
  const [resolvedClientId, setResolvedClientId] = useState<string>(profile?.client_id ?? '')

  useEffect(() => {
    const applyLocal = () => {
      const n = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || getProfileNameFromForm() || ''
      const cid = profile?.client_id ?? ''
      setResolvedName(n)
      setResolvedClientId(cid)
    }
    applyLocal()
    const fetchRemote = async () => {
      if (!user?.id) return
      if (resolvedName && resolvedClientId) return
      const { data, error } = await db
        .from('profiles')
        .select('first_name, last_name, client_id')
        .eq('id', user.id)
        .maybeSingle()
      if (error) return
      const n = `${data?.first_name ?? ''} ${data?.last_name ?? ''}`.trim()
      const cid = data?.client_id ?? ''
      setResolvedName(n || resolvedName)
      setResolvedClientId(cid || resolvedClientId)
    }
    fetchRemote()
  }, [profile?.first_name, profile?.last_name, profile?.client_id, user?.id, user?.email, getProfileNameFromForm, resolvedName, resolvedClientId])

  const getUserInitials = () => {
    const name = resolvedName || fullProfileName || formProfileName || 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 border-slate-600"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="text-white" /> : <Menu className="text-white" />}
      </Button>

      

      <aside className="hidden md:block md:sticky md:top-0 md:h-screen md:w-64 md:bg-slate-900 md:text-white md:border-r md:border-slate-700 md:overflow-y-auto custom-scrollbar">
        <div className="px-4 py-0 border-b border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <Avatar className="h-[140px] w-[140px] bg-transparent">
              <AvatarImage
                src="/pontedra-logo.webp"
                alt="Pontedra"
                className="object-contain p-0 brightness-125 contrast-125"
              />
              <AvatarFallback className="bg-emerald-500 text-white font-bold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">{resolvedName || 'Usuário'}</h3>
              <p className="text-xs text-emerald-400">{profile?.role ?? 'user'}</p>
              {resolvedClientId && (
                <p className="text-xs text-slate-400">{resolvedClientId}</p>
              )}
            </div>
          </div>
        </div>

        <nav className="px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <div key={('submenu' in item) ? item.label : item.label}>
              {'submenu' in item ? (
                <div>
                  <Button
                    variant="ghost"
                    className={`w-full justify-between text-left h-auto py-3 px-3 hover:bg-slate-800 ${
                      openSubmenu === item.label ? 'bg-slate-800' : ''
                    }`}
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{item.label}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${
                      openSubmenu === item.label ? 'rotate-180' : ''
                    }`} />
                  </Button>

                  {openSubmenu === item.label && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Button
                          key={subItem.path}
                          variant="ghost"
                          className={`w-full justify-start text-left h-auto py-2 px-3 text-sm hover:bg-slate-800 ${
                            isActive(subItem.path) ? 'bg-emerald-500 text-white' : 'text-slate-300'
                          }`}
                          onClick={() => navigate(subItem.path)}
                        >
                          {subItem.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className={`w-full justify-start h-auto py-3 px-3 hover:bg-slate-800 ${
                    isActive(item.path) ? 'bg-emerald-500 text-white' : 'text-slate-300'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start hover:bg-red-900 text-slate-300 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="text-sm">LOGOUT/SAIR</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
