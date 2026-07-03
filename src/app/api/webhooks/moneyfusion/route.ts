import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    // Parser le corps de la requête envoyée par MoneyFusion
    const payload = await request.json()
    
    // Log pour pouvoir observer la structure du webhook dans la console Vercel
    console.log("Webhook MoneyFusion reçu :", payload)

    // Vérification du statut du paiement
    const status = payload.status || payload.state || payload.payment_status
    // Tolérance pour les différents formats de statut selon l'agrégateur
    const isSuccess = ['success', 'completed', 'paid', 'approved'].includes(String(status).toLowerCase())

    if (!isSuccess) {
      console.warn(`Paiement ignoré (statut actuel: ${status})`)
      return NextResponse.json({ received: true, status: "ignored" })
    }

    // Récupération des métadonnées injectées lors de la création du lien (dans route.ts)
    const metadata = payload.metadata || payload.custom_data || payload.customer?.metadata
    if (!metadata || !metadata.user_id || !metadata.plan) {
      console.error("Métadonnées manquantes dans le payload du Webhook")
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const { user_id, plan } = metadata

    // Initialisation du client administrateur (contourne la sécurité RLS)
    const supabaseAdmin = createAdminClient()

    // Appel de la procédure RPC stockée dans votre Supabase pour mettre à jour l'abonnement
    const { error } = await supabaseAdmin.rpc('update_user_plan', {
      user_id: user_id,
      new_plan: plan
    })

    if (error) {
      console.error("Erreur Base de Données (Webhook) :", error)
      return NextResponse.json({ error: "Database update failed" }, { status: 500 })
    }

    console.log(`✅ Succès: Le compte ${user_id} a été basculé au plan ${plan}.`)
    return NextResponse.json({ received: true, success: true })
    
  } catch (error) {
    console.error("Erreur critique du Webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
