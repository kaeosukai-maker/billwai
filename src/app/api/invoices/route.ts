import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/utils';
import { requireAuthUserId, isAuthError } from '@/lib/auth';
import { CreateInvoiceSchema, validateInput } from '@/lib/validation';

// GET - ดึงรายการใบแจ้งหนี้ทั้งหมดของ user
export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const customerId = searchParams.get('customerId');

        const where: Record<string, unknown> = { userId };
        if (status) where.status = status;
        if (customerId) where.customerId = customerId;

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { customer: true, items: true },
        });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}

// POST - สร้างใบแจ้งหนี้ใหม่
export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        const body = await request.json();

        // Validate input
        const validation = validateInput(CreateInvoiceSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const { customerId, quotationId, issueDate, dueDate, items, vatRate, withholdingTaxRate, notes } = validation.data;

        // ตรวจสอบว่า customer เป็นของ user นี้
        const customer = await prisma.customer.findFirst({
            where: { id: customerId, userId },
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // ถ้ามี quotationId ต้องเช็คว่าเป็นของ user นี้
        if (quotationId) {
            const quotation = await prisma.quotation.findFirst({
                where: { id: quotationId, userId },
            });
            if (!quotation) {
                return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
            }
        }

        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const vatAmount = subtotal * ((vatRate || 7) / 100);
        const withholdingTax = subtotal * ((withholdingTaxRate || 0) / 100);
        const total = subtotal + vatAmount - withholdingTax;

        const count = await prisma.invoice.count({
            where: {
                userId, // นับเฉพาะของ user นี้
                createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) }
            },
        });
        const number = generateDocumentNumber('INV', count + 1);

        const invoice = await prisma.invoice.create({
            data: {
                userId,
                number,
                customerId,
                quotationId: quotationId || null,
                issueDate: new Date(issueDate),
                dueDate: new Date(dueDate),
                subtotal,
                vatRate: vatRate || 7,
                vatAmount,
                withholdingTax,
                total,
                notes: notes || null,
                status: 'unpaid',
                items: {
                    create: items.map((item) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        unitPrice: item.unitPrice,
                        amount: item.amount,
                    })),
                },
            },
            include: { customer: true, items: true },
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }
}
