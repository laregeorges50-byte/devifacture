import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Icône de validation */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="text-emerald-500 w-10 h-10" strokeWidth={2.5} />
        </div>
        
        {/* Textes */}
        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          Paiement réussi !
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed text-sm">
          Merci pour votre confiance. Votre transaction a été validée avec succès.
        </p>
        
        {/* Carte de résumé (grise claire) */}
        <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-slate-200/80 last:border-0">
            <span className="text-slate-500 font-medium">Crédits ajoutés</span>
            <span className="font-bold text-emerald-600">+50 crédits</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200/80 last:border-0">
            <span className="text-slate-500 font-medium">Montant payé</span>
            <span className="font-bold text-gray-900">5 000 FCFA</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200/80 last:border-0">
            <span className="text-slate-500 font-medium">N° de transaction</span>
            <span className="font-mono font-medium text-slate-700">TX-987654321</span>
          </div>
        </div>
        
        {/* Bouton d'action */}
        <Link 
          href="/admin" 
          className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5"
        >
          Aller à mon tableau de bord
        </Link>
      </div>
    </div>
  )
}
