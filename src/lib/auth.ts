import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function getAuthUserId() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user.id;
}

export function unauthorizedResponse() {
    return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
    );
}
