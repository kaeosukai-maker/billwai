import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ฟอร์แมตตัวเลขเป็นสกุลเงินบาท
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
    }).format(amount);
}

// ฟอร์แมตตัวเลขแบบมี comma
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
}

// ฟอร์แมตวันที่เป็นภาษาไทย
export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// ฟอร์แมตวันที่แบบย่อ
export function formatDateShort(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// สร้างเลขที่เอกสารอัตโนมัติ
export function generateDocumentNumber(prefix: string, sequence: number): string {
    const year = new Date().getFullYear();
    const paddedSequence = String(sequence).padStart(4, '0');
    return `${prefix}-${year}-${paddedSequence}`;
}

// คำนวณ VAT
export function calculateVAT(subtotal: number, vatRate: number = 7): number {
    return subtotal * (vatRate / 100);
}

// คำนวณภาษีหัก ณ ที่จ่าย
export function calculateWithholdingTax(subtotal: number, rate: number): number {
    return subtotal * (rate / 100);
}

// สถานะใบเสนอราคา
export const QUOTATION_STATUS = {
    draft: { label: 'ฉบับร่าง', color: 'bg-gray-500' },
    sent: { label: 'ส่งแล้ว', color: 'bg-blue-500' },
    accepted: { label: 'อนุมัติ', color: 'bg-green-500' },
    rejected: { label: 'ปฏิเสธ', color: 'bg-red-500' },
} as const;

// สถานะใบแจ้งหนี้
export const INVOICE_STATUS = {
    unpaid: { label: 'รอชำระ', color: 'bg-yellow-500' },
    paid: { label: 'ชำระแล้ว', color: 'bg-green-500' },
    overdue: { label: 'เกินกำหนด', color: 'bg-red-500' },
    cancelled: { label: 'ยกเลิก', color: 'bg-gray-500' },
} as const;

// อัตราภาษีหัก ณ ที่จ่าย
export const WITHHOLDING_TAX_RATES = [
    { value: 0, label: 'ไม่หัก' },
    { value: 1, label: '1%' },
    { value: 2, label: '2%' },
    { value: 3, label: '3%' },
    { value: 5, label: '5%' },
] as const;

// หน่วยสินค้า/บริการ
export const UNITS = [
    'รายการ',
    'ชิ้น',
    'ชุด',
    'ครั้ง',
    'วัน',
    'ชั่วโมง',
    'เดือน',
    'โปรเจกต์',
    'หน้า',
] as const;
