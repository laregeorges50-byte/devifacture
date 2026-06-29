import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Shield, Users, LayoutDashboard } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { SaasMobileNav } from './SaasMobileNav'

export default async function SaasAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user || user.email !== 'lare50@gmail.com') {
    redirect('/login')
  }

  const displayName = user.user_metadata?.full_name || user.email

  return (
    <div className="min-h-screen bg-gray-900 text-white flex font-sans selection:bg-purple-600 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col hidden md:flex fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Link href="/saas-admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center shadow-sm">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">SaaS Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/saas-admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 font-medium transition-colors">
            <LayoutDashboard size={18} className="text-gray-400" />
            Vue d'ensemble
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Connecté en tant que</p>
            <p className="text-sm text-gray-300 font-medium truncate">{displayName}</p>
          </div>
          <form action={logout}>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium transition-colors">
              <LogOut size={18} />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-gray-50 text-gray-900 w-full max-w-full overflow-x-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-8 sticky top-0 z-20">
          <SaasMobileNav displayName={displayName} />
          <h1 className="text-xl font-bold text-gray-900 truncate">Espace Propriétaire</h1>
        </header>
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
