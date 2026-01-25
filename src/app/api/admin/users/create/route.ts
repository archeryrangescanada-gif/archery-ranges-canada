import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Check for admin token cookie (legacy/demo auth)
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin-token')?.value

    // Verify admin user via Supabase OR admin token
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If no Supabase user and no valid admin token, reject
    if (!user && adminToken !== 'valid-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If using admin token (demo mode), allow through
    if (!user && adminToken === 'valid-token') {
      // Skip role check for demo admin
    } else if (user) {
      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'admin_employee', 'super_admin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    }

    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use admin client to create user
    const supabaseAdmin = getSupabaseAdmin()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since admin is creating
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Create profile for the user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: firstName || null,
        last_name: lastName || null,
        role: 'user',
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't fail - profile might be created by trigger
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName,
        lastName,
      }
    })
  } catch (error: any) {
    console.error('Admin create user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}
