'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FileText,
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Calculator,
} from 'lucide-react';
import { cn, formatCurrency, formatNumber, UNITS } from '@/lib/utils';
import type { Customer, QuotationItem } from '@/types';

export default function NewQuotationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');

    const [formData, setFormData] = useState({
        customerId: '',
        issueDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vatRate: 7,
        notes: '',
    });

    const [items, setItems] = useState<QuotationItem[]>([
        { description: '', quantity: 1, unit: 'รายการ', unitPrice: 0, amount: 0 },
    ]);

    // คำนวณยอดรวม
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = subtotal * (formData.vatRate / 100);
    const total = subtotal + vatAmount;

    // ดึงรายชื่อลูกค้า
    useEffect(() => {
        fetch('/api/customers')
            .then((res) => res.json())
            .then((data) => setCustomers(data))
            .catch((err) => console.error('Error fetching customers:', err));
    }, []);

    // อัปเดตรายการ
    const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // คำนวณจำนวนเงินอัตโนมัติ
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
        }

        setItems(newItems);
    };

    // เพิ่มรายการ
    const addItem = () => {
        setItems([
            ...items,
            { description: '', quantity: 1, unit: 'รายการ', unitPrice: 0, amount: 0 },
        ]);
    };

    // ลบรายการ
    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    // สร้างลูกค้าใหม่
    const createCustomer = async () => {
        if (!newCustomerName.trim()) return;

        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCustomerName }),
            });
            const customer = await res.json();
            setCustomers([customer, ...customers]);
            setFormData({ ...formData, customerId: customer.id });
            setShowCustomerModal(false);
            setNewCustomerName('');
        } catch (error) {
            console.error('Error creating customer:', error);
        }
    };

    // บันทึกใบเสนอราคา
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerId) {
            alert('กรุณาเลือกลูกค้า');
            return;
        }

        if (items.some((item) => !item.description || item.amount <= 0)) {
            alert('กรุณากรอกรายละเอียดสินค้า/บริการให้ครบถ้วน');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/quotations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    items,
                }),
            });

            if (res.ok) {
                const quotation = await res.json();
                router.push(`/quotations/${quotation.id}`);
            } else {
                alert('เกิดข้อผิดพลาดในการบันทึก');
            }
        } catch (error) {
            console.error('Error creating quotation:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/quotations"
                    className="p-2 rounded-xl hover:bg-surface-700/50 text-surface-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary-400" />
                        สร้างใบเสนอราคา
                    </h1>
                    <p className="text-surface-400 mt-1">กรอกข้อมูลเพื่อสร้างใบเสนอราคาใหม่</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer & Dates */}
                    <div className="glass-card">
                        <h2 className="text-lg font-semibold mb-4">ข้อมูลเอกสาร</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="label">ลูกค้า *</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                        className="input-field flex-1"
                                        required
                                    >
                                        <option value="">-- เลือกลูกค้า --</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomerModal(true)}
                                        className="btn-secondary px-4"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label">วันที่ออกเอกสาร</label>
                                <input
                                    type="date"
                                    value={formData.issueDate}
                                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">ใช้ได้ถึงวันที่</label>
                                <input
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="glass-card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">รายการสินค้า/บริการ</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="btn-secondary text-sm px-3 py-2 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                เพิ่มรายการ
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30"
                                >
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-12 md:col-span-5">
                                            <label className="label text-xs">รายละเอียด</label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                className="input-field py-2"
                                                placeholder="รายละเอียดสินค้า/บริการ"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-4 md:col-span-2">
                                            <label className="label text-xs">จำนวน</label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                className="input-field py-2"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-4 md:col-span-1">
                                            <label className="label text-xs">หน่วย</label>
                                            <select
                                                value={item.unit}
                                                onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                                className="input-field py-2"
                                            >
                                                {UNITS.map((unit) => (
                                                    <option key={unit} value={unit}>
                                                        {unit}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-4 md:col-span-2">
                                            <label className="label text-xs">ราคา/หน่วย</label>
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                className="input-field py-2"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-10 md:col-span-2 flex items-end">
                                            <div className="flex-1">
                                                <label className="label text-xs">จำนวนเงิน</label>
                                                <div className="input-field py-2 bg-surface-900/50 text-right font-medium">
                                                    {formatNumber(item.amount)}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="ml-2 p-2 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors"
                                                disabled={items.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="glass-card">
                        <h2 className="text-lg font-semibold mb-4">หมายเหตุ</h2>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="input-field min-h-[100px] resize-none"
                            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                        />
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-6">
                    <div className="glass-card sticky top-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-primary-400" />
                            สรุปยอดเงิน
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-surface-400">
                                <span>ยอดรวมก่อน VAT</span>
                                <span className="font-medium text-white">{formatCurrency(subtotal)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-surface-400">VAT</span>
                                    <select
                                        value={formData.vatRate}
                                        onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) })}
                                        className="input-field py-1 px-2 w-20 text-sm"
                                    >
                                        <option value="0">0%</option>
                                        <option value="7">7%</option>
                                    </select>
                                </div>
                                <span className="font-medium">{formatCurrency(vatAmount)}</span>
                            </div>

                            <div className="border-t border-surface-700/50 pt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>ยอดรวมสุทธิ</span>
                                    <span className="text-primary-400">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>บันทึกใบเสนอราคา</span>
                                    </>
                                )}
                            </button>
                            <Link href="/quotations" className="btn-secondary w-full text-center block">
                                ยกเลิก
                            </Link>
                        </div>
                    </div>
                </div>
            </form>

            {/* Customer Modal */}
            {showCustomerModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card w-full max-w-md mx-4 animate-slide-up">
                        <h2 className="text-xl font-semibold mb-4">เพิ่มลูกค้าใหม่ (แบบรวดเร็ว)</h2>
                        <div>
                            <label className="label">ชื่อลูกค้า / บริษัท *</label>
                            <input
                                type="text"
                                value={newCustomerName}
                                onChange={(e) => setNewCustomerName(e.target.value)}
                                className="input-field"
                                placeholder="บริษัท ABC จำกัด"
                                autoFocus
                            />
                            <p className="text-xs text-surface-500 mt-2">
                                สามารถเพิ่มรายละเอียดเพิ่มเติมได้ภายหลังที่หน้าจัดการลูกค้า
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowCustomerModal(false)}
                                className="btn-secondary flex-1"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={createCustomer}
                                className="btn-primary flex-1"
                            >
                                เพิ่มลูกค้า
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
