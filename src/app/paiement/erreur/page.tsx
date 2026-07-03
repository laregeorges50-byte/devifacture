import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-gray-100">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertCircle className="w-10 h-10 text-orange-600" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Oups, un petit imprévu</h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed text-balance">
          Nous n'avons pas pu finaliser votre transaction cette fois-ci. Ne vous inquiétez pas, aucun montant n'a été débité. Vous pouvez réessayer en toute sécurité.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/admin/plans" 
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <RefreshCcw size={20} />
            Réessayer le paiement
          </Link>
          <Link 
            href="/admin" 
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
          >
            <Home size={20} />
            Plus tard
          </Link>
        </div>
      </div>
    </div>
  );
}
