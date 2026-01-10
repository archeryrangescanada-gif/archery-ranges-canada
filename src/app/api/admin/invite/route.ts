import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase/safe-client';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify the requester is a Super Admin
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is super_admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden: Only Super Admins can invite users' }, { status: 403 });
        }

        // 2. Parse request body
        let body;
        try {
            body = await request.json();
        } catch(e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { email, role } = body;

        if (!email || !role) {
            return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
        }

        if (typeof email !== 'string' || typeof role !== 'string') {
            return NextResponse.json({ error: 'Invalid field types' }, { status: 400 });
        }

        // Email format validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (!['super_admin', 'admin_employee'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // 3. Send Invite via Supabase Admin API
        // Use safe client inside handler to prevent build-time errors
        const supabaseAdmin = getSupabaseClient();

        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

        if (inviteError) {
            logger.error('Error inviting user:', inviteError);
            return NextResponse.json({ error: inviteError.message }, { status: 500 });
        }

        // 4. Create/Update Profile with Role and Status
        // The user is created in auth.users by inviteUserByEmail, but we need to ensure the profile exists with the correct role
        if (inviteData.user) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: inviteData.user.id,
                    email: email,
                    role: role,
                    status: 'invited',
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                logger.error('Error updating profile:', profileError);
                // We generally shouldn't fail the whole request if just the profile update fails, 
                // but for consistency we should warn or try to recover.
                // For now, return success but log the error.
            }
        }

        return NextResponse.json({ success: true, user: inviteData.user });

    } catch (error: any) {
        logger.error('Invite API error:', error);
        // Handle safe client config error specifically
        if (error.message === 'Failed to create Supabase client') {
             return NextResponse.json({ error: 'Configuration error: Missing admin keys' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
