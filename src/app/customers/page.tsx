'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    Plus,
    Search,
    Phone,
    Mail,
    MapPin,
    Edit2,
    Trash2,
    X,
    Building2,
} from 'lucide-react';
import { cn, formatDateShort } from '@/lib/utils';
import type { Customer } from '@/types';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        taxId: '',
        address: '',
        phone: '',
        email: '',
    });

    // ดึงข้อมูลลูกค้า
    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filter customers
    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone?.includes(searchQuery)
    );

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCustomer
                ? `/api/customers/${editingCustomer.id}`
                : '/api/customers';
            const method = editingCustomer ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchCustomers();
                closeModal();
            }
        } catch (error) {
            console.error('Error saving customer:', error);
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('คุณต้องการลบลูกค้านี้หรือไม่?')) return;

        try {
            const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCustomers();
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    // Open modal for editing
    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            taxId: customer.taxId || '',
            address: customer.address || '',
            phone: customer.phone || '',
            email: customer.email || '',
        });
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
        setFormData({ name: '', taxId: '', address: '', phone: '', email: '' });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary-400" />
                        ลูกค้า
                    </h1>
                    <p className="text-surface-400 mt-1">จัดการข้อมูลลูกค้าของคุณ</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>เพิ่มลูกค้า</span>
                </button>
            </div>

            {/* Search */}
            <div className="glass-card">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                    <input
                        type="text"
                        placeholder="ค้นหาลูกค้า..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12"
                    />
                </div>
            </div>

            {/* Customer Grid */}
            {loading ? (
                <div className="glass-card text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-surface-400 mt-4">กำลังโหลด...</p>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <Users className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">ยังไม่มีลูกค้า</h3>
                    <p className="text-surface-400 mb-6">เริ่มต้นเพิ่มลูกค้าคนแรกของคุณ</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>เพิ่มลูกค้า</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <div
                            key={customer.id}
                            className="glass-card hover:border-primary-500/30 transition-all duration-300 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold group-hover:text-primary-400 transition-colors">
                                            {customer.name}
                                        </h3>
                                        {customer.taxId && (
                                            <p className="text-sm text-surface-500">
                                                เลขผู้เสียภาษี: {customer.taxId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(customer)}
                                        className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-primary-400 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(customer.id)}
                                        className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                {customer.email && (
                                    <div className="flex items-center gap-2 text-surface-400">
                                        <Mail className="w-4 h-4" />
                                        <span>{customer.email}</span>
                                    </div>
                                )}
                                {customer.phone && (
                                    <div className="flex items-center gap-2 text-surface-400">
                                        <Phone className="w-4 h-4" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-start gap-2 text-surface-400">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">{customer.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-surface-700/30 text-xs text-surface-500">
                                เพิ่มเมื่อ {formatDateShort(customer.createdAt)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card w-full max-w-lg mx-4 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">
                                {editingCustomer ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">ชื่อลูกค้า / บริษัท *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="บริษัท ABC จำกัด"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">เลขประจำตัวผู้เสียภาษี</label>
                                <input
                                    type="text"
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    className="input-field"
                                    placeholder="0123456789012"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">อีเมล</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field"
                                        placeholder="contact@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="label">เบอร์โทรศัพท์</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-field"
                                        placeholder="02-xxx-xxxx"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">ที่อยู่</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="input-field min-h-[100px] resize-none"
                                    placeholder="ที่อยู่สำหรับออกเอกสาร"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    {editingCustomer ? 'บันทึก' : 'เพิ่มลูกค้า'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
