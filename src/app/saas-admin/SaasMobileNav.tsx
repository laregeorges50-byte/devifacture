'use client'

import { useState } from 'react'
import { Menu, X, LogOut, Shield, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/app/login/actions'

export function SaasMobileNav({ displayName }: { displayName: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden flex items-center">
      <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg mr-3">
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-gray-900/80 transition-opacity" onClick={() => setIsOpen(false)}></div>
          <div className="relative flex w-full max-w-[280px] flex-1 flex-col bg-gray-950 text-white shadow-2xl h-full animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
              <Link href="/saas-admin" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center shadow-sm">
                  <Shield size={16} className="text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">SaaS Admin</span>
              </Link>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-gray-400 hover:bg-gray-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <Link 
                href="/saas-admin" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 font-medium transition-colors"
              >
                <LayoutDashboard size={20} className="text-gray-400" />
                Vue d'ensemble
              </Link>
            </nav>

            <div className="p-4 border-t border-gray-800 mt-auto">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Connecté en</p>
                <p className="text-sm text-gray-300 font-medium truncate">{displayName}</p>
              </div>
              <form action={logout}>
                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium transition-colors">
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
