'use client'

import { useState, useMemo } from 'react'
import { Search, FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import DocumentActions from './DocumentActions'
import StatusSelector from './StatusSelector'

export default function DocumentList({ 
  initialDocuments, 
  emptyTitle = "Aucun document",
  emptyDesc = "Créez votre premier document pour commencer.",
  emptyLink = "/admin/documents/create",
  emptyLinkText = "Nouveau document",
  hideStatus = false
}: { 
  initialDocuments: any[],
  emptyTitle?: string,
  emptyDesc?: string,
  emptyLink?: string,
  emptyLinkText?: string,
  hideStatus?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const filteredDocuments = useMemo(() => {
    if (!initialDocuments) return []
    
    return initialDocuments.filter((doc) => {
      // Filter by search term
      const clientName = ((doc.clients as any)?.nom || 'Client Anonyme').toLowerCase()
      const docNum = (doc.numero || '').toLowerCase()
      const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || docNum.includes(searchTerm.toLowerCase())
      
      if (!matchesSearch) return false

      // Filter by start date
      const docDate = new Date(doc.created_at)
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        if (docDate < start) return false
      }

      // Filter by end date
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (docDate > end) return false
      }

      return true
    })
  }, [initialDocuments, searchTerm, startDate, endDate])

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par numéro, client..."
            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col w-1/2 md:w-auto">
            <label className="text-xs text-gray-500 font-medium mb-1 px-1">Du</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex flex-col w-1/2 md:w-auto">
            <label className="text-xs text-gray-500 font-medium mb-1 px-1">Au</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50 font-bold">
                  <th className="px-6 py-4">Numéro</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Client</th>
                  {!hideStatus && <th className="px-6 py-4">Statut</th>}
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-right">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{doc.numero || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${doc.type === 'facture' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'}`}>
                        {doc.type === 'facture' ? 'Facture' : 'Devis'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(doc.clients as any)?.nom || 'Client Anonyme'}
                    </td>
                    {!hideStatus && (
                      <td className="px-6 py-4">
                        <StatusSelector documentId={doc.id} currentStatus={doc.statut} />
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right tabular-nums">
                      {doc.total?.toLocaleString('fr-FR') || '0'} F
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">
                      {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DocumentActions documentId={doc.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{emptyTitle}</h3>
            <p className="text-gray-500 text-sm mb-6">{emptyDesc}</p>
            {emptyLink && (
              <Link href={emptyLink} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors">
                <Plus size={16} /> {emptyLinkText}
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
