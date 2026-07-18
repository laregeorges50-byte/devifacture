import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { plan, price } = await request.json()
    const supabase = await createClient()
    
    // 1. Récupération de l'utilisateur connecté
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email || 'Client'

    // 2. Préparation des données selon la documentation Money Fusion
    const paymentData = {
      totalPrice: price,
      article: [
        { [plan]: price }
      ],
      numeroSend: "00000000", // Numéro par défaut si non fourni par le client
      nomclient: userEmail,
      personal_Info: [
        { userId: userId, plan: plan, price: price }
      ],
      return_url: "https://www.devifacture.com/paiement/succes",
      cancel_url: "https://www.devifacture.com/paiement/erreur",
      webhook_url: "https://www.devifacture.com/api/webhooks/moneyfusion"
    }

    // Enregistrement IMMÉDIAT du paiement en statut "pending" (en attente)
    // Cela permet de voir les tentatives de paiement qui ont été abandonnées par l'utilisateur
    try {
      const supabaseAdmin = createAdminClient()
      await supabaseAdmin.from('payments').insert({
        user_id: userId,
        amount: Number(price),
        plan: plan,
        status: 'pending' // En attente
      })
    } catch (e) {
      console.error("Erreur lors de l'enregistrement du statut pending:", e)
    }

    // 3. Appel à l'API Money Fusion
    const apiUrl = process.env.MONEYFUSION_API_URL
    const apiKey = process.env.MONEYFUSION_API_KEY
    
    if (!apiUrl) {
      return NextResponse.json({ error: 'Configuration Money Fusion manquante' }, { status: 500 })
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Ajout de la clé API (généralement requise dans le header Authorization ou api-key)
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify(paymentData)
    })

    const data = await response.json()

    // 4. Renvoi de l'URL de paiement générée par Money Fusion au frontend
    if (data && data.url) {
      return NextResponse.json({ url: data.url })
    } else {
      console.error("Erreur de l'API Money Fusion :", data)
      // En cas de problème ou en mode développement si l'URL est invalide,
      // On peut simuler la redirection pour le test
      // return NextResponse.json({ url: "/paiement/succes" })
      return NextResponse.json({ error: 'Impossible de générer le lien de paiement' }, { status: 400 })
    }
  } catch (error) {
    console.error("Erreur critique d'initialisation de paiement :", error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
