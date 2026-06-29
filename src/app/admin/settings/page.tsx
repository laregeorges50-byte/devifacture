'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Save, Building2, User, Mail, Phone, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyRccm, setCompanyRccm] = useState('')
  const [companyNif, setCompanyNif] = useState('')
  const [defaultTva, setDefaultTva] = useState('18')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyLogo, setCompanyLogo] = useState('')
  const [companySignature, setCompanySignature] = useState('')
  const [companyStamp, setCompanyStamp] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setFullName(user.user_metadata?.full_name || '')
        setCompanyName(user.user_metadata?.company_name || '')
        setCompanyPhone(user.user_metadata?.company_phone || '')
        setCompanyAddress(user.user_metadata?.company_address || '')
        setCompanyRccm(user.user_metadata?.company_rccm || user.user_metadata?.company_siret || '')
        setCompanyNif(user.user_metadata?.company_nif || '')
        setDefaultTva(user.user_metadata?.default_tva || '18')
        setCompanyEmail(user.user_metadata?.company_email || '')
        
        // Fetch large image data from the separate table to avoid cookie size limits
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
      setLoading(false)
    }
    loadUser()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert("L'image est trop grande. Veuillez choisir une image de moins de 10 Mo.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 600
        const MAX_HEIGHT = 600
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width)
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height)
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Output as WebP to aggressively compress size while keeping high visual quality and transparency
        const dataUrl = canvas.toDataURL('image/webp', 0.85)
        
        // Safety check to ensure we don't exceed a strict 300KB per image (leaving room for 3 images in 1MB limit)
        if (dataUrl.length > 350000) {
          // If still too big, compress more
          setter(canvas.toDataURL('image/webp', 0.60))
        } else {
          setter(dataUrl)
        }
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        company_name: companyName,
        company_phone: companyPhone,
        company_address: companyAddress,
        company_rccm: companyRccm,
        company_nif: companyNif,
        company_siret: null,
        default_tva: defaultTva,
        company_email: companyEmail,
        // Cleared out to prevent HTTP 431 Request Header Fields Too Large
        company_logo: null,
        company_signature: null,
        company_stamp: null,
      }
    })

    const { error: dbError } = await supabase.from('company_settings').upsert({
      user_id: user.id,
      company_logo: companyLogo,
      company_signature: companySignature,
      company_stamp: companyStamp,
      updated_at: new Date().toISOString()
    })

    // Update all existing documents so they reflect the new settings
    const { data: docs } = await supabase.from('documents').select('id, company_metadata').eq('user_id', user.id)
    if (docs) {
      for (const doc of docs) {
        const meta = doc.company_metadata || {}
        await supabase.from('documents').update({
          company_metadata: {
            ...meta,
            name: companyName,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            rccm: companyRccm,
            nif: companyNif,
            siret: null,
            logo: companyLogo,
            signature: companySignature,
            stamp: companyStamp
          }
        }).eq('id', doc.id)
      }
    }

    const error = authError || dbError

    setSaving(false)
    if (error) {
      console.error('Erreur sauvegarde:', error)
      alert("Erreur lors de la sauvegarde: " + error.message)
    } else {
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-gray-500 mt-1">Configurez votre profil et les informations de votre entreprise.</p>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 font-medium">
          ✓ Paramètres sauvegardés avec succès !
        </div>
      )}

      {/* Personal Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><User size={20} className="text-gray-500" /> Informations personnelles</h3>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><User size={16} /></div>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jean Dupont" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={16} /></div>
              <input type="email" value={email} disabled className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas être modifié ici.</p>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Building2 size={20} className="text-gray-500" /> Informations entreprise</h3>
          <p className="text-sm text-gray-500 mt-1">Ces informations apparaîtront sur vos devis et factures.</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l&apos;entreprise</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Building2 size={16} /></div>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ma SARL" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Phone size={16} /></div>
                <input type="tel" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+225 07 00 00 00" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email de l&apos;entreprise</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={16} /></div>
                <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="contact@entreprise.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><MapPin size={16} /></div>
                <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Abidjan, Cocody, Rue des Jardins" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo de l&apos;entreprise</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors relative group min-h-[160px]">
                {companyLogo ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={companyLogo} alt="Logo" className="max-h-20 max-w-full object-contain rounded" />
                    <button type="button" onClick={() => setCompanyLogo('')} className="text-xs text-red-500 font-bold hover:underline">Supprimer</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Building2 className="text-gray-300 mb-2" size={32} />
                    <span className="text-xs text-gray-500 hover:text-gray-700">Sélectionner un fichier</span>
                    <span className="text-[10px] text-gray-400 mt-1">PNG, JPG (Max. 10 Mo)</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setCompanyLogo)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Signature de l&apos;émetteur</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors relative group min-h-[160px]">
                {companySignature ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={companySignature} alt="Signature" className="max-h-20 max-w-full object-contain rounded" />
                    <button type="button" onClick={() => setCompanySignature('')} className="text-xs text-red-500 font-bold hover:underline">Supprimer</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Building2 className="text-gray-300 mb-2" size={32} />
                    <span className="text-xs text-gray-500 hover:text-gray-700">Sélectionner un fichier</span>
                    <span className="text-[10px] text-gray-400 mt-1">Signature manuscrite</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setCompanySignature)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cachet (Tampon)</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors relative group min-h-[160px]">
                {companyStamp ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={companyStamp} alt="Cachet" className="max-h-20 max-w-full object-contain rounded" />
                    <button type="button" onClick={() => setCompanyStamp('')} className="text-xs text-red-500 font-bold hover:underline">Supprimer</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Building2 className="text-gray-300 mb-2" size={32} />
                    <span className="text-xs text-gray-500 hover:text-gray-700">Sélectionner un fichier</span>
                    <span className="text-[10px] text-gray-400 mt-1">Cachet d&apos;entreprise</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setCompanyStamp)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">RCCM</label>
              <input type="text" value={companyRccm} onChange={(e) => setCompanyRccm(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="CI-ABJ-2024-B-12345" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NIF</label>
              <input type="text" value={companyNif} onChange={(e) => setCompanyNif(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0000000000" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">TVA par défaut</label>
              <select value={defaultTva} onChange={(e) => setDefaultTva(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="18">18%</option>
                <option value="19.25">19.25%</option>
                <option value="20">20%</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
          <Save size={16} />
          {saving ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  )
}
