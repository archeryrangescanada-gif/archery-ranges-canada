// src/lib/auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabaseClient = createClientComponentClient()

// Sign up new user
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClientComponentClient()
  
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
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

// Sign out
export async function signOut() {
  const supabase = createClientComponentClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}