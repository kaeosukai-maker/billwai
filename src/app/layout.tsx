import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
    title: 'BillWai - ระบบทำบิลและใบเสนอราคา',
    description: 'ระบบจัดการใบเสนอราคาและใบแจ้งหนี้สำหรับฟรีแลนซ์ไทย',
    keywords: 'ใบเสนอราคา, ใบแจ้งหนี้, บิล, ฟรีแลนซ์, billing, quotation, invoice',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
