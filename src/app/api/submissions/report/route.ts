import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { EmailService } from '@/lib/email/service'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { range_name, address, email, phone, website, socials } = body

        if (!range_name || !address) {
            return NextResponse.json(
                { error: 'Range name and address are required' },
                { status: 400 }
            )
        }

        // 1. Insert into Supabase using ADMIN client to bypass RLS
        const supabase = getSupabaseAdmin()
        const { data: submission, error: dbError } = await supabase
            .from('range_submissions')
            .insert([{
                range_name,
                address,
                email: email || null,
                phone: phone || null,
                website: website || null,
                socials: socials || null,
                status: 'pending',
                submitted_at: new Date().toISOString()
            }])
            .select()
            .single()

        if (dbError) {
            console.error('[Submissions API] Database error:', dbError)
            throw dbError
        }

        // 2. Send Email Notification to Admin
        try {
            await EmailService.sendRangeSubmissionNotification({
                rangeName: range_name,
                address: address,
                submittedByEmail: email || 'Not provided',
                phone: phone || 'Not provided',
                website: website || 'Not provided',
                socials: socials || 'Not provided'
            })
        } catch (emailError) {
            // Don't fail the whole request if email fails, but log it
            console.error('[Submissions API] Email notification failed:', emailError)
        }

        return NextResponse.json({
            success: true,
            message: 'Submission received successfully',
            id: submission?.id
        })

    } catch (error: any) {
        console.error('[Submissions API] Error:', error)
        return NextResponse.json(
            { error: error.message || 'An error occurred during submission' },
            { status: 500 }
        )
    }
}
