import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import DocumentList from '../documents/DocumentList'

export default async function HistoriquePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: documents } = await supabase
    .from('documents')
    .select('*, clients(nom)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique des Documents</h2>
          <p className="text-gray-500 mt-1">Consultez l'historique complet de tous vos devis et factures.</p>
        </div>
      </div>

      <DocumentList 
        initialDocuments={documents || []} 
        emptyTitle="Aucun document"
        emptyDesc="Créez votre premier document pour commencer l'historique."
        emptyLink=""
      />
    </div>
  )
}
