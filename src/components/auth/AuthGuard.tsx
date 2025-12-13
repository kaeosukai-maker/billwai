'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/callback', '/auth/reset-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
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
        // If already logged in, redirect to home
        if (user) {
            router.replace('/');
            return null;
        }
        return <>{children}</>;
    }

    // All routes accessible with or without login
    // Show with sidebar regardless of auth status
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
