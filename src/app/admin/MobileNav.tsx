'use client'

import { useState } from 'react'
import { Menu, X, LogOut, LayoutDashboard, FileText, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/login/actions'

export function MobileNav({ displayName }: { displayName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/devis', label: 'Devis', icon: FileText },
    { href: '/admin/factures', label: 'Factures', icon: FileText },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="md:hidden flex items-center">
      <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg mr-3">
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-gray-900/50 transition-opacity" onClick={() => setIsOpen(false)}></div>
          <div className="relative flex w-full max-w-[280px] flex-1 flex-col bg-white shadow-2xl h-full animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
              <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shadow-sm">
                  <div className="w-3 h-3 rounded-sm bg-white"></div>
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">DeviFacture</span>
              </Link>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Connecté en</p>
                <p className="text-sm text-gray-900 font-medium truncate">{displayName}</p>
              </div>
              <form action={logout}>
                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors">
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
