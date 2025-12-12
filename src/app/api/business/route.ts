import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOptionalUserId } from '@/lib/auth';

// GET - ดึงข้อมูลธุรกิจ
export async function GET() {
    try {
        const userId = await getOptionalUserId();
        const where = userId ? { userId } : { userId: null };

        const business = await prisma.business.findFirst({ where });
        return NextResponse.json(business || null);
    } catch (error) {
        console.error('Error fetching business:', error);
        return NextResponse.json(
            { error: 'Failed to fetch business' },
            { status: 500 }
        );
    }
}

// POST/PUT - สร้างหรืออัปเดตข้อมูลธุรกิจ
export async function POST(request: NextRequest) {
    try {
        const userId = await getOptionalUserId();
        const body = await request.json();
        const { name, taxId, address, phone, email, logo, bankName, bankAccount, bankAccountName } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Business name is required' },
                { status: 400 }
            );
        }

        const where = userId ? { userId } : { userId: null };
        const existingBusiness = await prisma.business.findFirst({ where });

        let business;
        if (existingBusiness) {
            business = await prisma.business.update({
                where: { id: existingBusiness.id },
                data: {
                    name,
                    taxId: taxId || null,
                    address: address || null,
                    phone: phone || null,
                    email: email || null,
                    logo: logo || null,
                    bankName: bankName || null,
                    bankAccount: bankAccount || null,
                    bankAccountName: bankAccountName || null,
                },
            });
        } else {
            business = await prisma.business.create({
                data: {
                    userId: userId || undefined,
                    name,
                    taxId: taxId || null,
                    address: address || null,
                    phone: phone || null,
                    email: email || null,
                    logo: logo || null,
                    bankName: bankName || null,
                    bankAccount: bankAccount || null,
                    bankAccountName: bankAccountName || null,
                },
            });
        }

        return NextResponse.json(business);
    } catch (error) {
        console.error('Error saving business:', error);
        return NextResponse.json(
            { error: 'Failed to save business' },
            { status: 500 }
        );
    }
}
