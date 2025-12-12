import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUserId, unauthorizedResponse } from '@/lib/auth';

// GET - ดึงรายการลูกค้าทั้งหมด (ของ user ปัจจุบัน)
export async function GET() {
    try {
        const userId = await getAuthUserId();
        if (!userId) return unauthorizedResponse();

        const customers = await prisma.customer.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        quotations: true,
                        invoices: true,
                    },
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
        const userId = await getAuthUserId();
        if (!userId) return unauthorizedResponse();

        const body = await request.json();
        const { name, taxId, address, phone, email } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

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
