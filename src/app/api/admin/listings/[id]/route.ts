import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json()

    // Updates object - typically used for is_featured, is_premium, status
    const updates = { ...body, updated_at: new Date().toISOString() }

    const adminSupabase = getAdminClient()

    const { data, error } = await adminSupabase
      .from('ranges')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error updating listing ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('❌ Update API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check Auth (Optional for extra security, but layout handles most)
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Use Service Role to ensure delete works even if RLS is strict
    const adminSupabase = getAdminClient()
    const { error } = await adminSupabase
      .from('ranges')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`❌ Error deleting listing ${id}:`, error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Delete API Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to delete listing',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
