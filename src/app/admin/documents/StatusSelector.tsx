'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function StatusSelector({ documentId, currentStatus }: { documentId: string, currentStatus: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('documents')
        .update({ statut: newStatus })
        .eq('id', documentId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      alert('Erreur lors de la mise à jour du statut.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <select
      value={currentStatus || 'brouillon'}
      onChange={handleStatusChange}
      disabled={isUpdating}
      className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-0 cursor-pointer ${
        currentStatus === 'payée' || currentStatus === 'payé' ? 'bg-green-50 text-green-700' :
        currentStatus === 'validé' ? 'bg-teal-50 text-teal-700' :
        currentStatus === 'en attente' ? 'bg-purple-50 text-purple-700' :
        currentStatus === 'envoyé' ? 'bg-orange-50 text-orange-700' :
        currentStatus === 'annulé' ? 'bg-red-50 text-red-700' :
        'bg-gray-100 text-gray-700'
      }`}
    >
      <option value="brouillon">brouillon</option>
      <option value="en attente">en attente</option>
      <option value="envoyé">envoyé</option>
      <option value="validé">validé</option>
      <option value="payée">payée</option>
      <option value="annulé">annulé</option>
    </select>
  )
}
