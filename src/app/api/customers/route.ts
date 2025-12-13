import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuthUserId, isAuthError } from '@/lib/auth';
import { CustomerSchema, validateInput } from '@/lib/validation';

// GET - ดึงรายการลูกค้าทั้งหมดของ user
export async function GET() {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        const customers = await prisma.customer.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { quotations: true, invoices: true },
                },
            },
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}

// POST - สร้างลูกค้าใหม่
export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        const body = await request.json();

        // Validate input
        const validation = validateInput(CustomerSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const { name, taxId, address, phone, email } = validation.data;

        const customer = await prisma.customer.create({
            data: {
                userId,
                name,
                taxId: taxId || null,
                address: address || null,
                phone: phone || null,
                email: email || null,
            },
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        );
    }
}
