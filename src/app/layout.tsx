import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
    title: 'BillWai - ระบบทำบิลและใบเสนอราคา',
    description: 'ระบบจัดการใบเสนอราคาและใบแจ้งหนี้สำหรับฟรีแลนซ์ไทย',
    keywords: 'ใบเสนอราคา, ใบแจ้งหนี้, บิล, ฟรีแลนซ์, billing, quotation, invoice',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th">
            <body className="antialiased">
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 ml-64 p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}
