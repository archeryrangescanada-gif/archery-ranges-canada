import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/service'

export async function POST(request: NextRequest) {
    try {
        const { email, name } = await request.json()

        if (!email || !name) {
            return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
        }

        console.log(`[Welcome API] Sending welcome email to ${email} (${name})`)

        const result = await EmailService.sendArcherWelcomeEmail({
            to: email,
            name: name,
        })

        if (!result.success) {
            console.error('[Welcome API] Failed to send email:', result.error)
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Welcome API] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
