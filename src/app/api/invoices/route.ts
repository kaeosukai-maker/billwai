import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/utils';

// GET - ดึงรายการใบแจ้งหนี้ทั้งหมด
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const customerId = searchParams.get('customerId');

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (customerId) where.customerId = customerId;

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: true,
                items: true,
            },
        });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

// POST - สร้างใบแจ้งหนี้ใหม่
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerId, quotationId, issueDate, dueDate, items, vatRate, withholdingTaxRate, notes } = body;

        // Validate required fields
        if (!customerId || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Customer and items are required' },
                { status: 400 }
            );
        }

        // คำนวณยอดรวม
        const subtotal = items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
        const vatAmount = subtotal * ((vatRate || 7) / 100);
        const withholdingTax = subtotal * ((withholdingTaxRate || 0) / 100);
        const total = subtotal + vatAmount - withholdingTax;

        // สร้างเลขที่เอกสาร
        const count = await prisma.invoice.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().getFullYear(), 0, 1),
                },
            },
        });
        const number = generateDocumentNumber('INV', count + 1);

        // สร้างใบแจ้งหนี้
        const invoice = await prisma.invoice.create({
            data: {
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
                    create: items.map((item: { description: string; quantity: number; unit: string; unitPrice: number; amount: number }) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        unitPrice: item.unitPrice,
                        amount: item.amount,
                    })),
                },
            },
            include: {
                customer: true,
                items: true,
            },
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
