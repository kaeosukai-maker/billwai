import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOptionalUserId } from '@/lib/auth';

// GET - ดึงข้อมูลธุรกิจ
export async function GET() {
    try {
        const userId = await getOptionalUserId();

        // ถ้า login แล้วดึงของ user, ถ้าไม่ login ดึงอันแรก (สำหรับ demo)
        const business = userId
            ? await prisma.business.findFirst({ where: { userId } })
            : await prisma.business.findFirst({ orderBy: { createdAt: 'desc' } });

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

        // หา business ที่มีอยู่
        const existingBusiness = userId
            ? await prisma.business.findFirst({ where: { userId } })
            : await prisma.business.findFirst({ orderBy: { createdAt: 'desc' } });

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
                    userId: userId || 'anonymous',
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
