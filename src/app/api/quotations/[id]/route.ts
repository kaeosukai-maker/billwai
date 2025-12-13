import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuthUserId, isAuthError } from '@/lib/auth';
import { UpdateQuotationSchema, validateInput } from '@/lib/validation';

// GET - ดึงข้อมูลใบเสนอราคาตาม ID (ต้องเป็นของ user เท่านั้น)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        // ดึงเฉพาะ quotation ที่เป็นของ user นี้
        const quotation = await prisma.quotation.findFirst({
            where: {
                id: params.id,
                userId, // ✅ ป้องกัน IDOR
            },
            include: { customer: true, items: true },
        });

        if (!quotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        return NextResponse.json(quotation);
    } catch (error) {
        console.error('Error fetching quotation:', error);
        return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 });
    }
}

// PUT - อัปเดตใบเสนอราคา (ต้องเป็นของ user เท่านั้น)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        // ตรวจสอบว่า quotation เป็นของ user นี้
        const existingQuotation = await prisma.quotation.findFirst({
            where: { id: params.id, userId },
        });

        if (!existingQuotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        const body = await request.json();

        // Validate input
        const validation = validateInput(UpdateQuotationSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const { customerId, issueDate, validUntil, items, vatRate, notes, status } = validation.data;

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
            vatAmount = subtotal * ((vatRate || existingQuotation.vatRate) / 100);
            total = subtotal + vatAmount;
        }

        if (items) {
            await prisma.quotationItem.deleteMany({ where: { quotationId: params.id } });
        }

        const quotation = await prisma.quotation.update({
            where: { id: params.id },
            data: {
                ...(customerId && { customerId }),
                ...(issueDate && { issueDate: new Date(issueDate) }),
                ...(validUntil && { validUntil: new Date(validUntil) }),
                ...(items && { subtotal, vatAmount, total }),
                ...(vatRate !== undefined && { vatRate }),
                ...(notes !== undefined && { notes }),
                ...(status && { status }),
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

        return NextResponse.json(quotation);
    } catch (error) {
        console.error('Error updating quotation:', error);
        return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
    }
}

// DELETE - ลบใบเสนอราคา (ต้องเป็นของ user เท่านั้น)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        // ตรวจสอบว่า quotation เป็นของ user นี้
        const existingQuotation = await prisma.quotation.findFirst({
            where: { id: params.id, userId },
        });

        if (!existingQuotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        await prisma.quotation.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Quotation deleted' });
    } catch (error) {
        console.error('Error deleting quotation:', error);
        return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 });
    }
}
