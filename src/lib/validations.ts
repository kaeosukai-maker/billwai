import { z } from 'zod';

// Customer validation schema
export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
});

// Item validation schema (for quotations and invoices)
export const itemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive').max(999999),
  unitPrice: z.number().nonnegative('Unit price must be non-negative').max(9999999),
});

// Quotation validation schema
export const quotationSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  vatRate: z.number().min(0, 'VAT rate must be non-negative').max(100, 'VAT rate cannot exceed 100%'),
  notes: z.string().max(1000).optional().nullable(),
});

// Invoice validation schema
export const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  vatRate: z.number().min(0, 'VAT rate must be non-negative').max(100, 'VAT rate cannot exceed 100%'),
  withholdingTaxRate: z.number().min(0, 'Withholding tax rate must be non-negative').max(100, 'Withholding tax rate cannot exceed 100%'),
  notes: z.string().max(1000).optional().nullable(),
});

// Business validation schema
export const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(255),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email('Invalid email').max(255).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  logo: z.string().max(2000000).optional().nullable(), // ~2MB base64
});

// File upload validation
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 2MB' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { valid: true };
}
