import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ตรวจสอบว่า redirect path ปลอดภัยหรือไม่
function isValidRedirectPath(path: string): boolean {
    // ต้องเริ่มต้นด้วย / แต่ไม่ใช่ // (ป้องกัน protocol-relative URL)
    if (!path.startsWith('/') || path.startsWith('//')) {
        return false;
    }

    // ไม่อนุญาต URLs ที่มี protocol
    if (path.includes(':')) {
        return false;
    }

    // ไม่อนุญาต auth routes
    if (path.startsWith('/auth/')) {
        return false;
    }

    return true;
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // ✅ Validate redirect path ป้องกัน Open Redirect
            const safePath = isValidRedirectPath(next) ? next : '/';
            return NextResponse.redirect(`${origin}${safePath}`)
        }
    }

    // URL to redirect to if there was an error
    return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}
