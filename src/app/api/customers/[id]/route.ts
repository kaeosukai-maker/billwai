import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuthUserId, isAuthError } from '@/lib/auth';
import { UpdateCustomerSchema, validateInput } from '@/lib/validation';

// GET - ดึงข้อมูลลูกค้าตาม ID (ต้องเป็นของ user เท่านั้น)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        // ดึงเฉพาะ customer ที่เป็นของ user นี้
        const customer = await prisma.customer.findFirst({
            where: {
                id: params.id,
                userId, // ✅ ป้องกัน IDOR
            },
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

// PUT - อัปเดตข้อมูลลูกค้า (ต้องเป็นของ user เท่านั้น)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        // ตรวจสอบว่า customer เป็นของ user นี้
        const existingCustomer = await prisma.customer.findFirst({
            where: { id: params.id, userId },
        });

        if (!existingCustomer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        const body = await request.json();

        // Validate input
        const validation = validateInput(UpdateCustomerSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const { name, taxId, address, phone, email } = validation.data;

        const customer = await prisma.customer.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                taxId: taxId !== undefined ? (taxId || null) : undefined,
                address: address !== undefined ? (address || null) : undefined,
                phone: phone !== undefined ? (phone || null) : undefined,
                email: email !== undefined ? (email || null) : undefined,
            },
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}

// DELETE - ลบลูกค้า (ต้องเป็นของ user เท่านั้น)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        // ตรวจสอบว่า customer เป็นของ user นี้
        const existingCustomer = await prisma.customer.findFirst({
            where: { id: params.id, userId },
        });

        if (!existingCustomer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        await prisma.customer.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Customer deleted' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
