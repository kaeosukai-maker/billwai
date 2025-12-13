import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuthUserId, isAuthError } from '@/lib/auth';
import { UpdateInvoiceSchema, validateInput } from '@/lib/validation';

// GET - ดึงข้อมูลใบแจ้งหนี้ตาม ID (ต้องเป็นของ user เท่านั้น)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        // ดึงเฉพาะ invoice ที่เป็นของ user นี้
        const invoice = await prisma.invoice.findFirst({
            where: {
                id: params.id,
                userId, // ✅ ป้องกัน IDOR
            },
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

// PUT - อัปเดตใบแจ้งหนี้ (ต้องเป็นของ user เท่านั้น)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        // ตรวจสอบว่า invoice เป็นของ user นี้
        const existingInvoice = await prisma.invoice.findFirst({
            where: { id: params.id, userId },
        });

        if (!existingInvoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const body = await request.json();

        // Validate input
        const validation = validateInput(UpdateInvoiceSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const { customerId, issueDate, dueDate, items, vatRate, withholdingTax, notes, status, paidDate } = validation.data;

        // ถ้าเปลี่ยน customer ต้องเช็คว่าเป็นของ user นี้
        if (customerId) {
            const customer = await prisma.customer.findFirst({
                where: { id: customerId, userId },
            });
            if (!customer) {
                return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
            }
        }

        let subtotal = 0, vatAmount = 0, total = 0;

        if (items && items.length > 0) {
            subtotal = items.reduce((sum, item) => sum + item.amount, 0);
            vatAmount = subtotal * ((vatRate || existingInvoice.vatRate) / 100);
            total = subtotal + vatAmount - (withholdingTax || existingInvoice.withholdingTax);
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
                        create: items.map((item) => ({
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

// DELETE - ลบใบแจ้งหนี้ (ต้องเป็นของ user เท่านั้น)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        // ตรวจสอบว่า invoice เป็นของ user นี้
        const existingInvoice = await prisma.invoice.findFirst({
            where: { id: params.id, userId },
        });

        if (!existingInvoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        await prisma.invoice.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Invoice deleted' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }
}
