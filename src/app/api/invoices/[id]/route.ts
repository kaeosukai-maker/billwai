import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - ดึงข้อมูลใบแจ้งหนี้ตาม ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: params.id },
            include: { customer: true, items: true },
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
}

// PUT - อัปเดตใบแจ้งหนี้
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { customerId, issueDate, dueDate, items, vatRate, withholdingTax, notes, status, paidDate } = body;

        let subtotal = 0, vatAmount = 0, total = 0;

        if (items && items.length > 0) {
            subtotal = items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
            vatAmount = subtotal * ((vatRate || 7) / 100);
            total = subtotal + vatAmount - (withholdingTax || 0);
        }

        if (items) {
            await prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } });
        }

        const invoice = await prisma.invoice.update({
            where: { id: params.id },
            data: {
                ...(customerId && { customerId }),
                ...(issueDate && { issueDate: new Date(issueDate) }),
                ...(dueDate && { dueDate: new Date(dueDate) }),
                ...(items && { subtotal, vatAmount, total }),
                ...(vatRate !== undefined && { vatRate }),
                ...(withholdingTax !== undefined && { withholdingTax }),
                ...(notes !== undefined && { notes }),
                ...(status && { status }),
                ...(paidDate && { paidDate: new Date(paidDate) }),
                ...(items && {
                    items: {
                        create: items.map((item: { description: string; quantity: number; unit: string; unitPrice: number; amount: number }) => ({
                            description: item.description,
                            quantity: item.quantity,
                            unit: item.unit,
                            unitPrice: item.unitPrice,
                            amount: item.amount,
                        })),
                    },
                }),
            },
            include: { customer: true, items: true },
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }
}

// DELETE - ลบใบแจ้งหนี้
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.invoice.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Invoice deleted' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }
}
