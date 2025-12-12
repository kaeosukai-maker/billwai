import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
    title: 'BillWai - ระบบทำบิลและใบเสนอราคา',
    description: 'ระบบจัดการใบเสนอราคาและใบแจ้งหนี้สำหรับฟรีแลนซ์ไทย',
    keywords: 'ใบเสนอราคา, ใบแจ้งหนี้, บิล, ฟรีแลนซ์, billing, quotation, invoice',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th">
            <body className="antialiased">
                <AuthProvider>
                    <AuthGuard>
                        {children}
                    </AuthGuard>
                </AuthProvider>
            </body>
        </html>
    );
}
