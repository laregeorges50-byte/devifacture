'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Users, FileText, CheckCircle2, ShieldAlert, Search, RefreshCw, Star, Ban, Unlock, Trash2, DollarSign, Eye } from 'lucide-react'

type AdminStats = {
  total_users: number
  free_users: number
  paid_users: number
  total_factures: number
  total_devis: number
  total_revenue: number
  total_visits: number
}

type AdminPayment = {
  id: string
  amount: number
  plan: string
  status: string
  created_at: string
  email: string
}

type AdminUser = {
  id: string
  email: string
  full_name: string | null
  plan: string
  company_name: string | null
  created_at: string
  last_sign_in_at: string | null
  is_blocked: boolean
  document_limit: number
  documents_count: number
}

export default function SaasAdminPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [search, setSearch] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats')
      if (statsError) throw statsError
      setStats(statsData)

      const { data: usersData, error: usersError } = await supabase.rpc('get_admin_users')
      if (usersError) throw usersError
      setUsers(usersData || [])

      const { data: paymentsData, error: paymentsError } = await supabase.rpc('get_recent_payments')
      if (paymentsError) throw paymentsError
      setPayments(paymentsData || [])
    } catch (err) {
      console.error('Erreur lors du chargement des données admin:', err)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'lare50@gmail.com') {
        router.push('/admin')
        return
      }
      setIsAdmin(true)
      await loadData()
      setLoading(false)

      // Rafraîchissement automatique toutes les 10 secondes
      interval = setInterval(() => {
        loadData()
      }, 10000)
    }
    
    checkAdmin()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    if (updatingUserId) return
    if (!confirm(`Voulez-vous vraiment ${isBlocked ? 'réactiver' : 'bloquer'} cet utilisateur ?`)) return

    setUpdatingUserId(userId)
    try {
      const { error } = await supabase.rpc('toggle_user_block', { user_id: userId, block: !isBlocked })
      if (error) throw error
      await loadData()
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la mise à jour du statut utilisateur.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleChangePlan = async (userId: string, newPlan: string) => {
    if (updatingUserId) return
    setUpdatingUserId(userId)
    try {
      const { error } = await supabase.rpc('update_user_plan', { user_id: userId, new_plan: newPlan })
      if (error) throw error
      await loadData()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la modification de l'abonnement.")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleChangeLimit = async (userId: string, newLimit: number) => {
    if (updatingUserId) return
    if (newLimit < 0) return
    setUpdatingUserId(userId)
    try {
      const { error } = await supabase.rpc('update_user_document_limit', { target_user_id: userId, new_limit: newLimit })
      if (error) throw error
      await loadData()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la modification de la limite de documents.")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (updatingUserId) return
    const confirmDelete = prompt("ATTENTION : Cette action supprimera DÉFINITIVEMENT l'utilisateur et toutes ses données (clients, factures, devis).\\nTapez 'SUPPRIMER' pour confirmer :")
    if (confirmDelete !== 'SUPPRIMER') return

    setUpdatingUserId(userId)
    try {
      const { error } = await supabase.rpc('delete_user_account', { target_user_id: userId })
      if (error) throw error
      await loadData()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la suppression du compte.")
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Chargement du panneau d'administration...</p>
      </div>
    )
  }

  if (!isAdmin) return null

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.company_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-12 font-sans selection:bg-purple-600 selection:text-white">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Administration SaaS</h2>
          <p className="text-gray-500 mt-1">Supervision globale de l'application et gestion des comptes utilisateurs.</p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold"
        >
          <RefreshCw size={14} /> Rafraîchir
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Utilisateurs</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5">{stats?.total_users || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Membres Gratuits</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5">{stats?.free_users || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Membres Premium</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5">{stats?.paid_users || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Factures Créées</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5">{stats?.total_factures || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Devis Créés</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5">{stats?.total_devis || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Revenu Total</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5">{stats?.total_revenue || 0} FCFA</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Visites Totales</p>
              <h3 className="text-3xl font-black text-gray-900 mt-0.5">{stats?.total_visits || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Users Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Utilisateurs inscrits</h3>
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder="Rechercher par nom, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50 font-bold">
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Entreprise</th>
                  <th className="px-6 py-4">Plan d'abonnement</th>
                  <th className="px-6 py-4 text-center">Quota Docs</th>
                  <th className="px-6 py-4">Créé le</th>
                  <th className="px-6 py-4">Dernière connexion</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{user.full_name || 'Utilisateur sans nom'}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.company_name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.plan}
                        disabled={updatingUserId === user.id}
                        onChange={(e) => handleChangePlan(user.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:opacity-50 transition-colors ${
                          user.plan === 'starter' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          user.plan === 'pro' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          user.plan === 'business' ? 'bg-gray-900 text-white border-gray-900' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <option value="free">Gratuit</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro ⭐</option>
                        <option value="business">Business</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-bold text-gray-500 w-6 text-right">{user.documents_count}</span>
                        <span className="text-xs text-gray-400">/</span>
                        <input 
                          type="number" 
                          min="0"
                          value={user.document_limit}
                          disabled={updatingUserId === user.id}
                          onChange={(e) => handleChangeLimit(user.id, parseInt(e.target.value) || 0)}
                          className="w-12 text-xs font-bold px-1 py-1 rounded border border-gray-200 text-center focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.is_blocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {user.is_blocked ? 'Bloqué' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleToggleBlock(user.id, user.is_blocked)}
                        disabled={updatingUserId === user.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50 ${
                          user.is_blocked 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        {user.is_blocked ? (
                          <>
                            <Unlock size={12} /> Réactiver
                          </>
                        ) : (
                          <>
                            <Ban size={12} /> Bloquer
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={updatingUserId === user.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm bg-gray-100 text-gray-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                        title="Supprimer le compte"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-500 text-sm">
            Aucun utilisateur trouvé.
          </div>
        )}
      </div>

      {/* Recent Payments Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Dernières Transactions (Paiements & Annulations)</h3>
        </div>

        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50 font-bold">
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {payment.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {payment.amount} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 uppercase">
                        {payment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'success' ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600">Succès</span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                          {payment.status === 'cancelled' ? 'Annulé' : 'Échoué'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-500 text-sm">
            Aucune transaction récente trouvée.
          </div>
        )}
      </div>
    </div>
  )
}
