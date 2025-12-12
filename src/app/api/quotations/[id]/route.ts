import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - ดึงข้อมูลใบเสนอราคาตาม ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const quotation = await prisma.quotation.findUnique({
            where: { id: params.id },
            include: {
                customer: true,
                items: true,
            },
        });

        if (!quotation) {
            return NextResponse.json(
                { error: 'Quotation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(quotation);
    } catch (error) {
        console.error('Error fetching quotation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quotation' },
            { status: 500 }
        );
    }
}

// PUT - อัปเดตใบเสนอราคา
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { customerId, issueDate, validUntil, items, vatRate, notes, status } = body;

        // คำนวณยอดรวมใหม่
        let subtotal = 0;
        let vatAmount = 0;
        let total = 0;

        if (items && items.length > 0) {
            subtotal = items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
            vatAmount = subtotal * ((vatRate || 7) / 100);
            total = subtotal + vatAmount;
        }

        // ลบรายการเก่าก่อน (ถ้ามีการอัปเดต items)
        if (items) {
            await prisma.quotationItem.deleteMany({
                where: { quotationId: params.id },
            });
        }

        // อัปเดตใบเสนอราคา
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
            include: {
                customer: true,
                items: true,
            },
        });

        return NextResponse.json(quotation);
    } catch (error) {
        console.error('Error updating quotation:', error);
        return NextResponse.json(
            { error: 'Failed to update quotation' },
            { status: 500 }
        );
    }
}

// DELETE - ลบใบเสนอราคา
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.quotation.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Quotation deleted' });
    } catch (error) {
        console.error('Error deleting quotation:', error);
        return NextResponse.json(
            { error: 'Failed to delete quotation' },
            { status: 500 }
        );
    }
}
