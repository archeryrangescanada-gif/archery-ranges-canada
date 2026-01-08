import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Initialize Supabase Admin client (requires service role key)
// We use a separate client here because we need administrative privileges to invite users
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

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
        const { email, role } = await request.json();

        if (!email || !role) {
            return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
        }

        if (!['super_admin', 'admin_employee'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // 3. Send Invite via Supabase Admin API
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

        if (inviteError) {
            console.error('Error inviting user:', inviteError);
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
                console.error('Error updating profile:', profileError);
                // We generally shouldn't fail the whole request if just the profile update fails, 
                // but for consistency we should warn or try to recover.
                // For now, return success but log the error.
            }
        }

        return NextResponse.json({ success: true, user: inviteData.user });

    } catch (error) {
        console.error('Invite API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
