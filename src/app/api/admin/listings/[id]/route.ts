import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deleting listing: ${id}`)

    const supabase = await createClient()

    const { error } = await supabase
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

    console.log(`✅ Successfully deleted listing: ${id}`)

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
