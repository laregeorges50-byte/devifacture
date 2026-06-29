'use client'

import { useState } from 'react'
import { MessageCircle, Mail, Phone, X, MessageSquare } from 'lucide-react'

export function SupportBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-50 print:hidden flex flex-col items-end">
      
      {isOpen && (
        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 mb-4 w-72 origin-bottom-right animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Contacter le support</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Besoin d'aide avec l'application ? Contactez notre équipe d'administration.
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => {
                navigator.clipboard.writeText("support@devifacture.com")
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:text-blue-600">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Email</span>
                  <span className="text-sm font-medium">support@devifacture.com</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded transition-opacity ${isCopied ? 'bg-green-100 text-green-700 opacity-100' : 'opacity-0'}`}>
                Copié !
              </span>
            </button>

            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors group">
              <div className="bg-white p-2 rounded-lg shadow-sm group-hover:text-green-600">
                <MessageSquare size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">WhatsApp</span>
                <span className="text-sm font-medium">Message direct</span>
              </div>
            </a>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all flex items-center group relative"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Contacter l'administrateur
          </span>
        )}
      </button>

    </div>
  )
}
