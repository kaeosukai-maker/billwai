'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/callback', '/auth/reset-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth();
    const pathname = usePathname();

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-400 mx-auto mb-4" />
                    <p className="text-surface-400">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    // Auth routes - no sidebar
    if (isAuthRoute) {
        return <>{children}</>;
    }

    // Normal routes - always show with sidebar (no auth required)
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-72 p-4 pt-20 lg:pt-8 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
