import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Check for admin token cookie (legacy/demo auth)
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin-token')?.value

    // Verify admin user via Supabase OR admin token
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If valid admin token, allow through (skip all other checks)
    if (adminToken === 'valid-token') {
      // Admin token is valid, proceed
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
    } else {
      // No valid auth
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS and get all users
    const supabaseAdmin = getSupabaseAdmin()

    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, last_name')
      .order('email')

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error: any) {
    console.error('Admin users list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
