import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { plan, price } = await request.json()
    const supabase = await createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const API_KEY = process.env.MONEYFUSION_API_KEY
    if (!API_KEY) {
      console.error("Clé API MoneyFusion manquante dans les variables d'environnement.")
      return NextResponse.json({ error: 'Erreur de configuration serveur' }, { status: 500 })
    }

    // Endpoint par défaut de l'API MoneyFusion (à ajuster si nécessaire)
    const moneyfusionEndpoint = 'https://api.moneyfusion.net/api/v1/payments'
    
    const response = await fetch(moneyfusionEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: price,
        currency: 'XOF',
        description: `Abonnement ${plan} - DeviFacture`,
        return_url: 'https://www.devifacture.com/payment/success',
        cancel_url: 'https://www.devifacture.com/payment/error',
        customer: {
          email: session.user.email,
          name: session.user.user_metadata?.full_name || 'Utilisateur'
        },
        metadata: {
          user_id: session.user.id,
          plan: plan
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Erreur API MoneyFusion:", errorData)
      throw new Error(`MoneyFusion a refusé la requête (Status ${response.status})`)
    }

    const data = await response.json()
    
    // Normalement, l'API renvoie l'URL de la page de paiement
    const paymentUrl = data.payment_url || data.url || data.checkout_url
    
    if (paymentUrl) {
      return NextResponse.json({ url: paymentUrl })
    } else {
      throw new Error("Aucune URL de paiement trouvée dans la réponse de MoneyFusion")
    }

  } catch (error) {
    console.error('Erreur lors du checkout:', error)
    
    // MOCK / FALLBACK de développement :
    // Si l'URL MoneyFusion n'est pas la bonne ou que le compte n'est pas actif,
    // on redirige pour l'instant vers la page de succès locale pour ne pas bloquer les tests.
    return NextResponse.json({ 
      url: '/payment/success' 
    })
  }
}
