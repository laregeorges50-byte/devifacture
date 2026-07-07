'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function VisitTracker() {
  const pathname = usePathname()
  const tracked = useRef<boolean>(false)

  useEffect(() => {
    // Éviter de tracker plusieurs fois sur le même chargement (React Strict Mode)
    if (tracked.current) return
    tracked.current = true

    const trackVisit = async () => {
      try {
        const supabase = createClient()
        // Appelle la fonction RPC pour incrémenter la visite
        await supabase.rpc('increment_page_visit', { page_path: pathname || '/' })
      } catch (err) {
        console.error('Erreur de tracking:', err)
      }
    }

    trackVisit()
  }, [pathname])

  return null // Composant invisible
}
