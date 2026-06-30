import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://ckbrqdehfhxjizuecstl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrYnJxZGVoZmh4aml6dWVjc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzU4MDgsImV4cCI6MjA5NzExMTgwOH0.vcupOQ6j2ShjtpphePQqI1E43dNFd8eQ3pj23aaOpWo'
  )
}
