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

    // Extraction des métadonnées (MoneyFusion peut utiliser custom_data, metadata ou personal_Info)
    const rawMetadata = payload.metadata || payload.custom_data || payload.customer?.metadata || payload.personal_Info
    const metadata = Array.isArray(rawMetadata) ? rawMetadata[0] : rawMetadata

    const userId = metadata?.user_id || metadata?.userId
    const plan = metadata?.plan
    const price = metadata?.price || metadata?.amount

    if (!userId || !plan) {
      console.error("Métadonnées manquantes dans le payload du Webhook :", JSON.stringify(metadata || {}))
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    // Initialisation du client administrateur (contourne la sécurité RLS)
    const supabaseAdmin = createAdminClient()

    // Enregistrement du paiement pour les statistiques (même si échoué ou annulé)
    if (price) {
      await supabaseAdmin.from('payments').insert({
        user_id: userId,
        amount: Number(price),
        plan: plan,
        status: isSuccess ? 'success' : (status || 'failed')
      })
    }

    if (!isSuccess) {
      console.warn(`Paiement ignoré ou annulé (statut actuel: ${status})`)
      return NextResponse.json({ received: true, status: "ignored_or_failed" })
    }

    // Appel de la procédure RPC stockée dans votre Supabase pour mettre à jour l'abonnement
    const { error } = await supabaseAdmin.rpc('update_user_plan', {
      user_id: userId,
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
