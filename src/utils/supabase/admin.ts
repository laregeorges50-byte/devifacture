import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Ce client utilise la clé SERVICE_ROLE qui contourne toutes les règles de sécurité RLS.
// IL NE DOIT JAMAIS ÊTRE UTILISÉ CÔTÉ CLIENT (Navigateur), uniquement dans les Webhooks ou routes API côté serveur.
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL ou clé Service Role manquante')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
