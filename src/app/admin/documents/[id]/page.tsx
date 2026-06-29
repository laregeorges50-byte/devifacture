import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PrintButton from './PrintButton'

// @ts-ignore
export default async function DocumentViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  const resolvedParams = await params
  const documentId = resolvedParams.id

  const { data: doc, error } = await supabase
    .from('documents')
    .select('*, clients(*), document_lines(*)')
    .eq('id', documentId)
    .single()

  if (error || !doc) {
    return notFound()
  }

  const isDevis = doc.type === 'devis'
  const selectionClass = isDevis ? 'selection:bg-amber-600 selection:text-white' : 'selection:bg-blue-600 selection:text-white'
  const lines = (doc.document_lines || []).sort((a: any, b: any) => a.position - b.position)
  const client = doc.clients || {}
  const company = doc.company_metadata || {}

  return (
    <div className={`max-w-5xl mx-auto pb-24 print:pb-0 font-sans ${selectionClass}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />
      {/* NO PRINT AREA: This section will be hidden when printing */}
      <div className="print:hidden mb-8">
        <Link href="/admin/documents" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour aux documents
        </Link>
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Aperçu du document</h2>
            <p className="text-sm text-gray-500 mt-1">Vous pouvez télécharger le document en PDF.</p>
          </div>
          <button 
            // In a Server Component, we use an inline script trick or a client component for window.print().
            // A simpler way for a server component is to use a small client wrapper, but we'll use onclick string for simplicity.
          />
          <PrintButton />
        </div>
      </div>

      {/* DOCUMENT CANVAS (This is what gets printed) */}
      <div className="bg-white print:shadow-none print:border-none print:rounded-none rounded-xl shadow-xl shadow-gray-200/40 border border-gray-200 p-8 sm:p-12 print:p-8 relative">
        
        {/* TOP LAYOUT */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 print:mb-8">
          
          {/* Company Logo & Info (Left) */}
          <div className="w-full md:w-2/3 flex items-center gap-6">
            {company.logo && (
              <img src={company.logo} alt="Logo" className="max-h-24 object-contain" />
            )}
            <div className={`text-left py-2 ${company.logo ? 'border-l-2 border-gray-100 pl-6' : ''}`}>
              {company.name && <h4 className="font-bold text-gray-900 text-lg mb-1">{company.name}</h4>}
              {company.address && <p className="text-sm text-gray-600">{company.address}</p>}
              {company.phone && <p className="text-sm text-gray-600">{company.phone}</p>}
              {company.email && <p className="text-sm text-gray-600">{company.email}</p>}
              {(company.rccm || company.siret) && <p className="text-xs text-gray-500 font-mono mt-1">RCCM: {company.rccm || company.siret}</p>}
              {company.nif && <p className="text-xs text-gray-500 font-mono">NIF: {company.nif}</p>}
            </div>
          </div>

          {/* Client Info (Right) */}
          <div className="w-full md:w-1/3 flex flex-col items-end text-right">
            <div className="space-y-1 w-full max-w-sm border border-gray-200 p-5 rounded-lg text-left bg-gray-50/30">
              <div className="w-full text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Destinataire</div>
              <div className="w-full text-base font-bold text-gray-900 min-h-[24px]">
                {client.nom}
              </div>
              <div className="w-full text-sm text-gray-600 min-h-[20px]">
                {client.adresse || ''}
              </div>
              <div className="w-full text-sm text-gray-600 min-h-[20px]">
                {client.email || ''}
              </div>
              <div className="w-full text-sm text-gray-600 min-h-[20px]">
                {client.telephone || ''}
              </div>
            </div>
          </div>
        </div>

        {/* Description du devis (Only for Devis) centered */}
        {isDevis && company.document_title && (
          <div className="w-full flex justify-center mb-10 print:mb-6">
            <div className="w-full max-w-2xl border border-gray-200 p-4 rounded-md text-center">
              <div className="w-full text-xl font-bold text-gray-900 text-center">
                {company.document_title}
              </div>
            </div>
          </div>
        )}

        {/* Numero */}
        <div className="mb-6 print:mb-4 flex gap-2 items-center">
            <span className="font-bold text-gray-700">N° :</span>
            <span className="font-bold text-gray-900">{doc.numero}</span>
        </div>

        {/* Spreadsheet-like Table */}
        <div className="w-full overflow-x-auto mb-8 print:mb-4 border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider font-bold border-b border-gray-200 text-gray-700">
                <th className="px-4 py-3 w-12 text-center border-r border-gray-200">N°</th>
                <th className="px-4 py-3 border-r border-gray-200">Désignation ou Description</th>
                {isDevis && <th className="px-4 py-3 w-20 text-center border-r border-gray-200">U</th>}
                <th className="px-4 py-3 w-24 text-center border-r border-gray-200">Quantité</th>
                <th className="px-4 py-3 w-32 text-center border-r border-gray-200">Prix unitaire</th>
                <th className="px-4 py-3 w-32 text-center">Prix total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line: any, index: number) => (
                <tr 
                  key={line.id} 
                  className={`border-b border-gray-200 ${line.is_title ? 'bg-gray-100 font-bold' : ''}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500 font-medium text-sm border-r border-gray-200">
                    {index + 1}
                  </td>
                  
                  {line.is_title ? (
                    <td colSpan={isDevis ? 5 : 4} className="px-4 py-3 font-bold uppercase text-sm text-gray-900">
                      {line.description}
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 border-r border-gray-200 text-gray-900">
                        {line.description}
                      </td>

                      {isDevis && (
                        <td className="px-4 py-3 border-r border-gray-200 text-center text-gray-900">
                          {line.unite || ''}
                        </td>
                      )}

                      <td className="px-4 py-3 border-r border-gray-200 text-center tabular-nums text-gray-900">
                        {line.quantite}
                      </td>

                      <td className="px-4 py-3 border-r border-gray-200 text-center tabular-nums text-gray-900">
                        {line.prix_unitaire}
                      </td>

                      <td className={`px-4 py-3 text-center font-bold tabular-nums text-gray-900`}>
                        {line.total?.toLocaleString('fr-FR')}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM AREA (Dates, Totals, Signatures) */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mt-12 print:mt-6 print:gap-8 print:break-inside-avoid">
          
          {/* Left Side: Dates */}
          <div className="w-full md:w-1/2 flex flex-col justify-end gap-12">
            <div className="flex items-center gap-2 border border-gray-200 p-2 w-max rounded-md">
              <span className="text-gray-500 text-sm font-bold ml-1">Date :</span>
              <span className="font-medium text-gray-900 px-2">
                {new Date(doc.date_creation).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>

          {/* Right Side: Totals & Signature */}
          <div className="w-full md:w-1/2 flex flex-col items-end">
            
            {/* Totals Table */}
            <div className="w-full max-w-xs border border-gray-200 mb-8">
              <div className="flex border-b border-gray-200">
                <div className="w-1/2 p-2 border-r border-gray-200 bg-gray-50 font-bold text-sm">TOTAL HT</div>
                <div className="w-1/2 p-2 text-right tabular-nums text-sm font-medium">{doc.sous_total?.toLocaleString('fr-FR')}</div>
              </div>
              <div className="flex border-b border-gray-200 items-center">
                <div className="w-1/2 p-2 border-r border-gray-200 bg-gray-50 font-bold text-sm">TVA</div>
                <div className="w-1/2 p-2 text-right tabular-nums text-sm font-medium">{doc.tva?.toLocaleString('fr-FR')}</div>
              </div>
              <div className="flex">
                <div className="w-1/2 p-2 border-r border-gray-200 bg-gray-50 font-bold text-sm">TOTAL TTC</div>
                <div className="w-1/2 p-2 text-right tabular-nums text-sm font-bold">{doc.total?.toLocaleString('fr-FR')}</div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="w-full max-w-sm mt-8 flex flex-col items-center">
              <div className="text-gray-900 font-bold text-sm mb-6">{isDevis ? 'Signature' : 'Signature ou Cachet'}</div>
              <div className="flex items-center gap-6">
                {company.signature && <img src={company.signature} alt="Signature" className="max-h-28 max-w-[200px] object-contain" />}
                {company.stamp && !isDevis && <img src={company.stamp} alt="Cachet" className="max-h-28 max-w-[160px] object-contain" />}
              </div>
              {!company.signature && (!company.stamp || isDevis) && (
                <div className="w-48 border-b border-gray-400 border-dashed mt-8"></div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
