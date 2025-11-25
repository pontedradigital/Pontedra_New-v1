import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
 

export default function MasterHome() {
  const { profile } = useAuth()
  const fullName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Usuário'
  const idLabel = profile?.client_id ?? profile?.id ?? ''
  const initial = (fullName || 'U').charAt(0).toUpperCase()
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#07121a] via-[#0c1624] to-[#0a1520]">
      <div className="container mx-auto px-4 md:px-8 py-24">
        <Card className="mb-8 bg-[#0f1f1a]/60 backdrop-blur-sm border border-[#57e389]/30 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 bg-slate-800 ring-2 ring-emerald-400/40 shadow-[0_0_30px_rgba(87,227,137,0.25)]">
                <AvatarImage src="/pontedra-logo.webp" alt="Pontedra" className="object-contain p-0.5 saturate-125" />
                <AvatarFallback className="bg-emerald-500 text-white font-bold">{initial}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">{fullName}</h1>
                <p className="text-sm text-emerald-400">{profile?.role ?? 'user'}</p>
                {idLabel && <p className="text-xs text-slate-300">{idLabel}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-[#0f1f1a]/60 backdrop-blur-sm border border-[#57e389]/30 rounded-2xl">
            <CardContent className="p-6 text-[#9ba8b5]">
              Área de dashboard desativada.
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
