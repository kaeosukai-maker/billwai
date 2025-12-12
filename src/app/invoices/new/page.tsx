'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Receipt, ArrowLeft, Plus, Trash2, Save, Calculator } from 'lucide-react';
import { formatCurrency, formatNumber, UNITS, WITHHOLDING_TAX_RATES } from '@/lib/utils';
import type { Customer, InvoiceItem, Quotation } from '@/types';

export default function NewInvoicePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quotationId = searchParams.get('quotationId');
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [formData, setFormData] = useState({
        customerId: '',
        quotationId: quotationId || '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vatRate: 7,
        withholdingTaxRate: 0,
        notes: '',
    });
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unit: 'รายการ', unitPrice: 0, amount: 0 },
    ]);

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = subtotal * (formData.vatRate / 100);
    const withholdingTax = subtotal * (formData.withholdingTaxRate / 100);
    const total = subtotal + vatAmount - withholdingTax;

    useEffect(() => {
        fetch('/api/customers').then(r => r.json()).then(setCustomers);
    }, []);

    useEffect(() => {
        if (quotationId) {
            fetch(`/api/quotations/${quotationId}`).then(r => r.json()).then((q: Quotation) => {
                setFormData(prev => ({ ...prev, customerId: q.customerId, quotationId: q.id, vatRate: q.vatRate, notes: `อ้างอิงจาก ${q.number}` }));
                setItems(q.items.map(i => ({ description: i.description, quantity: i.quantity, unit: i.unit, unitPrice: i.unitPrice, amount: i.amount })));
            });
        }
    }, [quotationId]);

    const updateItem = (idx: number, field: keyof InvoiceItem, val: string | number) => {
        const newItems = [...items];
        newItems[idx] = { ...newItems[idx], [field]: val };
        if (field === 'quantity' || field === 'unitPrice') newItems[idx].amount = newItems[idx].quantity * newItems[idx].unitPrice;
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerId) return alert('กรุณาเลือกลูกค้า');
        setLoading(true);
        const res = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, items }) });
        if (res.ok) { const inv = await res.json(); router.push(`/invoices/${inv.id}`); }
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link href="/invoices" className="p-2 rounded-xl hover:bg-surface-700/50 text-surface-400"><ArrowLeft className="w-6 h-6" /></Link>
                <div><h1 className="text-3xl font-bold flex items-center gap-3"><Receipt className="w-8 h-8 text-primary-400" />สร้างใบแจ้งหนี้</h1></div>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card">
                        <h2 className="text-lg font-semibold mb-4">ข้อมูลเอกสาร</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="label">ลูกค้า *</label>
                                <select value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })} className="input-field" required>
                                    <option value="">-- เลือกลูกค้า --</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div><label className="label">วันที่ออก</label><input type="date" value={formData.issueDate} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} className="input-field" /></div>
                            <div><label className="label">ครบกำหนด</label><input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="input-field" /></div>
                        </div>
                    </div>
                    <div className="glass-card">
                        <div className="flex justify-between mb-4"><h2 className="text-lg font-semibold">รายการ</h2><button type="button" onClick={() => setItems([...items, { description: '', quantity: 1, unit: 'รายการ', unitPrice: 0, amount: 0 }])} className="btn-secondary text-sm"><Plus className="w-4 h-4" /></button></div>
                        {items.map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-surface-800/30 mb-3 grid grid-cols-12 gap-2">
                                <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="input-field col-span-5" placeholder="รายละเอียด" />
                                <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', +e.target.value)} className="input-field col-span-2" />
                                <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className="input-field col-span-1">{UNITS.map(u => <option key={u}>{u}</option>)}</select>
                                <input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', +e.target.value)} className="input-field col-span-2" />
                                <div className="col-span-2 flex items-center"><span className="flex-1 text-right">{formatNumber(item.amount)}</span><button type="button" onClick={() => items.length > 1 && setItems(items.filter((_, j) => j !== i))} className="ml-2 text-red-400"><Trash2 className="w-4 h-4" /></button></div>
                            </div>
                        ))}
                    </div>
                    <div className="glass-card"><label className="label">หมายเหตุ</label><textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="input-field min-h-[80px]" /></div>
                </div>
                <div className="glass-card sticky top-8 h-fit">
                    <h2 className="text-lg font-semibold mb-4"><Calculator className="w-5 h-5 inline mr-2" />สรุป</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>ยอดรวม</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between"><span>VAT <select value={formData.vatRate} onChange={e => setFormData({ ...formData, vatRate: +e.target.value })} className="input-field py-0 px-1 w-16 inline">{[0, 7].map(v => <option key={v} value={v}>{v}%</option>)}</select></span><span className="text-green-400">+{formatCurrency(vatAmount)}</span></div>
                        <div className="flex justify-between"><span>หัก ณ ที่จ่าย <select value={formData.withholdingTaxRate} onChange={e => setFormData({ ...formData, withholdingTaxRate: +e.target.value })} className="input-field py-0 px-1 w-20 inline">{WITHHOLDING_TAX_RATES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></span><span className="text-red-400">-{formatCurrency(withholdingTax)}</span></div>
                        <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>สุทธิ</span><span className="text-primary-400">{formatCurrency(total)}</span></div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full mt-4"><Save className="w-5 h-5 inline mr-2" />บันทึก</button>
                </div>
            </form>
        </div>
    );
}
