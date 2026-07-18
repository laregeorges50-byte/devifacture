import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { AdminSidebarNav } from './AdminSidebarNav'
import { SupportBubble } from './SupportBubble'
import { MobileNav } from './MobileNav'
import { GuidedTour } from '@/components/GuidedTour'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const displayName = user.user_metadata?.full_name || user.email

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex fixed h-full z-10 print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shadow-sm">
              <div className="w-3 h-3 rounded-sm bg-white"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">DeviFacture</span>
          </Link>
        </div>

        <AdminSidebarNav />

        <div className="p-4 border-t border-gray-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Connecté en tant que</p>
            <p className="text-sm text-gray-900 font-medium truncate">{displayName}</p>
          </div>
          <form action={logout}>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors">
              <LogOut size={18} />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen print:ml-0 print:bg-white w-full max-w-full overflow-x-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-8 justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center">
            <MobileNav displayName={displayName} />
            <h1 className="text-xl font-bold text-gray-900 truncate">Administration</h1>
          </div>
          <Link href="/admin/documents/create" id="tour-new-doc" className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
            <span className="hidden sm:inline">+ Nouveau Document</span>
            <span className="sm:hidden">+ Nouveau</span>
          </Link>
        </header>
        
        <GuidedTour userId={user.id} createdAt={user.created_at} />

        <div className="flex-1 p-6 md:p-8 print:p-0">
          {children}
        </div>

        {/* Support Bubble */}
        <SupportBubble />
      </main>
    </div>
  )
}
