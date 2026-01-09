import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase/safe-client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use safe client
        const adminSupabase = getSupabaseClient();

        // Fetch all users using admin client to bypass RLS
        const { data: users, error } = await adminSupabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ users });

    } catch (error: any) {
        console.error('Server error:', error);
        if (error.message === 'Failed to create Supabase client') {
             return NextResponse.json({ error: 'Configuration error: Missing admin keys' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let body;
        try {
            body = await request.json();
        } catch(e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { id, role, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // ✅ VALIDATE role enum
        const validRoles = ['user', 'admin', 'owner', 'super_admin', 'admin_employee'] // Added logic ones as well
        if (role && !validRoles.includes(role)) {
            return NextResponse.json(
                { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
                { status: 400 }
            )
        }

        // ✅ VALIDATE status enum
        const validStatuses = ['active', 'inactive', 'suspended', 'invited']
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            )
        }

        const updates: any = {};
        if (role) updates.role = role;
        if (status) updates.status = status;
        updates.updated_at = new Date().toISOString();

        // Use safe client
        const adminSupabase = getSupabaseClient();

        const { data, error } = await adminSupabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, user: data });

    } catch (error: any) {
        console.error('Server error:', error);
        if (error.message === 'Failed to create Supabase client') {
             return NextResponse.json({ error: 'Configuration error: Missing admin keys' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Use safe client
        const adminSupabase = getSupabaseClient();

        // Delete from profiles using admin client
        const { error } = await adminSupabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Server error:', error);
        if (error.message === 'Failed to create Supabase client') {
             return NextResponse.json({ error: 'Configuration error: Missing admin keys' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
