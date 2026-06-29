'use client'

import { useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DocumentActions({ documentId }: { documentId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ? Cette action est irréversible.')) {
      return
    }

    setIsDeleting(true)
    try {
      // Les lignes de document (document_lines) devraient être supprimées en cascade grâce à la configuration de la base de données (ON DELETE CASCADE).
      // Sinon on supprime manuellement d'abord les lignes.
      const { error: linesError } = await supabase
        .from('document_lines')
        .delete()
        .eq('document_id', documentId)

      if (linesError) {
        console.error('Erreur suppression lignes:', linesError)
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du document.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      <Link 
        href={`/admin/documents/edit/${documentId}`}
        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
        title="Modifier"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
      </Link>
      <Link 
        href={`/admin/documents/${documentId}`}
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
        title="Voir / Télécharger"
      >
        <Download size={18} />
      </Link>
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
        title="Supprimer"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}
