// Types สำหรับ Thai Freelancer Billing App

export interface Business {
    id: string;
    name: string;
    taxId?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logo?: string | null;
    bankName?: string | null;
    bankAccount?: string | null;
    bankAccountName?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Customer {
    id: string;
    name: string;
    taxId?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface QuotationItem {
    id?: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
}

export interface Quotation {
    id: string;
    number: string;
    customerId: string;
    customer?: Customer;
    issueDate: Date | string;
    validUntil: Date | string;
    items: QuotationItem[];
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    notes?: string | null;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

export interface InvoiceItem {
    id?: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
}

export interface Invoice {
    id: string;
    number: string;
    customerId: string;
    customer?: Customer;
    quotationId?: string | null;
    issueDate: Date | string;
    dueDate: Date | string;
    items: InvoiceItem[];
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    withholdingTax: number;
    total: number;
    notes?: string | null;
    status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
    paidDate?: Date | string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Form input types
export interface QuotationFormData {
    customerId: string;
    issueDate: string;
    validUntil: string;
    items: QuotationItem[];
    vatRate: number;
    notes?: string;
}

export interface InvoiceFormData {
    customerId: string;
    quotationId?: string;
    issueDate: string;
    dueDate: string;
    items: InvoiceItem[];
    vatRate: number;
    withholdingTaxRate: number;
    notes?: string;
}

export interface CustomerFormData {
    name: string;
    taxId?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface BusinessFormData {
    name: string;
    taxId?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    bankName?: string;
    bankAccount?: string;
    bankAccountName?: string;
}

// Dashboard stats
export interface DashboardStats {
    totalRevenue: number;
    pendingInvoices: number;
    pendingAmount: number;
    quotationsThisMonth: number;
    invoicesThisMonth: number;
    paidThisMonth: number;
}
