'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FileText,
    ArrowLeft,
    Edit2,
    Trash2,
    Download,
    Printer,
    Send,
    CheckCircle,
    XCircle,
    Clock,
    Receipt,
    Building2,
    Calendar,
    Phone,
    Mail,
} from 'lucide-react';
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import type { Quotation } from '@/types';

const statusConfig = {
    draft: { label: 'ฉบับร่าง', color: 'bg-gray-500/20 text-gray-400', icon: Clock },
    sent: { label: 'ส่งแล้ว', color: 'bg-blue-500/20 text-blue-400', icon: Send },
    accepted: { label: 'อนุมัติ', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    rejected: { label: 'ปฏิเสธ', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

export default function QuotationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetch(`/api/quotations/${params.id}`)
                .then((res) => res.json())
                .then((data) => {
                    setQuotation(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Error fetching quotation:', err);
                    setLoading(false);
                });
        }
    }, [params.id]);

    const updateStatus = async (status: string) => {
        try {
            const res = await fetch(`/api/quotations/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                const updated = await res.json();
                setQuotation(updated);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('คุณต้องการลบใบเสนอราคานี้หรือไม่?')) return;

        try {
            const res = await fetch(`/api/quotations/${params.id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/quotations');
            }
        } catch (error) {
            console.error('Error deleting quotation:', error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const createInvoice = () => {
        router.push(`/invoices/new?quotationId=${params.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!quotation) {
        return (
            <div className="glass-card text-center py-12">
                <FileText className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">ไม่พบใบเสนอราคา</h3>
                <Link href="/quotations" className="text-primary-400 hover:underline">
                    กลับไปหน้ารายการ
                </Link>
            </div>
        );
    }

    const status = statusConfig[quotation.status as keyof typeof statusConfig];
    const StatusIcon = status.icon;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <Link
                        href="/quotations"
                        className="p-2 rounded-xl hover:bg-surface-700/50 text-surface-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <FileText className="w-7 h-7 text-primary-400" />
                            {quotation.number}
                        </h1>
                        <span className={cn('status-badge mt-1', status.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {quotation.status === 'accepted' && (
                        <button onClick={createInvoice} className="btn-success flex items-center gap-2">
                            <Receipt className="w-5 h-5" />
                            <span>สร้างใบแจ้งหนี้</span>
                        </button>
                    )}
                    <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
                        <Printer className="w-5 h-5" />
                        <span>พิมพ์</span>
                    </button>
                    <Link
                        href={`/quotations/${quotation.id}/edit`}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Edit2 className="w-5 h-5" />
                        <span>แก้ไข</span>
                    </Link>
                    <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Status Actions */}
            {quotation.status !== 'accepted' && quotation.status !== 'rejected' && (
                <div className="glass-card no-print">
                    <h3 className="text-sm font-medium text-surface-400 mb-3">เปลี่ยนสถานะ</h3>
                    <div className="flex gap-2">
                        {quotation.status === 'draft' && (
                            <button
                                onClick={() => updateStatus('sent')}
                                className="btn-secondary text-sm flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                ส่งให้ลูกค้า
                            </button>
                        )}
                        <button
                            onClick={() => updateStatus('accepted')}
                            className="btn-success text-sm flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            อนุมัติ
                        </button>
                        <button
                            onClick={() => updateStatus('rejected')}
                            className="btn-danger text-sm flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            ปฏิเสธ
                        </button>
                    </div>
                </div>
            )}

            {/* Document Preview */}
            <div className="glass-card bg-white text-gray-900 print:shadow-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-3xl font-bold text-primary-600">ใบเสนอราคา</h2>
                        <p className="text-lg text-gray-600">QUOTATION</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold">{quotation.number}</p>
                        <p className="text-sm text-gray-600">
                            วันที่: {formatDate(quotation.issueDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                            ใช้ได้ถึง: {formatDate(quotation.validUntil)}
                        </p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">ลูกค้า</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="font-semibold text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-gray-400" />
                                {quotation.customer?.name}
                            </p>
                            {quotation.customer?.taxId && (
                                <p className="text-sm text-gray-600 mt-1">
                                    เลขผู้เสียภาษี: {quotation.customer.taxId}
                                </p>
                            )}
                            {quotation.customer?.address && (
                                <p className="text-sm text-gray-600 mt-1">{quotation.customer.address}</p>
                            )}
                            {quotation.customer?.phone && (
                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {quotation.customer.phone}
                                </p>
                            )}
                            {quotation.customer?.email && (
                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {quotation.customer.email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">รายละเอียด</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600">จำนวน</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-600">หน่วย</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600">ราคา/หน่วย</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600">จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotation.items.map((item, index) => (
                                <tr key={item.id || index} className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                                    <td className="py-3 px-4">{item.description}</td>
                                    <td className="py-3 px-4 text-right">{formatNumber(item.quantity)}</td>
                                    <td className="py-3 px-4 text-center">{item.unit}</td>
                                    <td className="py-3 px-4 text-right">{formatNumber(item.unitPrice)}</td>
                                    <td className="py-3 px-4 text-right font-medium">{formatNumber(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end">
                    <div className="w-72">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">ยอดรวมก่อน VAT</span>
                            <span className="font-medium">{formatNumber(quotation.subtotal)} บาท</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">VAT {quotation.vatRate}%</span>
                            <span className="font-medium">{formatNumber(quotation.vatAmount)} บาท</span>
                        </div>
                        <div className="flex justify-between py-3 bg-primary-50 px-4 -mx-4 mt-2 rounded-lg">
                            <span className="font-bold text-primary-600">ยอดรวมสุทธิ</span>
                            <span className="font-bold text-xl text-primary-600">
                                {formatNumber(quotation.total)} บาท
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {quotation.notes && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">หมายเหตุ</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
