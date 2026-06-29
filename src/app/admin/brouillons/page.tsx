import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import DocumentList from '../documents/DocumentList'

export default async function BrouillonsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: documents } = await supabase
    .from('documents')
    .select('*, clients(nom)')
    .eq('user_id', user?.id)
    .eq('statut', 'brouillon')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Brouillons</h2>
          <p className="text-gray-500 mt-1">Vos devis et factures en cours de rédaction, non encore finalisés.</p>
        </div>
      </div>

      <DocumentList 
        initialDocuments={documents || []} 
        emptyTitle="Aucun brouillon"
        emptyDesc="Tous vos documents sont finalisés ou envoyés."
        emptyLink=""
        hideStatus={true}
      />
    </div>
  )
}
