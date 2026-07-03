import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in-95 duration-500 border-t-4 border-red-500">
        
        {/* Icône d'erreur */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <XCircle className="text-red-500 w-10 h-10" strokeWidth={2.5} />
        </div>
        
        {/* Textes */}
        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          Oups, le paiement a échoué
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed text-sm">
          Nous n'avons pas pu valider votre transaction. Ne vous inquiétez pas, aucun montant n'a été débité de votre compte. Cela peut être dû à un solde insuffisant ou à un problème de réseau.
        </p>
        
        {/* Boutons d'action */}
        <div className="space-y-3">
          <Link 
            href="/admin/plans" 
            className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5"
          >
            Réessayer le paiement
          </Link>
          <button 
            className="block w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all"
          >
            Contacter le support
          </button>
        </div>
      </div>
    </div>
  )
}
