'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Receipt, ArrowLeft, Edit2, Trash2, Printer, CheckCircle, XCircle, Clock, AlertTriangle, Building2, Phone, Mail } from 'lucide-react';
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import type { Invoice } from '@/types';

const statusConfig = {
    unpaid: { label: 'รอชำระ', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    paid: { label: 'ชำระแล้ว', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    overdue: { label: 'เกินกำหนด', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
    cancelled: { label: 'ยกเลิก', color: 'bg-gray-500/20 text-gray-400', icon: XCircle },
};

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetch(`/api/invoices/${params.id}`).then(r => r.json()).then(data => { setInvoice(data); setLoading(false); });
        }
    }, [params.id]);

    const updateStatus = async (status: string) => {
        const res = await fetch(`/api/invoices/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, paidDate: status === 'paid' ? new Date().toISOString() : null }) });
        if (res.ok) setInvoice(await res.json());
    };

    const handleDelete = async () => {
        if (!confirm('ลบใบแจ้งหนี้?')) return;
        if ((await fetch(`/api/invoices/${params.id}`, { method: 'DELETE' })).ok) router.push('/invoices');
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
    if (!invoice) return <div className="glass-card text-center py-12"><Receipt className="w-16 h-16 text-surface-600 mx-auto mb-4" /><h3 className="text-xl mb-2">ไม่พบใบแจ้งหนี้</h3><Link href="/invoices" className="text-primary-400">กลับ</Link></div>;

    const status = statusConfig[invoice.status as keyof typeof statusConfig];
    const StatusIcon = status.icon;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between no-print">
                <div className="flex items-center gap-4">
                    <Link href="/invoices" className="p-2 rounded-xl hover:bg-surface-700/50 text-surface-400"><ArrowLeft className="w-6 h-6" /></Link>
                    <div><h1 className="text-2xl font-bold flex items-center gap-3"><Receipt className="w-7 h-7 text-primary-400" />{invoice.number}</h1><span className={cn('status-badge mt-1', status.color)}><StatusIcon className="w-3 h-3 mr-1" />{status.label}</span></div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="btn-secondary"><Printer className="w-5 h-5" /></button>
                    <Link href={`/invoices/${invoice.id}/edit`} className="btn-secondary"><Edit2 className="w-5 h-5" /></Link>
                    <button onClick={handleDelete} className="btn-danger"><Trash2 className="w-5 h-5" /></button>
                </div>
            </div>

            {invoice.status === 'unpaid' && (
                <div className="glass-card no-print">
                    <h3 className="text-sm text-surface-400 mb-3">เปลี่ยนสถานะ</h3>
                    <div className="flex gap-2">
                        <button onClick={() => updateStatus('paid')} className="btn-success text-sm"><CheckCircle className="w-4 h-4 mr-1" />ชำระแล้ว</button>
                        <button onClick={() => updateStatus('cancelled')} className="btn-danger text-sm"><XCircle className="w-4 h-4 mr-1" />ยกเลิก</button>
                    </div>
                </div>
            )}

            <div className="glass-card bg-white text-gray-900 print:shadow-none">
                <div className="flex justify-between mb-8 pb-6 border-b border-gray-200">
                    <div><h2 className="text-3xl font-bold text-primary-600">ใบแจ้งหนี้</h2><p className="text-gray-600">INVOICE</p></div>
                    <div className="text-right"><p className="text-xl font-bold">{invoice.number}</p><p className="text-sm text-gray-600">วันที่: {formatDate(invoice.issueDate)}</p><p className="text-sm text-gray-600">ครบกำหนด: {formatDate(invoice.dueDate)}</p></div>
                </div>
                <div className="mb-8">
                    <h3 className="text-sm text-gray-500 mb-2">ลูกค้า</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-lg flex items-center gap-2"><Building2 className="w-5 h-5 text-gray-400" />{invoice.customer?.name}</p>
                        {invoice.customer?.taxId && <p className="text-sm text-gray-600">เลขผู้เสียภาษี: {invoice.customer.taxId}</p>}
                        {invoice.customer?.address && <p className="text-sm text-gray-600">{invoice.customer.address}</p>}
                        {invoice.customer?.phone && <p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-4 h-4" />{invoice.customer.phone}</p>}
                        {invoice.customer?.email && <p className="text-sm text-gray-600 flex items-center gap-1"><Mail className="w-4 h-4" />{invoice.customer.email}</p>}
                    </div>
                </div>
                <table className="w-full mb-8">
                    <thead><tr className="bg-gray-100"><th className="text-left py-3 px-4">#</th><th className="text-left py-3 px-4">รายละเอียด</th><th className="text-right py-3 px-4">จำนวน</th><th className="text-center py-3 px-4">หน่วย</th><th className="text-right py-3 px-4">ราคา</th><th className="text-right py-3 px-4">เงิน</th></tr></thead>
                    <tbody>{invoice.items.map((item, i) => (<tr key={i} className="border-b"><td className="py-3 px-4">{i + 1}</td><td className="py-3 px-4">{item.description}</td><td className="py-3 px-4 text-right">{formatNumber(item.quantity)}</td><td className="py-3 px-4 text-center">{item.unit}</td><td className="py-3 px-4 text-right">{formatNumber(item.unitPrice)}</td><td className="py-3 px-4 text-right font-medium">{formatNumber(item.amount)}</td></tr>))}</tbody>
                </table>
                <div className="flex justify-end">
                    <div className="w-72">
                        <div className="flex justify-between py-2 border-b"><span>ยอดรวม</span><span>{formatNumber(invoice.subtotal)} บาท</span></div>
                        <div className="flex justify-between py-2 border-b"><span>VAT {invoice.vatRate}%</span><span>+{formatNumber(invoice.vatAmount)} บาท</span></div>
                        {invoice.withholdingTax > 0 && <div className="flex justify-between py-2 border-b"><span>หัก ณ ที่จ่าย</span><span className="text-red-600">-{formatNumber(invoice.withholdingTax)} บาท</span></div>}
                        <div className="flex justify-between py-3 bg-primary-50 px-4 -mx-4 rounded-lg mt-2"><span className="font-bold text-primary-600">สุทธิ</span><span className="font-bold text-xl text-primary-600">{formatNumber(invoice.total)} บาท</span></div>
                    </div>
                </div>
                {invoice.notes && <div className="mt-8 pt-6 border-t"><h3 className="text-sm text-gray-500 mb-2">หมายเหตุ</h3><p className="text-gray-700">{invoice.notes}</p></div>}
            </div>
        </div>
    );
}
