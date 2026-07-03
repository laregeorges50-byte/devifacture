import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-gray-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Paiement validé !</h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed text-balance">
          Merci pour votre confiance. Votre transaction a été traitée avec succès et votre compte est maintenant mis à jour. Vous pouvez dès à présent profiter de tous vos avantages.
        </p>

        <Link 
          href="/admin/plans" 
          className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Voir mes nouveaux avantages
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
