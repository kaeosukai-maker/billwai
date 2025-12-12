import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOptionalUserId } from '@/lib/auth';

// GET - ดึงข้อมูลลูกค้าตาม ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: params.id },
            include: {
                quotations: { orderBy: { createdAt: 'desc' }, take: 5 },
                invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
    }
}

// PUT - อัปเดตข้อมูลลูกค้า
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, taxId, address, phone, email } = body;

        const customer = await prisma.customer.update({
            where: { id: params.id },
            data: {
                name,
                taxId: taxId || null,
                address: address || null,
                phone: phone || null,
                email: email || null,
            },
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}

// DELETE - ลบลูกค้า
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.customer.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Customer deleted' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
