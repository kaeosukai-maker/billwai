import { z } from 'zod';

// ===== Customer Schemas =====
export const CustomerSchema = z.object({
    name: z.string().min(1, 'ชื่อลูกค้าจำเป็น').max(200, 'ชื่อลูกค้าต้องไม่เกิน 200 ตัวอักษร'),
    taxId: z.string().max(20, 'เลขประจำตัวผู้เสียภาษีต้องไม่เกิน 20 ตัวอักษร').optional().nullable(),
    address: z.string().max(500, 'ที่อยู่ต้องไม่เกิน 500 ตัวอักษร').optional().nullable(),
    phone: z.string().max(20, 'เบอร์โทรต้องไม่เกิน 20 ตัวอักษร').optional().nullable(),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').max(100).optional().nullable().or(z.literal('')),
});

export const UpdateCustomerSchema = CustomerSchema.partial();

// ===== Item Schemas =====
export const QuotationItemSchema = z.object({
    description: z.string().min(1, 'รายละเอียดสินค้า/บริการจำเป็น').max(500),
    quantity: z.number().positive('จำนวนต้องมากกว่า 0'),
    unit: z.string().min(1).max(50).default('รายการ'),
    unitPrice: z.number().nonnegative('ราคาต่อหน่วยต้องไม่ติดลบ'),
    amount: z.number().nonnegative('ยอดรวมต้องไม่ติดลบ'),
});

export const InvoiceItemSchema = QuotationItemSchema;

// ===== Quotation Schemas =====
export const CreateQuotationSchema = z.object({
    customerId: z.string().uuid('รหัสลูกค้าไม่ถูกต้อง'),
    issueDate: z.string().or(z.date()),
    validUntil: z.string().or(z.date()),
    vatRate: z.number().min(0, 'VAT ต้องไม่ติดลบ').max(100, 'VAT ต้องไม่เกิน 100%').default(7),
    items: z.array(QuotationItemSchema).min(1, 'ต้องมีอย่างน้อย 1 รายการ'),
    notes: z.string().max(1000, 'หมายเหตุต้องไม่เกิน 1000 ตัวอักษร').optional().nullable(),
});

export const UpdateQuotationSchema = z.object({
    customerId: z.string().uuid().optional(),
    issueDate: z.string().or(z.date()).optional(),
    validUntil: z.string().or(z.date()).optional(),
    vatRate: z.number().min(0).max(100).optional(),
    items: z.array(QuotationItemSchema).min(1).optional(),
    notes: z.string().max(1000).optional().nullable(),
    status: z.enum(['draft', 'sent', 'accepted', 'rejected']).optional(),
});

// ===== Invoice Schemas =====
export const CreateInvoiceSchema = z.object({
    customerId: z.string().uuid('รหัสลูกค้าไม่ถูกต้อง'),
    quotationId: z.string().uuid().optional().nullable(),
    issueDate: z.string().or(z.date()),
    dueDate: z.string().or(z.date()),
    vatRate: z.number().min(0).max(100).default(7),
    withholdingTaxRate: z.number().min(0).max(100).default(0),
    items: z.array(InvoiceItemSchema).min(1, 'ต้องมีอย่างน้อย 1 รายการ'),
    notes: z.string().max(1000).optional().nullable(),
});

export const UpdateInvoiceSchema = z.object({
    customerId: z.string().uuid().optional(),
    issueDate: z.string().or(z.date()).optional(),
    dueDate: z.string().or(z.date()).optional(),
    vatRate: z.number().min(0).max(100).optional(),
    withholdingTax: z.number().min(0).optional(),
    items: z.array(InvoiceItemSchema).min(1).optional(),
    notes: z.string().max(1000).optional().nullable(),
    status: z.enum(['unpaid', 'paid', 'overdue', 'cancelled']).optional(),
    paidDate: z.string().or(z.date()).optional().nullable(),
});

// ===== Business Schemas =====
export const BusinessSchema = z.object({
    name: z.string().min(1, 'ชื่อธุรกิจจำเป็น').max(200),
    taxId: z.string().max(20).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    email: z.string().email().max(100).optional().nullable().or(z.literal('')),
    logo: z.string().max(100000).optional().nullable(), // base64 can be large
    bankName: z.string().max(100).optional().nullable(),
    bankAccount: z.string().max(50).optional().nullable(),
    bankAccountName: z.string().max(100).optional().nullable(),
});

// ===== Helper function to validate and return errors =====
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);
    if (!result.success) {
        const firstError = result.error.issues[0];
        return { success: false, error: firstError?.message || 'ข้อมูลไม่ถูกต้อง' };
    }
    return { success: true, data: result.data };
}
