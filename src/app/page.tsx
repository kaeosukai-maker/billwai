import Link from 'next/link';
import {
    FileText,
    Receipt,
    Users,
    TrendingUp,
    ArrowUpRight,
    Clock,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Zap,
    ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock data - ในอนาคตจะดึงจาก database
const stats = {
    totalRevenue: 125000,
    pendingInvoices: 5,
    pendingAmount: 45000,
    quotationsThisMonth: 12,
    invoicesThisMonth: 8,
    paidThisMonth: 85000,
};

const recentQuotations = [
    { id: '1', number: 'QT-2024-0012', customer: 'บริษัท ABC จำกัด', amount: 25000, status: 'sent' },
    { id: '2', number: 'QT-2024-0011', customer: 'ร้านค้า XYZ', amount: 15000, status: 'accepted' },
    { id: '3', number: 'QT-2024-0010', customer: 'คุณสมชาย ใจดี', amount: 8500, status: 'draft' },
];

const recentInvoices = [
    { id: '1', number: 'INV-2024-0008', customer: 'บริษัท DEF จำกัด', amount: 32000, status: 'paid', dueDate: '2024-12-15' },
    { id: '2', number: 'INV-2024-0007', customer: 'บริษัท ABC จำกัด', amount: 25000, status: 'unpaid', dueDate: '2024-12-20' },
    { id: '3', number: 'INV-2024-0006', customer: 'ร้านค้า GHI', amount: 18000, status: 'overdue', dueDate: '2024-12-01' },
];

const statusConfig = {
    draft: { label: 'ฉบับร่าง', color: 'bg-slate-500/20 text-slate-300 border border-slate-500/30', icon: Clock },
    sent: { label: 'ส่งแล้ว', color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', icon: ArrowUpRight },
    accepted: { label: 'อนุมัติ', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', icon: CheckCircle },
    rejected: { label: 'ปฏิเสธ', color: 'bg-red-500/20 text-red-300 border border-red-500/30', icon: AlertCircle },
    unpaid: { label: 'รอชำระ', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', icon: Clock },
    paid: { label: 'ชำระแล้ว', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', icon: CheckCircle },
    overdue: { label: 'เกินกำหนด', color: 'bg-red-500/20 text-red-300 border border-red-500/30', icon: AlertCircle },
};

export default function Dashboard() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold">สวัสดี!</h1>
                        <span className="text-4xl">👋</span>
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            <span className="text-sm text-violet-300">Pro</span>
                        </div>
                    </div>
                    <p className="text-surface-400">ยินดีต้อนรับสู่ระบบจัดการบิลและใบเสนอราคา</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/quotations/new" className="btn-secondary flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span className="hidden sm:inline">สร้างใบเสนอราคา</span>
                        <span className="sm:hidden">ใบเสนอราคา</span>
                    </Link>
                    <Link href="/invoices/new" className="btn-primary flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        <span className="hidden sm:inline">สร้างใบแจ้งหนี้</span>
                        <span className="sm:hidden">ใบแจ้งหนี้</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="card-stat group stagger-item">
                    <div className="flex items-center justify-between">
                        <span className="text-surface-400 text-sm">รายได้เดือนนี้</span>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-gradient">{formatCurrency(stats.paidThisMonth)}</p>
                    <p className="text-xs text-surface-500">จากยอดรวมทั้งหมด {formatCurrency(stats.totalRevenue)}</p>
                </div>

                <div className="card-stat group stagger-item">
                    <div className="flex items-center justify-between">
                        <span className="text-surface-400 text-sm">รอชำระเงิน</span>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-amber-400">{formatCurrency(stats.pendingAmount)}</p>
                    <p className="text-xs text-surface-500">{stats.pendingInvoices} รายการ</p>
                </div>

                <div className="card-stat group stagger-item">
                    <div className="flex items-center justify-between">
                        <span className="text-surface-400 text-sm">ใบเสนอราคาเดือนนี้</span>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold">{stats.quotationsThisMonth}</p>
                    <p className="text-xs text-surface-500">รายการ</p>
                </div>

                <div className="card-stat group stagger-item">
                    <div className="flex items-center justify-between">
                        <span className="text-surface-400 text-sm">ใบแจ้งหนี้เดือนนี้</span>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all">
                            <Receipt className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold">{stats.invoicesThisMonth}</p>
                    <p className="text-xs text-surface-500">รายการ</p>
                </div>
            </div>

            {/* Recent Documents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quotations */}
                <div className="glass-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            ใบเสนอราคาล่าสุด
                        </h2>
                        <Link href="/quotations" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors group">
                            ดูทั้งหมด
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentQuotations.map((item, index) => {
                            const status = statusConfig[item.status as keyof typeof statusConfig];
                            const StatusIcon = status.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={`/quotations/${item.id}`}
                                    className="stagger-item flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/30 transition-all duration-300 group"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FileText className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium group-hover:text-violet-400 transition-colors">{item.number}</p>
                                            <p className="text-sm text-surface-500">{item.customer}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(item.amount)}</p>
                                        <span className={`status-badge ${status.color}`}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
                                            {status.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="glass-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                <Receipt className="w-4 h-4 text-white" />
                            </div>
                            ใบแจ้งหนี้ล่าสุด
                        </h2>
                        <Link href="/invoices" className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300 transition-colors group">
                            ดูทั้งหมด
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentInvoices.map((item, index) => {
                            const status = statusConfig[item.status as keyof typeof statusConfig];
                            const StatusIcon = status.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={`/invoices/${item.id}`}
                                    className="stagger-item flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/30 transition-all duration-300 group"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Receipt className="w-5 h-5 text-pink-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium group-hover:text-pink-400 transition-colors">{item.number}</p>
                                            <p className="text-sm text-surface-500">{item.customer}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(item.amount)}</p>
                                        <span className={`status-badge ${status.color}`}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
                                            {status.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold">การดำเนินการด่วน</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/quotations/new"
                        className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-gradient-to-br hover:from-violet-500/20 hover:to-purple-500/10 border border-white/5 hover:border-violet-500/30 transition-all duration-300"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <span className="font-medium text-center text-sm">สร้างใบเสนอราคา</span>
                    </Link>

                    <Link
                        href="/invoices/new"
                        className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-gradient-to-br hover:from-pink-500/20 hover:to-rose-500/10 border border-white/5 hover:border-pink-500/30 transition-all duration-300"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
                            <Receipt className="w-8 h-8 text-white" />
                        </div>
                        <span className="font-medium text-center text-sm">สร้างใบแจ้งหนี้</span>
                    </Link>

                    <Link
                        href="/customers"
                        className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-gradient-to-br hover:from-emerald-500/20 hover:to-teal-500/10 border border-white/5 hover:border-emerald-500/30 transition-all duration-300"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <span className="font-medium text-center text-sm">จัดการลูกค้า</span>
                    </Link>

                    <Link
                        href="/settings"
                        className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-orange-500/10 border border-white/5 hover:border-amber-500/30 transition-all duration-300"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <span className="font-medium text-center text-sm">ดูรายงาน</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
