'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Veuillez remplir tous les champs.'))
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Messages d'erreur clairs en français
    let msg = error.message
    if (error.message.includes('Invalid login credentials')) {
      msg = 'Email ou mot de passe incorrect. Vérifiez vos identifiants.'
    } else if (error.message.includes('Email not confirmed')) {
      msg = 'Votre email n\'a pas encore été confirmé. Vérifiez votre boîte de réception (ou vos spams).'
    } else if (error.message.includes('Invalid email')) {
      msg = 'L\'adresse email est invalide.'
    } else if (error.message.includes('fetch failed')) {
      msg = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion ou réessayer plus tard.'
    }
    redirect(`/login?error=${encodeURIComponent(msg)}`)
  }

  revalidatePath('/', 'layout')
  if (email === 'lare50@gmail.com') {
    redirect('/saas-admin')
  } else {
    redirect('/admin')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/signup?error=' + encodeURIComponent('Veuillez remplir tous les champs.'))
  }

  if (password.length < 6) {
    redirect('/signup?error=' + encodeURIComponent('Le mot de passe doit contenir au moins 6 caractères.'))
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name || '',
        plan: 'free',
        document_limit: 4,
      },
    },
  })

  if (error) {
    let msg = error.message
    if (error.message.includes('User already registered')) {
      msg = 'Un compte avec cet email existe déjà. Essayez de vous connecter.'
    } else if (error.message.includes('Password should be at least')) {
      msg = 'Le mot de passe doit contenir au moins 6 caractères.'
    } else if (error.message.includes('Unable to validate email')) {
      msg = 'L\'adresse email est invalide.'
    } else if (error.message.includes('fetch failed')) {
      msg = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion ou réessayer plus tard.'
    }
    redirect(`/signup?error=${encodeURIComponent(msg)}`)
  }

  // Cas 1 : Email confirmation désactivée → session créée immédiatement
  if (authData.session) {
    revalidatePath('/', 'layout')
    if (email === 'lare50@gmail.com') {
      redirect('/saas-admin')
    } else {
      redirect('/admin')
    }
  }

  // Cas 2 : Email confirmation activée → rediriger vers login avec message
  // Vérifier si c'est un "fake signup" (l'utilisateur existe déjà, Supabase ne renvoie pas d'erreur mais renvoie un user sans identities)
  if (authData.user && (!authData.user.identities || authData.user.identities.length === 0)) {
    redirect('/signup?error=' + encodeURIComponent('Un compte avec cet email existe déjà. Essayez de vous connecter.'))
  }

  redirect('/login?message=' + encodeURIComponent('Compte créé avec succès ! Vérifiez votre boîte email pour confirmer votre adresse, puis connectez-vous.'))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    redirect('/reset-password?error=' + encodeURIComponent('Veuillez entrer votre adresse email.'))
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/update-password`,
  })

  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent('Erreur lors de l\'envoi. Vérifiez votre adresse email.'))
  }

  redirect('/reset-password?success=true')
}
