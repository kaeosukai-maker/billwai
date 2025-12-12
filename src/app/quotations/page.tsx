'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Eye,
    Edit2,
    Trash2,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    Send,
} from 'lucide-react';
import { cn, formatCurrency, formatDateShort, QUOTATION_STATUS } from '@/lib/utils';
import type { Quotation } from '@/types';

const statusConfig = {
    draft: { label: 'ฉบับร่าง', color: 'bg-gray-500/20 text-gray-400', icon: Clock },
    sent: { label: 'ส่งแล้ว', color: 'bg-blue-500/20 text-blue-400', icon: Send },
    accepted: { label: 'อนุมัติ', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    rejected: { label: 'ปฏิเสธ', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // ดึงข้อมูลใบเสนอราคา
    const fetchQuotations = async () => {
        try {
            const url = statusFilter !== 'all'
                ? `/api/quotations?status=${statusFilter}`
                : '/api/quotations';
            const res = await fetch(url);
            const data = await res.json();
            setQuotations(data);
        } catch (error) {
            console.error('Error fetching quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, [statusFilter]);

    // Filter quotations
    const filteredQuotations = quotations.filter(
        (q) =>
            q.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('คุณต้องการลบใบเสนอราคานี้หรือไม่?')) return;

        try {
            const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchQuotations();
            }
        } catch (error) {
            console.error('Error deleting quotation:', error);
        }
    };

    // Update status
    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/quotations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                fetchQuotations();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary-400" />
                        ใบเสนอราคา
                    </h1>
                    <p className="text-surface-400 mt-1">จัดการใบเสนอราคาทั้งหมดของคุณ</p>
                </div>
                <Link href="/quotations/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>สร้างใบเสนอราคา</span>
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
                            <option value="draft">ฉบับร่าง</option>
                            <option value="sent">ส่งแล้ว</option>
                            <option value="accepted">อนุมัติ</option>
                            <option value="rejected">ปฏิเสธ</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statusConfig).map(([key, value]) => {
                    const count = quotations.filter((q) => q.status === key).length;
                    const Icon = value.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={cn(
                                'glass-card flex items-center gap-3 hover:border-primary-500/30 transition-all duration-300',
                                statusFilter === key && 'border-primary-500/50'
                            )}
                        >
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', value.color)}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-2xl font-bold">{count}</p>
                                <p className="text-sm text-surface-400">{value.label}</p>
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
            ) : filteredQuotations.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <FileText className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">ยังไม่มีใบเสนอราคา</h3>
                    <p className="text-surface-400 mb-6">เริ่มต้นสร้างใบเสนอราคาแรกของคุณ</p>
                    <Link href="/quotations/new" className="btn-primary inline-flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span>สร้างใบเสนอราคา</span>
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
                                <th className="text-left px-6 py-4">มูลค่า</th>
                                <th className="text-left px-6 py-4">สถานะ</th>
                                <th className="text-right px-6 py-4">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotations.map((quotation) => {
                                const status = statusConfig[quotation.status as keyof typeof statusConfig];
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={quotation.id} className="table-row">
                                        <td className="px-6 py-4">
                                            <span className="font-medium">{quotation.number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{quotation.customer?.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-surface-400">
                                            {formatDateShort(quotation.issueDate)}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {formatCurrency(quotation.total)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn('status-badge', status.color)}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/quotations/${quotation.id}`}
                                                    className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-primary-400 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/quotations/${quotation.id}/edit`}
                                                    className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-primary-400 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(quotation.id)}
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
