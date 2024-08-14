import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL2!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}