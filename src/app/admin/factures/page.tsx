import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import DocumentList from '../documents/DocumentList'

export default async function FacturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: documents } = await supabase
    .from('documents')
    .select('*, clients(nom)')
    .eq('user_id', user?.id)
    .eq('type', 'facture')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Factures</h2>
          <p className="text-gray-500 mt-1">Gérez toutes vos factures.</p>
        </div>
      </div>

      <DocumentList 
        initialDocuments={documents || []} 
        emptyTitle="Aucune facture"
        emptyDesc="Créez votre première facture pour commencer."
        emptyLink="/admin/documents/create?type=facture"
        emptyLinkText="Créer une facture"
      />
    </div>
  )
}
