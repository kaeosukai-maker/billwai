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
    draft: { label: 'ฉบับร่าง', color: 'bg-gray-500/20 text-gray-400', icon: Clock },
    sent: { label: 'ส่งแล้ว', color: 'bg-blue-500/20 text-blue-400', icon: ArrowUpRight },
    accepted: { label: 'อนุมัติ', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    rejected: { label: 'ปฏิเสธ', color: 'bg-red-500/20 text-red-400', icon: AlertCircle },
    unpaid: { label: 'รอชำระ', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    paid: { label: 'ชำระแล้ว', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    overdue: { label: 'เกินกำหนด', color: 'bg-red-500/20 text-red-400', icon: AlertCircle },
};

export default function Dashboard() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">สวัสดี! 👋</h1>
                    <p className="text-surface-400 mt-1">ยินดีต้อนรับสู่ระบบจัดการบิลและใบเสนอราคา</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/quotations/new" className="btn-secondary flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span>สร้างใบเสนอราคา</span>
                    </Link>
                    <Link href="/invoices/new" className="btn-primary flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        <span>สร้างใบแจ้งหนี้</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-stat group">
                    <div className="flex items-center justify-between">
                        <span className="text-surface-400 text-sm">รายได้เดือนนี้</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.paidThisMonth)}</p>
                    <p className="text-xs text-surface-500">จากยอดรวมทั้งหมด {formatCurrency(stats.totalRevenue)}</p>
                </div>

                <div className="card-stat group">
                    <div className="flex items-center justify-between">
                        <span className="text-surface-400 text-sm">รอชำระเงิน</span>
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.pendingAmount)}</p>
                    <p className="text-xs text-surface-500">{stats.pendingInvoices} รายการ</p>
                </div>

                <div className="card-stat group">
                    <div className="flex items-center justify-between">
                        <span className="text-surface-400 text-sm">ใบเสนอราคาเดือนนี้</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.quotationsThisMonth}</p>
                    <p className="text-xs text-surface-500">รายการ</p>
                </div>

                <div className="card-stat group">
                    <div className="flex items-center justify-between">
                        <span className="text-surface-400 text-sm">ใบแจ้งหนี้เดือนนี้</span>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Receipt className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.invoicesThisMonth}</p>
                    <p className="text-xs text-surface-500">รายการ</p>
                </div>
            </div>

            {/* Recent Documents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quotations */}
                <div className="glass-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-400" />
                            ใบเสนอราคาล่าสุด
                        </h2>
                        <Link href="/quotations" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                            ดูทั้งหมด →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentQuotations.map((item) => {
                            const status = statusConfig[item.status as keyof typeof statusConfig];
                            const StatusIcon = status.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={`/quotations/${item.id}`}
                                    className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30 hover:bg-surface-700/50 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium group-hover:text-primary-400 transition-colors">{item.number}</p>
                                            <p className="text-sm text-surface-500">{item.customer}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(item.amount)}</p>
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
                            <Receipt className="w-5 h-5 text-primary-400" />
                            ใบแจ้งหนี้ล่าสุด
                        </h2>
                        <Link href="/invoices" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                            ดูทั้งหมด →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentInvoices.map((item) => {
                            const status = statusConfig[item.status as keyof typeof statusConfig];
                            const StatusIcon = status.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={`/invoices/${item.id}`}
                                    className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30 hover:bg-surface-700/50 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <Receipt className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium group-hover:text-primary-400 transition-colors">{item.number}</p>
                                            <p className="text-sm text-surface-500">{item.customer}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(item.amount)}</p>
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
                <h2 className="text-lg font-semibold mb-4">การดำเนินการด่วน</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        href="/quotations/new"
                        className="flex flex-col items-center gap-3 p-6 rounded-xl bg-surface-800/30 hover:bg-primary-500/10 hover:border-primary-500/30 border border-transparent transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-7 h-7 text-blue-400" />
                        </div>
                        <span className="font-medium text-center">สร้างใบเสนอราคา</span>
                    </Link>

                    <Link
                        href="/invoices/new"
                        className="flex flex-col items-center gap-3 p-6 rounded-xl bg-surface-800/30 hover:bg-primary-500/10 hover:border-primary-500/30 border border-transparent transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Receipt className="w-7 h-7 text-purple-400" />
                        </div>
                        <span className="font-medium text-center">สร้างใบแจ้งหนี้</span>
                    </Link>

                    <Link
                        href="/customers"
                        className="flex flex-col items-center gap-3 p-6 rounded-xl bg-surface-800/30 hover:bg-primary-500/10 hover:border-primary-500/30 border border-transparent transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-7 h-7 text-emerald-400" />
                        </div>
                        <span className="font-medium text-center">จัดการลูกค้า</span>
                    </Link>

                    <Link
                        href="/settings"
                        className="flex flex-col items-center gap-3 p-6 rounded-xl bg-surface-800/30 hover:bg-primary-500/10 hover:border-primary-500/30 border border-transparent transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-7 h-7 text-amber-400" />
                        </div>
                        <span className="font-medium text-center">ดูรายงาน</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
