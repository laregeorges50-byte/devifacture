'use client'

import React from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'

export default function PlansPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-gray-900">Abonnement & Plans</h2>
        <p className="text-gray-500 mt-2 text-lg">Passez au niveau supérieur pour débloquer plus de documents.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        {/* Starter Plan */}
        <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
          <p className="text-sm text-gray-500 mb-6">Pour les petits besoins</p>
          <div className="mb-6">
            <span className="text-4xl font-black text-gray-900">2 000 F</span>
          </div>
          <button className="w-full py-3 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors mb-8 text-sm shadow-sm">
            Souscrire au Starter
          </button>
          <ul className="space-y-4 text-sm text-gray-600 flex-1 w-full text-left">
            <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> 20 documents</li>
            <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> Sans expiration</li>
            <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> Support par email</li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="relative p-8 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-900/20 border border-blue-500 flex flex-col items-center text-center transform lg:-translate-y-4">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap flex items-center gap-1">
              <Sparkles size={12} /> Le plus populaire
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 mt-2">Pro ⭐</h3>
          <p className="text-blue-100 text-sm mb-6">Pour les indépendants</p>
          <div className="mb-6">
            <span className="text-4xl font-black text-white">5 000 F</span>
          </div>
          <button className="w-full py-3 px-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-gray-50 transition-colors mb-8 text-sm shadow-md hover:-translate-y-0.5">
            Souscrire au Pro
          </button>
          <ul className="space-y-4 text-sm text-blue-50 flex-1 w-full text-left">
            <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-300 shrink-0" /> 80 documents</li>
            <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-300 shrink-0" /> Sans expiration</li>
            <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-300 shrink-0" /> Personnalisation avancée</li>
          </ul>
        </div>

        {/* Business Plan */}
        <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Business</h3>
          <p className="text-sm text-gray-500 mb-6">Pour les agences</p>
          <div className="mb-6">
            <span className="text-4xl font-black text-gray-900">10 000 F</span>
          </div>
          <button className="w-full py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors mb-8 text-sm shadow-sm">
            Souscrire au Business
          </button>
          <ul className="space-y-4 text-sm text-gray-600 flex-1 w-full text-left">
            <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-gray-900 shrink-0" /> 200 documents</li>
            <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-gray-900 shrink-0" /> Sans expiration</li>
            <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-gray-900 shrink-0" /> Support prioritaire</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
