'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Settings, Sparkles } from 'lucide-react'

export function AdminSidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/devis', label: 'Devis', icon: FileText },
    { href: '/admin/factures', label: 'Factures', icon: FileText },
    { href: '/admin/plans', label: 'Abonnement', icon: Sparkles },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon
        // Vérification du lien actif. 
        // Pour "/admin", on vérifie l'égalité stricte pour ne pas l'activer sur toutes les sous-pages.
        const isActive = item.href === '/admin' 
          ? pathname === '/admin' 
          : pathname.startsWith(item.href)

        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
              isActive 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
