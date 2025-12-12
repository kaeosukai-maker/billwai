import { createClient } from '@/lib/supabase/server';

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

// สำหรับ API ที่ไม่บังคับ login
export function getOptionalUserId(): Promise<string | null> {
    return getAuthUserId();
}
