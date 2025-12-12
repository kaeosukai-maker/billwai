'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Receipt,
    Users,
    Settings,
    PlusCircle,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    {
        name: 'แดชบอร์ด',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        name: 'ใบเสนอราคา',
        href: '/quotations',
        icon: FileText,
        children: [
            { name: 'รายการทั้งหมด', href: '/quotations' },
            { name: 'สร้างใหม่', href: '/quotations/new', icon: PlusCircle },
        ],
    },
    {
        name: 'ใบแจ้งหนี้',
        href: '/invoices',
        icon: Receipt,
        children: [
            { name: 'รายการทั้งหมด', href: '/invoices' },
            { name: 'สร้างใหม่', href: '/invoices/new', icon: PlusCircle },
        ],
    },
    {
        name: 'ลูกค้า',
        href: '/customers',
        icon: Users,
    },
    {
        name: 'ตั้งค่า',
        href: '/settings',
        icon: Settings,
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-3 rounded-xl glass text-white"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed left-0 top-0 h-screen w-64 glass border-r border-surface-700/50 flex flex-col z-50 transition-transform duration-300",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Logo */}
                <div className="p-6 border-b border-surface-700/50">
                    <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold glow-text">BillWai</h1>
                            <p className="text-xs text-surface-500">ระบบทำบิลออนไลน์</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.children && item.children.some(child => pathname === child.href));
                        const Icon = item.icon;

                        return (
                            <div key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        'nav-link',
                                        isActive && 'active'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>

                                {/* Sub-navigation */}
                                {item.children && isActive && (
                                    <div className="ml-8 mt-1 space-y-1">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={cn(
                                                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                                                        pathname === child.href
                                                            ? 'text-primary-400 bg-primary-500/10'
                                                            : 'text-surface-500 hover:text-surface-300'
                                                    )}
                                                >
                                                    {ChildIcon && <ChildIcon className="w-4 h-4" />}
                                                    <span>{child.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-surface-700/50">
                    <div className="glass-button text-center">
                        <p className="text-xs text-surface-500">สร้างด้วย ❤️ สำหรับฟรีแลนซ์ไทย</p>
                    </div>
                </div>
            </div>
        </>
    );
}
