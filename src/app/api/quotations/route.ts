import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/utils';
import { requireAuthUserId, isAuthError } from '@/lib/auth';
import { CreateQuotationSchema, validateInput } from '@/lib/validation';

// GET - ดึงรายการใบเสนอราคาทั้งหมดของ user
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

        const quotations = await prisma.quotation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { customer: true, items: true },
        });

        return NextResponse.json(quotations);
    } catch (error) {
        console.error('Error fetching quotations:', error);
        return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
    }
}

// POST - สร้างใบเสนอราคาใหม่
export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        const body = await request.json();

        // Validate input
        const validation = validateInput(CreateQuotationSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const { customerId, issueDate, validUntil, items, vatRate, notes } = validation.data;

        // ตรวจสอบว่า customer เป็นของ user นี้
        const customer = await prisma.customer.findFirst({
            where: { id: customerId, userId },
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const vatAmount = subtotal * ((vatRate || 7) / 100);
        const total = subtotal + vatAmount;

        const count = await prisma.quotation.count({
            where: {
                userId, // นับเฉพาะของ user นี้
                createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) }
            },
        });
        const number = generateDocumentNumber('QT', count + 1);

        const quotation = await prisma.quotation.create({
            data: {
                userId,
                number,
                customerId,
                issueDate: new Date(issueDate),
                validUntil: new Date(validUntil),
                subtotal,
                vatRate: vatRate || 7,
                vatAmount,
                total,
                notes: notes || null,
                status: 'draft',
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

        return NextResponse.json(quotation, { status: 201 });
    } catch (error) {
        console.error('Error creating quotation:', error);
        return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 });
    }
}
