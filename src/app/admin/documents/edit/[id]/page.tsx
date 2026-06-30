'use client'

import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type LineItem = {
  id: string
  description: string
  quantite: number | string
  prix_unitaire: number | string
  unite: string
  is_title: boolean
}

function evaluateFormula(input: string | number): number {
  if (typeof input === 'number') return input
  const str = String(input).trim()
  if (!str.startsWith('=')) {
    return parseFloat(str) || 0
  }
  const expr = str.slice(1)
  try {
    if (/^[\d\s+\-*/().]+$/.test(expr)) {
      const result = new Function(`return (${expr})`)()
      return typeof result === 'number' && isFinite(result) ? result : 0
    }
    return 0
  } catch {
    return 0
  }
}

function EditDocumentContent({ documentId }: { documentId: string }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [type, setType] = useState<'devis' | 'facture'>('devis')
  const [statut, setStatut] = useState('brouillon')
  
  // Client details
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  
  // Document title / Subject
  const [documentTitle, setDocumentTitle] = useState('')
  
  // Company details
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyRccm, setCompanyRccm] = useState('')
  const [companyNif, setCompanyNif] = useState('')
  const [companyLogo, setCompanyLogo] = useState('')
  const [companySignature, setCompanySignature] = useState('')
  const [companyStamp, setCompanyStamp] = useState('')
  
  const [isSaving, setIsSaving] = useState(false)
  const [numero, setNumero] = useState('')
  const [tvaRate, setTvaRate] = useState(18)
  
  // Auto-save logic
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Dates
  const [dateCreation, setDateCreation] = useState(new Date().toISOString().split('T')[0])
  const [dateValidity, setDateValidity] = useState('')
  
  const [lines, setLines] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: '', quantite: 1, prix_unitaire: '', unite: '', is_title: false }
  ])

  const tableRef = useRef<HTMLTableElement>(null)

  useEffect(() => {
    const loadData = async () => {
      const { data: doc } = await supabase
        .from('documents')
        .select('*, clients(*), document_lines(*)')
        .eq('id', documentId)
        .single()

      if (doc) {
        setType(doc.type)
        setStatut(doc.statut || 'brouillon')
        setNumero(doc.numero)
        if (doc.date_creation) setDateCreation(doc.date_creation)
        if (doc.date_echeance) setDateValidity(doc.date_echeance)

        if (doc.clients) {
          setClientName(doc.clients.nom || '')
          setClientAddress(doc.clients.adresse || '')
          setClientPhone(doc.clients.telephone || '')
          setClientEmail(doc.clients.email || '')
        }

        if (doc.company_metadata) {
          setCompanyName(doc.company_metadata.name || '')
          setCompanyAddress(doc.company_metadata.address || '')
          setCompanyPhone(doc.company_metadata.phone || '')
          setCompanyEmail(doc.company_metadata.email || '')
          setCompanyRccm(doc.company_metadata.rccm || doc.company_metadata.siret || '')
          setCompanyNif(doc.company_metadata.nif || '')
          setCompanyLogo(doc.company_metadata.logo || '')
          setCompanySignature(doc.company_metadata.signature || '')
          setCompanyStamp(doc.company_metadata.stamp || '')
          setDocumentTitle(doc.company_metadata.document_title || '')
        }

        if (doc.document_lines && doc.document_lines.length > 0) {
          setLines(
            doc.document_lines
              .sort((a: any, b: any) => a.position - b.position)
              .map((l: any) => ({
                id: crypto.randomUUID(),
                description: l.description,
                quantite: l.is_title ? '' : l.quantite,
                prix_unitaire: l.is_title ? '' : l.prix_unitaire,
                unite: l.unite || '',
                is_title: l.is_title || false
              }))
          )
        }
        
        setTimeout(() => setIsLoaded(true), 100)
      }
    }
    loadData()
  }, [documentId, supabase])

  const addLine = useCallback(() => {
    setLines(prev => [...prev, { id: crypto.randomUUID(), description: '', quantite: 1, prix_unitaire: '', unite: '', is_title: false }])
  }, [])

  const addTitleLine = useCallback(() => {
    setLines(prev => [...prev, { id: crypto.randomUUID(), description: '', quantite: '', prix_unitaire: '', unite: '', is_title: true }])
  }, [])

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id))
    }
  }

  const updateLine = (id: string, field: keyof LineItem, value: any) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        return { ...l, [field]: value }
      }
      return l
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number, totalCols: number) => {
    const table = tableRef.current
    if (!table) return

    if (e.key === 'Tab' && !e.shiftKey && colIndex === totalCols - 1 && rowIndex === lines.length - 1) {
      e.preventDefault()
      addLine()
      setTimeout(() => {
        const rows = table.querySelectorAll('tbody tr')
        const newRow = rows[rows.length - 1]
        if (newRow) {
          const firstInput = newRow.querySelector('input') as HTMLInputElement
          firstInput?.focus()
        }
      }, 50)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (rowIndex === lines.length - 1) {
        addLine()
        setTimeout(() => {
          const rows = table.querySelectorAll('tbody tr')
          const newRow = rows[rows.length - 1]
          if (newRow) {
            const firstInput = newRow.querySelector('input') as HTMLInputElement
            firstInput?.focus()
          }
        }, 50)
      } else {
        const rows = table.querySelectorAll('tbody tr')
        const nextRow = rows[rowIndex + 1]
        if (nextRow) {
          const inputs = nextRow.querySelectorAll('input')
          const target = inputs[colIndex] as HTMLInputElement
          target?.focus()
        }
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const rows = table.querySelectorAll('tbody tr')
      const nextRow = rows[rowIndex + 1]
      if (nextRow) {
        const inputs = nextRow.querySelectorAll('input')
        const target = inputs[colIndex] as HTMLInputElement
        target?.focus()
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const rows = table.querySelectorAll('tbody tr')
      const prevRow = rows[rowIndex - 1]
      if (prevRow) {
        const inputs = prevRow.querySelectorAll('input')
        const target = inputs[colIndex] as HTMLInputElement
        target?.focus()
      }
    }
  }

  const getLineTotal = (line: LineItem) => {
    if (line.is_title) return 0
    return evaluateFormula(line.quantite) * evaluateFormula(line.prix_unitaire)
  }

  const sousTotal = lines.reduce((acc, line) => acc + getLineTotal(line), 0)
  const tva = sousTotal * (tvaRate / 100)
  const totalTTC = sousTotal + tva

  const stateRef = useRef({
    type, numero, sousTotal, tva, totalTTC, dateCreation, dateValidity,
    companyName, companyAddress, companyPhone, companyEmail, companyRccm, companyNif, companyLogo, companySignature, companyStamp, documentTitle,
    clientName, clientEmail, clientPhone, clientAddress,
    lines, documentId
  });

  useEffect(() => {
    stateRef.current = {
      type, numero, sousTotal, tva, totalTTC, dateCreation, dateValidity,
      companyName, companyAddress, companyPhone, companyEmail, companyRccm, companyNif, companyLogo, companySignature, companyStamp, documentTitle,
      clientName, clientEmail, clientPhone, clientAddress,
      lines, documentId
    };
  }, [type, numero, sousTotal, tva, totalTTC, dateCreation, dateValidity, companyName, companyAddress, companyPhone, companyEmail, companyRccm, companyNif, companyLogo, companySignature, companyStamp, documentTitle, clientName, clientEmail, clientPhone, clientAddress, lines, documentId]);

  useEffect(() => {
    if (!isLoaded || isSaving) return;

    const performAutoSave = async () => {
      setIsAutoSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Non connecté")
        
        const current = stateRef.current;

        const { data: doc } = await supabase.from('documents').select('client_id').eq('id', current.documentId).single()
        
        if (doc?.client_id) {
          await supabase.from('clients').update({
            nom: current.clientName || 'Nouveau client',
            email: current.clientEmail || null,
            telephone: current.clientPhone || null,
            adresse: current.clientAddress || null
          }).eq('id', doc.client_id)
        }

        await supabase.from('documents').update({
          type: current.type,
          numero: current.numero,
          sous_total: current.sousTotal,
          tva: current.tva,
          total: current.totalTTC,
          date_creation: current.dateCreation,
          date_echeance: current.dateValidity || null,
          company_metadata: {
            name: current.companyName,
            address: current.companyAddress,
            phone: current.companyPhone,
            email: current.companyEmail,
            rccm: current.companyRccm,
            nif: current.companyNif,
            siret: null,
            logo: current.companyLogo,
            signature: current.companySignature,
            stamp: current.companyStamp,
            document_title: current.documentTitle
          }
        }).eq('id', current.documentId)

        await supabase.from('document_lines').delete().eq('document_id', current.documentId)

        const linesToInsert = current.lines.filter((l: any) => l.description.trim() !== '').map((l: any, index: number) => ({
          document_id: current.documentId,
          description: l.description,
          quantite: l.is_title ? 0 : evaluateFormula(l.quantite),
          prix_unitaire: l.is_title ? 0 : evaluateFormula(l.prix_unitaire),
          unite: current.type === 'devis' && !l.is_title ? l.unite : '',
          is_title: l.is_title,
          total: l.is_title ? 0 : (evaluateFormula(l.quantite) * evaluateFormula(l.prix_unitaire)),
          position: index
        }))

        if (linesToInsert.length > 0) {
          await supabase.from('document_lines').insert(linesToInsert)
        }

        const now = new Date();
        setLastSavedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      } catch (error) {
        console.error('Erreur auto-save:', error)
      } finally {
        setIsAutoSaving(false);
      }
    };

    const timer = setTimeout(() => {
      performAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    type, numero, sousTotal, tva, totalTTC, dateCreation, dateValidity, 
    companyName, companyAddress, companyPhone, companyEmail, companyRccm, companyNif, companyLogo, companySignature, companyStamp, documentTitle, 
    clientName, clientEmail, clientPhone, clientAddress, 
    JSON.stringify(lines), isLoaded
  ]);

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")

      // Get current doc
      const { data: doc } = await supabase.from('documents').select('client_id').eq('id', documentId).single()
      
      // Update Client
      if (doc?.client_id) {
        await supabase.from('clients').update({
          nom: clientName || '',
          email: clientEmail || null,
          telephone: clientPhone || null,
          adresse: clientAddress || null
        }).eq('id', doc.client_id)
      }

      // Update Document
      await supabase.from('documents').update({
        type,
        numero,
        sous_total: sousTotal,
        tva,
        total: totalTTC,
        date_creation: dateCreation,
        date_echeance: dateValidity || null,
        company_metadata: {
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail,
          rccm: companyRccm,
          nif: companyNif,
          siret: null,
          logo: companyLogo,
          signature: companySignature,
          stamp: companyStamp,
          document_title: documentTitle
        }
      }).eq('id', documentId)

      // Update lines: Delete existing ones, insert new ones
      await supabase.from('document_lines').delete().eq('document_id', documentId)

      const linesToInsert = lines.filter(l => l.description.trim() !== '').map((l, index) => ({
        document_id: documentId,
        description: l.description,
        quantite: l.is_title ? 0 : evaluateFormula(l.quantite),
        prix_unitaire: l.is_title ? 0 : evaluateFormula(l.prix_unitaire),
        unite: type === 'devis' && !l.is_title ? l.unite : '',
        is_title: l.is_title,
        total: getLineTotal(l),
        position: index
      }))

      if (linesToInsert.length > 0) {
        await supabase.from('document_lines').insert(linesToInsert)
      }

      router.push(`/admin/documents/${documentId}`)
      router.refresh()
    } catch (error) {
      console.error('Erreur de sauvegarde:', error)
      alert('Une erreur est survenue lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  const displayValue = (val: string | number): string => {
    if (typeof val === 'number') return val === 0 ? '' : String(val)
    return val
  }

  const isDevis = type === 'devis'
  const selectionClass = isDevis ? 'selection:bg-amber-600 selection:text-white' : 'selection:bg-blue-600 selection:text-white'
  const btnClass = isDevis ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'

  return (
    <div className={`max-w-5xl mx-auto pb-24 font-sans ${selectionClass}`}>
      <Link href={`/admin/documents/${documentId}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Annuler et retourner au document
      </Link>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex shadow-sm">
            <button 
              onClick={() => { setType('devis') }}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${isDevis ? 'bg-amber-50 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Devis
            </button>
            <button 
              onClick={() => { setType('facture') }}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${type === 'facture' ? 'bg-blue-50 text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Facture
            </button>
          </div>
          <span className="text-gray-400 font-semibold text-sm capitalize">{statut} (Modification)</span>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {(isAutoSaving || lastSavedTime) && (
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap hidden sm:inline-block">
                {isAutoSaving ? 'Enregistrement...' : `Brouillon enregistré à ${lastSavedTime}`}
              </span>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 ${btnClass}`}
            >
              <Save size={16} />
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </div>

      {/* EDITOR CANVAS */}
      <div className="bg-white rounded-xl shadow-xl shadow-gray-200/40 border border-gray-200 p-8 sm:p-12 sm:min-h-[1056px] relative">
        
        {/* TOP TITLE */}
        <div className="mb-8">
          <h1 className={`text-4xl font-black uppercase tracking-tight ${isDevis ? 'text-gray-900' : 'text-gray-900'}`}>
            {isDevis ? 'DEVIS' : 'FACTURE'}
          </h1>
        </div>

        {/* TOP LAYOUT (Logo Left, Company Right, Client Right below Company) */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          
          {/* Logo (Left) */}
          <div className="w-full md:w-1/2">
            <Link href="/admin/settings" className="inline-block transition-transform hover:scale-105">
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="max-h-24 object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-blue-500 hover:border-blue-300 transition-colors h-24 w-48 cursor-pointer">
                  <ImageIcon size={28} className="mb-1" />
                  <span className="text-[10px] font-bold">Ajouter un logo dans Paramètres</span>
                </div>
              )}
            </Link>
          </div>

          {/* Company & Client Info (Right) */}
          <div className="w-full md:w-1/2 flex flex-col items-end text-right space-y-8">
            
            {/* Company Info */}
            <Link href="/admin/settings" className="block w-full max-w-sm border border-gray-200 p-4 rounded-md text-left hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer bg-white">
              <div className="text-xs text-gray-400 font-bold mb-1 group-hover:text-blue-500 transition-colors">Vos informations d'entreprise</div>
              {companyName ? (
                <>
                  <h4 className="font-bold text-gray-900 text-base">{companyName}</h4>
                  {companyAddress && <p className="text-sm text-gray-600">{companyAddress}</p>}
                  {companyPhone && <p className="text-sm text-gray-600">{companyPhone}</p>}
                  {companyEmail && <p className="text-sm text-gray-600">{companyEmail}</p>}
                  {companyRccm && <p className="text-xs text-gray-500 font-mono mt-1">RCCM: {companyRccm}</p>}
                  {companyNif && <p className="text-xs text-gray-500 font-mono">NIF: {companyNif}</p>}
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  Cliquez ici pour compléter vos informations (Nom, Adresse, etc.)
                </div>
              )}
            </Link>

            {/* Client Info */}
            <div className="space-y-2 w-full max-w-sm border border-gray-200 p-4 rounded-md text-left bg-gray-50/50">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Destinataire</div>
              <input 
                type="text" 
                placeholder="Nom du client" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full text-base font-bold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              <input 
                type="text" 
                placeholder="Adresse du client" 
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              <input 
                type="email" 
                placeholder="Email du client" 
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              <input 
                type="tel" 
                placeholder="Téléphone du client" 
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>

          </div>
        </div>

        {/* Description du devis (Only for Devis) centered */}
        {isDevis && (
          <div className="w-full flex justify-center mb-10">
            <div className="w-full max-w-2xl border border-gray-200 p-4 rounded-md text-center">
              <input 
                type="text" 
                placeholder="Titre du devis (ex: Devis quantitatif)" 
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full text-xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent text-center"
              />
            </div>
          </div>
        )}

        {/* Numero */}
        <div className="mb-6 flex gap-2 items-center">
            <span className="font-bold text-gray-700">N° :</span>
            <input 
              type="text" 
              value={numero} 
              onChange={(e) => setNumero(e.target.value)} 
              className="w-48 bg-transparent font-bold focus:outline-none text-gray-900 border border-transparent hover:border-gray-300 focus:border-blue-400 focus:bg-white px-2 py-1 rounded transition-all shadow-sm" 
              title="Cliquez pour modifier le numéro"
            />
        </div>

        {/* Spreadsheet-like Table */}
        <div className="w-full overflow-x-auto mb-8 border border-gray-200">
          <table ref={tableRef} className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider font-bold border-b border-gray-200 text-gray-700">
                <th className="px-4 py-3 w-12 text-center border-r border-gray-200">N°</th>
                <th className="px-4 py-3 border-r border-gray-200">Désignation ou Description</th>
                {isDevis && <th className="px-4 py-3 w-20 text-center border-r border-gray-200">U</th>}
                <th className="px-4 py-3 w-24 text-center border-r border-gray-200">Quantité</th>
                <th className="px-4 py-3 w-32 text-center border-r border-gray-200">Prix unitaire</th>
                <th className="px-4 py-3 w-32 text-center">Prix total</th>
                <th className="px-2 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr 
                  key={line.id} 
                  className={`border-b border-gray-200 group ${line.is_title ? 'bg-gray-100 font-bold' : ''}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500 font-medium text-sm border-r border-gray-200">
                    {index + 1}
                  </td>
                  
                  {line.is_title ? (
                    <td colSpan={isDevis ? 5 : 4} className="px-4 py-3">
                      <input 
                        type="text" 
                        value={line.description}
                        onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                        placeholder="Ex: I. Matériel"
                        className="w-full bg-transparent focus:outline-none text-gray-900 font-bold placeholder-gray-400 uppercase text-sm"
                      />
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <input 
                          type="text" 
                          value={line.description}
                          onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index, 0, isDevis ? 4 : 3)}
                          placeholder="Description"
                          className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                        />
                      </td>

                      {isDevis && (
                        <td className="px-4 py-3 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={line.unite}
                            onChange={(e) => updateLine(line.id, 'unite', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index, 1, 4)}
                            placeholder="U"
                            className="w-full bg-transparent focus:outline-none text-center text-gray-900 placeholder-gray-400"
                          />
                        </td>
                      )}

                      <td className="px-4 py-3 border-r border-gray-200">
                        <input 
                          type="text"
                          value={displayValue(line.quantite)}
                          onChange={(e) => updateLine(line.id, 'quantite', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index, isDevis ? 2 : 1, isDevis ? 4 : 3)}
                          placeholder="1"
                          className="w-full bg-transparent focus:outline-none text-center tabular-nums text-gray-900 placeholder-gray-400"
                        />
                      </td>

                      <td className="px-4 py-3 border-r border-gray-200">
                        <input 
                          type="text"
                          value={displayValue(line.prix_unitaire)}
                          onChange={(e) => updateLine(line.id, 'prix_unitaire', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index, isDevis ? 3 : 2, isDevis ? 4 : 3)}
                          placeholder="0"
                          className="w-full bg-transparent focus:outline-none text-center tabular-nums text-gray-900 placeholder-gray-400"
                        />
                      </td>

                      <td className={`px-4 py-3 text-center font-bold tabular-nums text-gray-900`}>
                        {getLineTotal(line).toLocaleString('fr-FR')}
                      </td>
                    </>
                  )}

                  <td className="px-2 py-3 text-center">
                    <button 
                      onClick={() => removeLine(line.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM AREA (Dates, Buttons, Totals, Signatures) */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12">
          
          {/* Left Side: Buttons & Dates */}
          <div className="w-full md:w-1/2 space-y-8 self-end">
            
            {/* Buttons Layout */}
            <div className={`flex items-center gap-3 ${isDevis ? 'justify-start' : 'justify-center w-full'}`}>
              <button 
                onClick={addLine}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Plus size={16} /> Ajouter une ligne
              </button>
              {isDevis && (
                <button 
                  onClick={addTitleLine}
                  className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors ml-4"
                >
                  <Plus size={16} /> Ajouter un Titre
                </button>
              )}
            </div>

            {/* Dates Layout */}
            <div className="flex items-center gap-2 border border-gray-200 p-2 w-max rounded-md">
              <span className="text-gray-500 text-sm font-bold ml-1">Date :</span>
              <input type="date" value={dateCreation} onChange={(e) => setDateCreation(e.target.value)} className="bg-transparent font-medium focus:outline-none text-gray-900 cursor-pointer" />
            </div>
          </div>

          {/* Right Side: Totals & Signature */}
          <div className="w-full md:w-1/2 flex flex-col items-end">
            
            {/* Totals Table */}
            <div className="w-full max-w-xs border border-gray-200 mb-8">
              <div className="flex border-b border-gray-200">
                <div className="w-1/2 p-2 border-r border-gray-200 bg-gray-50 font-bold text-sm">TOTAL HT</div>
                <div className="w-1/2 p-2 text-right tabular-nums text-sm font-medium">{sousTotal.toLocaleString('fr-FR')}</div>
              </div>
              <div className="flex border-b border-gray-200 items-center">
                <div className="w-1/2 p-2 border-r border-gray-200 bg-gray-50 font-bold text-sm flex gap-2 items-center">
                  TVA
                  <select
                    value={tvaRate}
                    onChange={(e) => setTvaRate(Number(e.target.value))}
                    className="text-xs bg-gray-200 px-1 py-0.5 rounded text-gray-700 border-none focus:outline-none cursor-pointer"
                  >
                    <option value={0}>0%</option>
                    <option value={18}>18%</option>
                    <option value={20}>20%</option>
                  </select>
                </div>
                <div className="w-1/2 p-2 text-right tabular-nums text-sm font-medium">{tva.toLocaleString('fr-FR')}</div>
              </div>
              <div className="flex">
                <div className="w-1/2 p-2 border-r border-gray-200 bg-gray-50 font-bold text-sm">TOTAL TTC</div>
                <div className="w-1/2 p-2 text-right tabular-nums text-sm font-bold">{totalTTC.toLocaleString('fr-FR')}</div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="w-full max-w-xs border border-gray-200 p-4 h-32 flex flex-col items-center justify-center ml-auto">
              <div className="text-gray-400 font-medium text-sm mb-2">{isDevis ? 'Signature' : 'Signature ou Cachet'}</div>
              <div className="flex gap-4">
                {companySignature && <img src={companySignature} alt="Signature" className="max-h-16 object-contain" />}
                {companyStamp && !isDevis && <img src={companyStamp} alt="Cachet" className="max-h-16 object-contain" />}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

// @ts-ignore
export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Chargement...</p>
      </div>
    }>
      <EditDocumentContent documentId={resolvedParams.id} />
    </Suspense>
  )
}
