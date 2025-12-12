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
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    {
        name: 'แดชบอร์ด',
        href: '/',
        icon: LayoutDashboard,
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        name: 'ใบเสนอราคา',
        href: '/quotations',
        icon: FileText,
        gradient: 'from-violet-500 to-purple-500',
        children: [
            { name: 'รายการทั้งหมด', href: '/quotations' },
            { name: 'สร้างใหม่', href: '/quotations/new', icon: PlusCircle },
        ],
    },
    {
        name: 'ใบแจ้งหนี้',
        href: '/invoices',
        icon: Receipt,
        gradient: 'from-pink-500 to-rose-500',
        children: [
            { name: 'รายการทั้งหมด', href: '/invoices' },
            { name: 'สร้างใหม่', href: '/invoices/new', icon: PlusCircle },
        ],
    },
    {
        name: 'ลูกค้า',
        href: '/customers',
        icon: Users,
        gradient: 'from-emerald-500 to-teal-500',
    },
    {
        name: 'ตั้งค่า',
        href: '/settings',
        icon: Settings,
        gradient: 'from-amber-500 to-orange-500',
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
                className="lg:hidden fixed top-4 left-4 z-[60] p-3 rounded-xl glass text-white hover:scale-105 transition-transform"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed left-0 top-0 h-screen w-72 glass border-r border-white/10 flex flex-col z-50 transition-transform duration-300",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-4" onClick={() => setIsOpen(false)}>
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-2.5 h-2.5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold glow-text">BillWai</h1>
                            <p className="text-xs text-surface-400">ระบบทำบิลออนไลน์</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                                        'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                                        isActive
                                            ? 'bg-white/10 text-white shadow-lg'
                                            : 'text-surface-400 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    <div className={cn(
                                        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                                        isActive
                                            ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                                            : 'bg-white/5 group-hover:bg-white/10'
                                    )}>
                                        <Icon className={cn(
                                            'w-5 h-5 transition-colors',
                                            isActive ? 'text-white' : 'text-surface-400 group-hover:text-white'
                                        )} />
                                    </div>
                                    <span className="font-medium">{item.name}</span>
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-purple-400 animate-pulse" />
                                    )}
                                </Link>

                                {/* Sub-navigation */}
                                {item.children && isActive && (
                                    <div className="ml-14 mt-2 space-y-1">
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
                                                            ? 'text-white bg-white/10'
                                                            : 'text-surface-500 hover:text-white hover:bg-white/5'
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
                <div className="p-4 border-t border-white/10">
                    <div className="glass-button text-center py-3">
                        <p className="text-xs text-surface-500">สร้างด้วย ❤️ สำหรับฟรีแลนซ์ไทย</p>
                    </div>
                </div>
            </div>
        </>
    );
}
