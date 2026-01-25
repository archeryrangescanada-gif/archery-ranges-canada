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
