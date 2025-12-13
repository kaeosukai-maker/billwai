import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function getAuthUserId(): Promise<string | null> {
    try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        return user.id;
    } catch {
        return null;
    }
}

// สำหรับ API ที่บังคับ login - return 401 ถ้าไม่ได้ login
export async function requireAuthUserId(): Promise<string | NextResponse> {
    const userId = await getAuthUserId();
    if (!userId) {
        return NextResponse.json(
            { error: 'Unauthorized - กรุณาเข้าสู่ระบบ' },
            { status: 401 }
        );
    }
    return userId;
}

// Helper function เพื่อ check ว่า result เป็น error response หรือไม่
export function isAuthError(result: string | NextResponse): result is NextResponse {
    return result instanceof NextResponse;
}

// สำหรับ API ที่ไม่บังคับ login (deprecated - ควรใช้ requireAuthUserId แทน)
export function getOptionalUserId(): Promise<string | null> {
    return getAuthUserId();
}
