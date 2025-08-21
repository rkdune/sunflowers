import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Letter = {
  id: string
  ciphertext: string
  iv: string
  recipient_email: string
  recipient_name: string
  sender_name: string | null
  return_address: string | null
  created_at: string
}