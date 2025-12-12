'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { User, Mail, Phone, Building2, Save, Loader2, ArrowLeft, Camera } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        businessName: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.user_metadata?.full_name || '',
                email: user.email || '',
                phone: user.user_metadata?.phone || '',
                businessName: user.user_metadata?.business_name || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: formData.fullName,
                phone: formData.phone,
                business_name: formData.businessName,
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess('บันทึกข้อมูลสำเร็จ!');
            setTimeout(() => setSuccess(''), 3000);
        }
        setSaving(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 rounded-xl hover:bg-white/5 text-surface-400">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <User className="w-8 h-8 text-primary-400" />
                        โปรไฟล์
                    </h1>
                    <p className="text-surface-400 mt-1">จัดการข้อมูลส่วนตัวของคุณ</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="glass-card text-center">
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white">
                            {formData.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold">{formData.fullName || 'ไม่ระบุชื่อ'}</h2>
                    <p className="text-surface-400">{user?.email}</p>
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-surface-500">
                            สมาชิกตั้งแต่: {user?.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : '-'}
                        </p>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 glass-card">
                    <h2 className="text-lg font-semibold mb-6">แก้ไขข้อมูล</h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">ชื่อ-นามสกุล</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="ชื่อของคุณ"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">อีเมล</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="input-field pl-12 opacity-50 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-surface-500 mt-1">ไม่สามารถแก้ไขอีเมลได้</p>
                        </div>

                        <div>
                            <label className="label">เบอร์โทรศัพท์</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="0812345678"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">ชื่อธุรกิจ/ร้านค้า</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="ชื่อธุรกิจของคุณ"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                บันทึก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
