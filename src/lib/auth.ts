// src/lib/auth.ts
import { createClient } from '@/lib/supabase/client'

export const supabaseClient = createClient()

// Sign up new user
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })

  if (error) throw error
  return data
}

// Sign in
export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

// Sign out
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
