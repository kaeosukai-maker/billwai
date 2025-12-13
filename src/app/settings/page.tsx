'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Building2, Phone, Mail, MapPin, CreditCard, Upload } from 'lucide-react';
import type { Business } from '@/types';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState<Partial<Business>>({
        name: '',
        taxId: '',
        address: '',
        phone: '',
        email: '',
        logo: '',
        bankName: '',
        bankAccount: '',
        bankAccountName: '',
    });

    useEffect(() => {
        fetch('/api/business')
            .then((res) => res.json())
            .then((data) => {
                if (data) setFormData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving:', error);
        }
        setSaving(false);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 2MB)
            const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
            if (file.size > MAX_FILE_SIZE) {
                alert('ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 2MB');
                e.target.value = ''; // Clear input
                return;
            }

            // Validate file type
            const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!ALLOWED_TYPES.includes(file.type)) {
                alert('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP)');
                e.target.value = ''; // Clear input
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, logo: reader.result as string });
            };
            reader.onerror = () => {
                alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
                e.target.value = ''; // Clear input
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary-400" />
                    ตั้งค่า
                </h1>
                <p className="text-surface-400 mt-1">จัดการข้อมูลธุรกิจของคุณ</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Business Info */}
                    <div className="glass-card">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary-400" />
                            ข้อมูลธุรกิจ
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="label">ชื่อธุรกิจ / ชื่อฟรีแลนซ์ *</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="บริษัท / ชื่อ-สกุล"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">เลขประจำตัวผู้เสียภาษี</label>
                                <input
                                    type="text"
                                    value={formData.taxId || ''}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    className="input-field"
                                    placeholder="0123456789012"
                                />
                            </div>
                            <div>
                                <label className="label">ที่อยู่</label>
                                <textarea
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="input-field min-h-[100px]"
                                    placeholder="ที่อยู่สำหรับออกเอกสาร"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label flex items-center gap-1"><Phone className="w-4 h-4" />เบอร์โทร</label>
                                    <input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-field"
                                        placeholder="08x-xxx-xxxx"
                                    />
                                </div>
                                <div>
                                    <label className="label flex items-center gap-1"><Mail className="w-4 h-4" />อีเมล</label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div className="glass-card">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary-400" />
                            ข้อมูลธนาคาร (สำหรับรับชำระ)
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="label">ธนาคาร</label>
                                <select
                                    value={formData.bankName || ''}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">-- เลือกธนาคาร --</option>
                                    <option value="กสิกรไทย">ธนาคารกสิกรไทย</option>
                                    <option value="กรุงเทพ">ธนาคารกรุงเทพ</option>
                                    <option value="กรุงไทย">ธนาคารกรุงไทย</option>
                                    <option value="ไทยพาณิชย์">ธนาคารไทยพาณิชย์</option>
                                    <option value="กรุงศรีอยุธยา">ธนาคารกรุงศรีอยุธยา</option>
                                    <option value="ทีเอ็มบีธนชาต">ธนาคารทีเอ็มบีธนชาต</option>
                                    <option value="ออมสิน">ธนาคารออมสิน</option>
                                    <option value="พร้อมเพย์">พร้อมเพย์</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">เลขที่บัญชี</label>
                                    <input
                                        type="text"
                                        value={formData.bankAccount || ''}
                                        onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                        className="input-field"
                                        placeholder="xxx-x-xxxxx-x"
                                    />
                                </div>
                                <div>
                                    <label className="label">ชื่อบัญชี</label>
                                    <input
                                        type="text"
                                        value={formData.bankAccountName || ''}
                                        onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                                        className="input-field"
                                        placeholder="ชื่อ-สกุล"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Logo */}
                    <div className="glass-card">
                        <h2 className="text-lg font-semibold mb-4">โลโก้</h2>
                        <div className="flex flex-col items-center gap-4">
                            {formData.logo ? (
                                <div className="relative">
                                    <img
                                        src={formData.logo}
                                        alt="Logo"
                                        className="w-32 h-32 object-contain rounded-xl bg-white p-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, logo: '' })}
                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-surface-600 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-surface-500" />
                                </div>
                            )}
                            <label className="btn-secondary cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                อัปโหลดโลโก้
                            </label>
                            <p className="text-xs text-surface-500 text-center">
                                แนะนำ: รูปสี่เหลี่ยมจัตุรัส ขนาด 200x200px
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="glass-card">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    บันทึกการตั้งค่า
                                </>
                            )}
                        </button>
                        {saved && (
                            <p className="text-center text-green-400 text-sm mt-3 animate-fade-in">
                                ✓ บันทึกเรียบร้อยแล้ว
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
