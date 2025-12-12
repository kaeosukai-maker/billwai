'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Receipt,
    Plus,
    Search,
    Eye,
    Edit2,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { cn, formatCurrency, formatDateShort } from '@/lib/utils';
import type { Invoice } from '@/types';

const statusConfig = {
    unpaid: { label: 'รอชำระ', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    paid: { label: 'ชำระแล้ว', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    overdue: { label: 'เกินกำหนด', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
    cancelled: { label: 'ยกเลิก', color: 'bg-gray-500/20 text-gray-400', icon: XCircle },
};

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // ดึงข้อมูลใบแจ้งหนี้
    const fetchInvoices = async () => {
        try {
            const url = statusFilter !== 'all'
                ? `/api/invoices?status=${statusFilter}`
                : '/api/invoices';
            const res = await fetch(url);
            const data = await res.json();
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    // Filter invoices
    const filteredInvoices = invoices.filter(
        (inv) =>
            inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('คุณต้องการลบใบแจ้งหนี้นี้หรือไม่?')) return;

        try {
            const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchInvoices();
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Receipt className="w-8 h-8 text-primary-400" />
                        ใบแจ้งหนี้
                    </h1>
                    <p className="text-surface-400 mt-1">จัดการใบแจ้งหนี้ทั้งหมดของคุณ</p>
                </div>
                <Link href="/invoices/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>สร้างใบแจ้งหนี้</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="glass-card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                        <input
                            type="text"
                            placeholder="ค้นหาเลขที่เอกสาร, ชื่อลูกค้า..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field w-auto"
                        >
                            <option value="all">ทุกสถานะ</option>
                            <option value="unpaid">รอชำระ</option>
                            <option value="paid">ชำระแล้ว</option>
                            <option value="overdue">เกินกำหนด</option>
                            <option value="cancelled">ยกเลิก</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statusConfig).map(([key, value]) => {
                    const count = invoices.filter((inv) => inv.status === key).length;
                    const total = invoices
                        .filter((inv) => inv.status === key)
                        .reduce((sum, inv) => sum + inv.total, 0);
                    const Icon = value.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={cn(
                                'glass-card flex flex-col gap-2 hover:border-primary-500/30 transition-all duration-300',
                                statusFilter === key && 'border-primary-500/50'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', value.color)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-bold">{count}</span>
                            </div>
                            <div>
                                <p className="text-sm text-surface-400">{value.label}</p>
                                <p className="text-sm font-medium">{formatCurrency(total)}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            {loading ? (
                <div className="glass-card text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-surface-400 mt-4">กำลังโหลด...</p>
                </div>
            ) : filteredInvoices.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <Receipt className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">ยังไม่มีใบแจ้งหนี้</h3>
                    <p className="text-surface-400 mb-6">เริ่มต้นสร้างใบแจ้งหนี้แรกของคุณ</p>
                    <Link href="/invoices/new" className="btn-primary inline-flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span>สร้างใบแจ้งหนี้</span>
                    </Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="table-header">
                                <th className="text-left px-6 py-4">เลขที่เอกสาร</th>
                                <th className="text-left px-6 py-4">ลูกค้า</th>
                                <th className="text-left px-6 py-4">วันที่</th>
                                <th className="text-left px-6 py-4">ครบกำหนด</th>
                                <th className="text-left px-6 py-4">มูลค่า</th>
                                <th className="text-left px-6 py-4">สถานะ</th>
                                <th className="text-right px-6 py-4">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((invoice) => {
                                const status = statusConfig[invoice.status as keyof typeof statusConfig];
                                const StatusIcon = status.icon;
                                const isOverdue =
                                    invoice.status === 'unpaid' && new Date(invoice.dueDate) < new Date();
                                return (
                                    <tr key={invoice.id} className="table-row">
                                        <td className="px-6 py-4">
                                            <span className="font-medium">{invoice.number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{invoice.customer?.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-surface-400">
                                            {formatDateShort(invoice.issueDate)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(isOverdue && 'text-red-400')}>
                                                {formatDateShort(invoice.dueDate)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {formatCurrency(invoice.total)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn('status-badge', isOverdue ? 'bg-red-500/20 text-red-400' : status.color)}>
                                                {isOverdue ? (
                                                    <>
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                        เกินกำหนด
                                                    </>
                                                ) : (
                                                    <>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {status.label}
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/invoices/${invoice.id}`}
                                                    className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-primary-400 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/invoices/${invoice.id}/edit`}
                                                    className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-primary-400 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
