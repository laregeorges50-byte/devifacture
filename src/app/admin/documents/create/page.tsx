'use client'

import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, Sparkles, AlertCircle, GripVertical, PlusCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
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

function CreateDocumentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [type, setType] = useState<'devis' | 'facture'>('devis')
  
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
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [userLimit, setUserLimit] = useState(4)
  const [numero, setNumero] = useState('')
  const [tvaRate, setTvaRate] = useState(18)
  
  // Auto-save logic
  const [autoSavedDocId, setAutoSavedDocId] = useState<string | null>(null)
  const [autoSavedClientId, setAutoSavedClientId] = useState<string | null>(null)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  
  // Dates
  const [dateCreation, setDateCreation] = useState(new Date().toISOString().split('T')[0])
  const [dateValidity, setDateValidity] = useState('')
  
  const [lines, setLines] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: '', quantite: 1, prix_unitaire: '', unite: '', is_title: false }
  ])

  // Drag & Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ''); 
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && targetIndex !== null && draggedIndex !== targetIndex) {
      setLines(prev => {
        const newLines = [...prev];
        const draggedItem = newLines[draggedIndex];
        newLines.splice(draggedIndex, 1);
        newLines.splice(targetIndex, 0, draggedItem);
        return newLines;
      });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const tableRef = useRef<HTMLTableElement>(null)

  useEffect(() => {
    const typeParam = searchParams.get('type')
    const initialType = typeParam === 'facture' || typeParam === 'devis' ? typeParam : 'devis'
    setType(initialType)
    setNumero(initialType === 'facture' ? `FAC-${new Date().getFullYear()}-001` : `DEV-${new Date().getFullYear()}-001`)

    const loadCompanyInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCompanyName(user.user_metadata?.company_name || '')
        setCompanyAddress(user.user_metadata?.company_address || '')
        setCompanyPhone(user.user_metadata?.company_phone || '')
        setCompanyEmail(user.user_metadata?.company_email || user.email || '')
        setCompanyRccm(user.user_metadata?.company_rccm || user.user_metadata?.company_siret || '')
        setCompanyNif(user.user_metadata?.company_nif || '')
        if (user.user_metadata?.default_tva) {
          setTvaRate(Number(user.user_metadata.default_tva))
        }

        // Fetch large image data from the separate table
        const { data: settings } = await supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()
          
        if (settings) {
          setCompanyLogo(settings.company_logo || '')
          setCompanySignature(settings.company_signature || '')
          setCompanyStamp(settings.company_stamp || '')
        }
      }
    }
    loadCompanyInfo()
  }, [searchParams])

  const addLine = useCallback(() => {
    setLines(prev => [...prev, { id: crypto.randomUUID(), description: '', quantite: 1, prix_unitaire: '', unite: '', is_title: false }])
  }, [])

  const addTitleLine = useCallback(() => {
    setLines(prev => [...prev, { id: crypto.randomUUID(), description: '', quantite: '', prix_unitaire: '', unite: '', is_title: true }])
  }, [])

  const insertLineBelow = (index: number) => {
    const newLine = {
      id: crypto.randomUUID(),
      description: '',
      quantite: '1',
      prix_unitaire: '0',
      unite: '',
      is_title: false
    }
    setLines(prev => {
      const newLines = [...prev];
      newLines.splice(index + 1, 0, newLine);
      return newLines;
    });
  }

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
    lines, autoSavedDocId, autoSavedClientId
  });

  useEffect(() => {
    stateRef.current = {
      type, numero, sousTotal, tva, totalTTC, dateCreation, dateValidity,
      companyName, companyAddress, companyPhone, companyEmail, companyRccm, companyNif, companyLogo, companySignature, companyStamp, documentTitle,
      clientName, clientEmail, clientPhone, clientAddress,
      lines, autoSavedDocId, autoSavedClientId
    };
  }, [type, numero, sousTotal, tva, totalTTC, dateCreation, dateValidity, companyName, companyAddress, companyPhone, companyEmail, companyRccm, companyNif, companyLogo, companySignature, companyStamp, documentTitle, clientName, clientEmail, clientPhone, clientAddress, lines, autoSavedDocId, autoSavedClientId]);

  useEffect(() => {
    const hasContent = clientName.trim() !== '' || lines.some(l => l.description.trim() !== '') || documentTitle.trim() !== '';
    if (!hasContent || showLimitModal || isSaving) return;

    const performAutoSave = async () => {
      setIsAutoSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Non connecté")
        
        const current = stateRef.current;

        // Limit checking
        if (!current.autoSavedDocId) {
          const limit = user.user_metadata?.document_limit !== undefined ? parseInt(user.user_metadata.document_limit) : 4
          const historicalCount = user.user_metadata?.created_docs_count !== undefined ? parseInt(user.user_metadata.created_docs_count) : 0
          const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
          
          const totalUsed = Math.max(historicalCount, count || 0)

          if (totalUsed >= limit) {
            setUserLimit(limit)
            setShowLimitModal(true)
            setIsAutoSaving(false)
            return
          }
        }

        let clientId = current.autoSavedClientId;
        if (!clientId) {
          const { data: client, error: clientError } = await supabase.from('clients').insert({
            user_id: user.id,
            nom: current.clientName || 'Nouveau client',
            email: current.clientEmail || null,
            telephone: current.clientPhone || null,
            adresse: current.clientAddress || null
          }).select().single()
          if (clientError) throw clientError
          clientId = client.id;
          setAutoSavedClientId(client.id);
        } else {
          await supabase.from('clients').update({
            nom: current.clientName || 'Nouveau client',
            email: current.clientEmail || null,
            telephone: current.clientPhone || null,
            adresse: current.clientAddress || null
          }).eq('id', clientId)
        }

        let docId = current.autoSavedDocId;
        if (!docId) {
          const { data: doc, error: docError } = await supabase.from('documents').insert({
            user_id: user.id,
            client_id: clientId,
            type: current.type,
            numero: current.numero,
            sous_total: current.sousTotal,
            tva: current.tva,
            total: current.totalTTC,
            statut: 'brouillon',
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
          }).select().single()
          if (docError) throw docError
          docId = doc.id;
          setAutoSavedDocId(doc.id);

          const historicalCount = user.user_metadata?.created_docs_count !== undefined ? parseInt(user.user_metadata.created_docs_count) : 0
          const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
          const totalUsed = Math.max(historicalCount, count || 0)
          await supabase.auth.updateUser({
            data: { created_docs_count: totalUsed + 1 }
          })
        } else {
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
          }).eq('id', docId)
        }

        if (current.autoSavedDocId) {
          await supabase.from('document_lines').delete().eq('document_id', docId)
        }

        const linesToInsert = current.lines.filter((l: any) => l.description.trim() !== '').map((l: any, index: number) => ({
          document_id: docId,
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
    JSON.stringify(lines)
  ]);

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")

      let docId = autoSavedDocId;

      if (!docId) {
        // Document has not been auto-saved yet, full creation logic
        const limit = user.user_metadata?.document_limit !== undefined ? parseInt(user.user_metadata.document_limit) : 4
        const historicalCount = user.user_metadata?.created_docs_count !== undefined ? parseInt(user.user_metadata.created_docs_count) : 0
        const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        
        const totalUsed = Math.max(historicalCount, count || 0)

        if (totalUsed >= limit) {
          setUserLimit(limit)
          setShowLimitModal(true)
          setIsSaving(false)
          return
        }

        const { data: client, error: clientError } = await supabase.from('clients').insert({
          user_id: user.id,
          nom: clientName || 'Nouveau client',
          email: clientEmail || null,
          telephone: clientPhone || null,
          adresse: clientAddress || null
        }).select().single()

        if (clientError) throw clientError

        const { data: doc, error: docError } = await supabase.from('documents').insert({
          user_id: user.id,
          client_id: client.id,
          type,
          numero,
          sous_total: sousTotal,
          tva,
          total: totalTTC,
          statut: 'brouillon',
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
        }).select().single()

        if (docError) throw docError
        docId = doc.id;

        const linesToInsert = lines.filter(l => l.description.trim() !== '').map((l, index) => ({
          document_id: doc.id,
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

        // Mettre à jour le compteur
        await supabase.auth.updateUser({
          data: { created_docs_count: totalUsed + 1 }
        })

      } else {
        // Document already auto-saved, just do one final update
        await supabase.from('clients').update({
          nom: clientName || 'Nouveau client',
          email: clientEmail || null,
          telephone: clientPhone || null,
          adresse: clientAddress || null
        }).eq('id', autoSavedClientId)

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
        }).eq('id', docId)

        await supabase.from('document_lines').delete().eq('document_id', docId)

        const linesToInsert = lines.filter(l => l.description.trim() !== '').map((l, index) => ({
          document_id: docId,
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
      }

      router.push(`/admin/documents/${docId}`)
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
      <Link href="/admin/documents" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour aux documents
      </Link>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex shadow-sm">
            <button 
              onClick={() => { setType('devis'); setNumero(`DEV-${new Date().getFullYear()}-001`) }}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${isDevis ? 'bg-amber-50 text-amber-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Devis
            </button>
            <button 
              onClick={() => { setType('facture'); setNumero(`FAC-${new Date().getFullYear()}-001`) }}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${type === 'facture' ? 'bg-blue-50 text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Facture
            </button>
          </div>
          <span className="text-gray-400 font-semibold text-sm">Brouillon</span>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            Modifier l'entreprise
          </Link>
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
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      {/* EDITOR CANVAS */}
      <div className="bg-white rounded-xl shadow-2xl shadow-gray-300/40 p-8 sm:p-14 sm:min-h-[1100px] relative">
        
        {/* TOP TITLE */}
        <div className="mb-10">
          <h1 className={`text-5xl font-black uppercase tracking-tight ${isDevis ? 'text-gray-900' : 'text-gray-900'}`}>
            {isDevis ? 'DEVIS' : 'FACTURE'}
          </h1>
        </div>

        {/* TOP LAYOUT (Logo Left, Company Right, Client Right below Company) */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-14">
          
          {/* Logo (Left) */}
          <div className="w-full md:w-1/2">
            <Link href="/admin/settings" className="inline-block transition-transform hover:scale-105 group">
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="max-h-28 object-contain drop-shadow-sm" />
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-slate-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-300 transition-all h-32 w-56 cursor-pointer">
                  <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <ImageIcon size={24} />
                  </div>
                  <span className="text-xs font-bold">Ajouter un logo</span>
                </div>
              )}
            </Link>
          </div>

          {/* Company & Client Info (Right) */}
          <div className="w-full md:w-1/2 flex flex-col items-end text-right space-y-6">
            
            {/* Company Info */}
            <Link href="/admin/settings" className="block w-full max-w-sm border border-transparent p-4 rounded-xl text-left hover:bg-slate-50 hover:border-slate-200 transition-all group cursor-pointer">
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2 group-hover:text-blue-500 transition-colors">Émetteur</div>
              {companyName ? (
                <div className="space-y-1">
                  <h4 className="font-black text-gray-900 text-lg">{companyName}</h4>
                  {companyAddress && <p className="text-sm text-gray-600">{companyAddress}</p>}
                  {companyPhone && <p className="text-sm text-gray-600">{companyPhone}</p>}
                  {companyEmail && <p className="text-sm text-gray-600">{companyEmail}</p>}
                  <div className="pt-2 flex gap-3 flex-wrap">
                    {companyRccm && <p className="text-[10px] text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">RCCM: {companyRccm}</p>}
                    {companyNif && <p className="text-[10px] text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">NIF: {companyNif}</p>}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  {companyEmail && <p className="not-italic font-medium text-gray-800">{companyEmail}</p>}
                  Cliquez ici pour compléter vos informations
                </div>
              )}
            </Link>

            {/* Client Info */}
            <div className="w-full max-w-sm p-4 rounded-xl text-left hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Destinataire</div>
              <div className="space-y-1">
                <input 
                  type="text" 
                  placeholder="Koffi Mensah" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full text-lg font-black text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent hover:bg-white focus:bg-white px-2 py-1 -ml-2 rounded transition-all focus:ring-2 focus:ring-blue-100"
                />
                <input 
                  type="text" 
                  placeholder="Lomé, Togo" 
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full text-sm text-gray-600 placeholder-gray-300 focus:outline-none bg-transparent hover:bg-white focus:bg-white px-2 py-1 -ml-2 rounded transition-all focus:ring-2 focus:ring-blue-100"
                />
                <input 
                  type="email" 
                  placeholder="Adresse email" 
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full text-sm text-gray-600 placeholder-gray-300 focus:outline-none bg-transparent hover:bg-white focus:bg-white px-2 py-1 -ml-2 rounded transition-all focus:ring-2 focus:ring-blue-100"
                />
                <input 
                  type="tel" 
                  placeholder="+228 XX XX XX XX" 
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full text-sm text-gray-600 placeholder-gray-300 focus:outline-none bg-transparent hover:bg-white focus:bg-white px-2 py-1 -ml-2 rounded transition-all focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Description du devis (Only for Devis) centered */}
        {isDevis && (
          <div className="w-full flex justify-center mb-12">
            <div className="w-full max-w-2xl text-center group">
              <input 
                type="text" 
                placeholder="Devis quantitatif & estimatif" 
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full text-xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent text-center border-b-2 border-transparent hover:border-gray-200 focus:border-blue-400 pb-2 transition-all"
              />
            </div>
          </div>
        )}

        {/* Numero */}
        <div className="mb-4 flex gap-3 items-center px-2">
            <span className="font-bold text-gray-400 text-sm tracking-wider uppercase">N°</span>
            <input 
              type="text" 
              value={numero} 
              onChange={(e) => setNumero(e.target.value)} 
              className="w-48 bg-transparent font-black text-lg focus:outline-none text-gray-900 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-400 pb-1 transition-all" 
              title="Cliquez pour modifier le numéro"
            />
        </div>

        {/* Spreadsheet-like Table */}
        <div className="w-full overflow-x-auto mb-10">
          <table ref={tableRef} className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y-2 border-gray-900 text-[11px] uppercase tracking-widest font-black text-gray-900">
                <th className="px-4 py-4 w-12 text-center">N°</th>
                <th className="px-4 py-4">Désignation</th>
                {isDevis && <th className="px-4 py-4 w-20 text-center">U</th>}
                <th className="px-4 py-4 w-24 text-center">Qté</th>
                <th className="px-4 py-4 w-32 text-center">Prix U.</th>
                <th className="px-4 py-4 w-32 text-right">Total</th>
                <th className="px-2 py-4 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr 
                  key={line.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`border-b border-gray-100 group transition-all duration-200 
                    ${line.is_title ? 'bg-slate-50/50' : 'hover:bg-slate-50'}
                    ${draggedIndex === index ? 'opacity-40 scale-[0.99] bg-blue-50/50 shadow-inner' : ''}
                    ${dragOverIndex === index && draggedIndex !== index ? (draggedIndex! > index ? 'border-t-2 border-t-blue-500' : 'border-b-2 border-b-blue-500') : ''}
                  `}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-center">
                      <div className="cursor-grab hover:text-blue-500 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 active:cursor-grabbing" title="Déplacer la ligne">
                        <GripVertical size={16} />
                      </div>
                      <span className="text-gray-400 font-medium text-sm w-4 text-center">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  
                  {line.is_title ? (
                    <td colSpan={isDevis ? 5 : 4} className="px-4 py-3">
                      <input 
                        type="text" 
                        value={line.description}
                        onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                        placeholder="Ex: I. Matériel"
                        className="w-full bg-transparent focus:outline-none text-gray-900 font-black placeholder-gray-300 uppercase text-sm px-2 py-1 -ml-2 rounded hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={line.description}
                          onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index, 0, isDevis ? 4 : 3)}
                          placeholder="Description de l'article"
                          className="w-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-300 px-2 py-1 -ml-2 rounded hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </td>

                      {isDevis && (
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            value={line.unite}
                            onChange={(e) => updateLine(line.id, 'unite', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index, 1, 4)}
                            placeholder="U"
                            className="w-full bg-transparent focus:outline-none text-center text-gray-900 placeholder-gray-300 px-2 py-1 rounded hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </td>
                      )}

                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          value={displayValue(line.quantite)}
                          onChange={(e) => updateLine(line.id, 'quantite', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index, isDevis ? 2 : 1, isDevis ? 4 : 3)}
                          placeholder="1"
                          className="w-full bg-transparent focus:outline-none text-center tabular-nums font-medium text-gray-900 placeholder-gray-300 px-2 py-1 rounded hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          value={displayValue(line.prix_unitaire)}
                          onChange={(e) => updateLine(line.id, 'prix_unitaire', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index, isDevis ? 3 : 2, isDevis ? 4 : 3)}
                          placeholder="0"
                          className="w-full bg-transparent focus:outline-none text-center tabular-nums font-medium text-gray-900 placeholder-gray-300 px-2 py-1 rounded hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </td>

                      <td className={`px-4 py-3 text-right font-bold tabular-nums text-gray-900`}>
                        {getLineTotal(line) > 0 ? getLineTotal(line).toLocaleString('fr-FR') : ''}
                      </td>
                    </>
                  )}

                  <td className="px-2 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => insertLineBelow(index)}
                        title="Insérer une ligne en dessous"
                        className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                      >
                        <PlusCircle size={16} />
                      </button>
                      <button 
                        onClick={() => removeLine(line.id)}
                        title="Supprimer la ligne"
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
            <div className="w-full max-w-sm rounded-xl overflow-hidden border border-gray-200 mb-8 shadow-sm">
              <div className="flex border-b border-gray-200 bg-white">
                <div className="w-1/2 p-4 text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center">TOTAL HT</div>
                <div className="w-1/2 p-4 text-right tabular-nums text-base font-medium">{sousTotal > 0 ? sousTotal.toLocaleString('fr-FR') : '0'}</div>
              </div>
              <div className="flex border-b border-gray-200 bg-white items-center">
                <div className="w-1/2 p-4 text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  TVA
                  <select
                    value={tvaRate}
                    onChange={(e) => setTvaRate(Number(e.target.value))}
                    className="text-xs bg-slate-100 font-black px-2 py-1 rounded-md text-gray-700 border-none focus:outline-none cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    <option value={0}>0%</option>
                    <option value={18}>18%</option>
                    <option value={20}>20%</option>
                  </select>
                </div>
                <div className="w-1/2 p-4 text-right tabular-nums text-base font-medium">{tva > 0 ? tva.toLocaleString('fr-FR') : '0'}</div>
              </div>
              <div className={`flex ${isDevis ? 'bg-amber-50' : 'bg-blue-50'}`}>
                <div className={`w-1/2 p-5 font-black text-sm flex items-center ${isDevis ? 'text-amber-900' : 'text-blue-900'}`}>TOTAL TTC</div>
                <div className={`w-1/2 p-5 text-right tabular-nums text-2xl font-black ${isDevis ? 'text-amber-600' : 'text-blue-600'}`}>{totalTTC > 0 ? totalTTC.toLocaleString('fr-FR') : '0'}</div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="w-full max-w-sm border-2 border-dashed border-gray-200 rounded-xl p-6 h-40 flex flex-col items-center justify-center relative bg-white">
              <div className="absolute top-4 left-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">{isDevis ? 'Signature' : 'Signature ou Cachet'}</div>
              <div className="flex gap-6 mt-4 items-center justify-center w-full h-full">
                {companySignature ? (
                  <img src={companySignature} alt="Signature" className="max-h-20 object-contain drop-shadow-sm" />
                ) : (
                  <div className="text-gray-300 text-sm italic">Aucune signature</div>
                )}
                {companyStamp && !isDevis && (
                  <img src={companyStamp} alt="Cachet" className="max-h-24 object-contain opacity-90 mix-blend-multiply" />
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* MODAL LIMITE ATTEINTE */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-amber-50 p-8 flex flex-col items-center text-center border-b border-amber-100">
              <div className="w-20 h-20 bg-white text-amber-500 rounded-full flex items-center justify-center mb-5 shadow-sm border border-amber-100">
                <AlertCircle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-amber-900 mb-2">Limite Atteinte</h3>
              <p className="text-amber-700 font-medium">
                Vous avez consommé vos {userLimit} crédits de documents autorisés.
              </p>
            </div>
            <div className="p-6 bg-white">
              <p className="text-gray-500 text-center mb-8 text-sm leading-relaxed">
                Pour continuer à créer des factures et des devis professionnels en illimité et développer votre activité, veuillez passer à un plan supérieur.
              </p>
              <div className="flex flex-col gap-3">
                <Link 
                  href="/admin/plans"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} /> Voir les plans Premium
                </Link>
                <button 
                  onClick={() => setShowLimitModal(false)}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl border border-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateDocumentPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Chargement...</p>
      </div>
    }>
      <CreateDocumentContent />
    </Suspense>
  )
}
