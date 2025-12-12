import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/utils';
import { getOptionalUserId } from '@/lib/auth';

// GET - ดึงรายการใบเสนอราคาทั้งหมด
export async function GET(request: NextRequest) {
    try {
        const userId = await getOptionalUserId();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const customerId = searchParams.get('customerId');

        const where: Record<string, unknown> = {};
        if (userId) where.userId = userId;
        if (status) where.status = status;
        if (customerId) where.customerId = customerId;

        const quotations = await prisma.quotation.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
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
        const userId = await getOptionalUserId();
        const body = await request.json();
        const { customerId, issueDate, validUntil, items, vatRate, notes } = body;

        if (!customerId || !items || items.length === 0) {
            return NextResponse.json({ error: 'Customer and items are required' }, { status: 400 });
        }

        const subtotal = items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
        const vatAmount = subtotal * ((vatRate || 7) / 100);
        const total = subtotal + vatAmount;

        const count = await prisma.quotation.count({
            where: { createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) } },
        });
        const number = generateDocumentNumber('QT', count + 1);

        const quotation = await prisma.quotation.create({
            data: {
                userId: userId || 'anonymous',
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
                    create: items.map((item: { description: string; quantity: number; unit: string; unitPrice: number; amount: number }) => ({
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
