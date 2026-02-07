import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/service'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const { firstName, rangeName, claimId } = await req.json()

        if (!firstName || !rangeName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Send acknowledgement to user
        await EmailService.sendClaimReceivedEmail({
            to: user.email!,
            firstName,
            rangeName
        })

        // 2. Fetch full claim details for admin notification
        const { data: claim } = await supabase
            .from('claims')
            .select('*')
            .eq('listing_id', claimId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (claim) {
            // 3. Send notification to admin
            await EmailService.sendAdminClaimNotificationEmail({
                firstName: claim.first_name,
                lastName: claim.last_name,
                rangeName: rangeName,
                role: claim.role_at_range,
                phone: claim.phone_number,
                email: claim.email_address
            })
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Error in claim-received email API:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
