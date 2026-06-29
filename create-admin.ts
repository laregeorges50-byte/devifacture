import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ckbrqdehfhxjizuecstl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrYnJxZGVoZmh4aml6dWVjc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzU4MDgsImV4cCI6MjA5NzExMTgwOH0.vcupOQ6j2ShjtpphePQqI1E43dNFd8eQ3pj23aaOpWo'
)

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'lare50@gmail.com',
    password: 'A2003@31',
    options: {
      data: {
        full_name: 'SaaS Admin'
      }
    }
  })
  if (error) {
    console.error('Erreur:', error.message)
  } else {
    console.log('Utilisateur créé avec succès!', data.user?.email)
  }
}
main()
