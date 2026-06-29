import { createClient } from '@/utils/supabase/server'
import { FileText, Clock, CheckCircle2, DollarSign, CheckSquare } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch some metrics (simulated for now since no data yet, or fetch real if exists)
  const { count: docsCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })

  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  // Calculate total revenue from factures
  const { data: allFactures } = await supabase
    .from('documents')
    .select('total, statut')
    .eq('user_id', user?.id)
    .eq('type', 'facture')

  const paidFactures = allFactures?.filter(doc => doc.statut === 'payée' || doc.statut === 'payé') || []
  const totalRevenue = paidFactures.reduce((sum, doc) => sum + (doc.total || 0), 0)
  const paidFacturesCount = paidFactures.length

  // Calculate Devis stats
  const { data: allDevis } = await supabase
    .from('documents')
    .select('statut')
    .eq('user_id', user?.id)
    .eq('type', 'devis')

  const devisEnAttenteCount = allDevis?.filter(doc => doc.statut === 'brouillon' || doc.statut === 'envoyé' || doc.statut === 'en attente').length || 0
  const devisValideCount = allDevis?.filter(doc => doc.statut === 'validé').length || 0

  // Fetch recent documents
  const { data: recentDocs } = await supabase
    .from('documents')
    .select('*, clients(nom)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bienvenue, 👋</h2>
        <p className="text-gray-500 mt-1">Voici le résumé de votre activité.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Total Documents</p>
              <h3 className="text-2xl font-black text-gray-900 truncate" title={docsCount?.toString() || '0'}>{docsCount || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Devis en attente</p>
              <h3 className="text-2xl font-black text-gray-900 truncate" title={devisEnAttenteCount.toString()}>{devisEnAttenteCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckSquare size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Devis validés</p>
              <h3 className="text-2xl font-black text-gray-900 truncate" title={devisValideCount.toString()}>{devisValideCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Factures payées</p>
              <h3 className="text-2xl font-black text-gray-900 truncate" title={paidFacturesCount.toString()}>{paidFacturesCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Chiffre d'affaires</p>
              <h3 className="text-2xl font-black text-gray-900 truncate" title={`${totalRevenue.toLocaleString('fr-FR')} F`}>
                {new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(totalRevenue)} F
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Documents Récents</h3>
        </div>
        {recentDocs && recentDocs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentDocs.map(doc => (
              <div key={doc.id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${doc.type === 'facture' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {doc.numero || '-'} <span className="text-gray-400 font-normal"> • {(doc.clients as any)?.nom || 'Sans client'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {doc.type === 'facture' ? 'Facture' : 'Devis'} • {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 tabular-nums">{doc.total?.toLocaleString('fr-FR') || '0'} F</p>
                  <Link href={`/admin/documents/${doc.id}`} className="text-xs text-blue-600 font-medium hover:underline mt-1 inline-block">Voir</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 text-sm">
            Aucun document pour le moment.
          </div>
        )}
      </div>
    </div>
  )
}
