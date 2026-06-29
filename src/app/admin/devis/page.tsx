import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import DocumentList from '../documents/DocumentList'

export default async function DevisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: documents } = await supabase
    .from('documents')
    .select('*, clients(nom)')
    .eq('user_id', user?.id)
    .eq('type', 'devis')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Devis</h2>
          <p className="text-gray-500 mt-1">Gérez tous vos devis.</p>
        </div>
      </div>

      <DocumentList 
        initialDocuments={documents || []} 
        emptyTitle="Aucun devis"
        emptyDesc="Créez votre premier devis pour commencer."
        emptyLink="/admin/documents/create?type=devis"
        emptyLinkText="Créer un devis"
      />
    </div>
  )
}
