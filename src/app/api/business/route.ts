import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuthUserId, isAuthError } from '@/lib/auth';
import { BusinessSchema, validateInput } from '@/lib/validation';

// GET - ดึงข้อมูลธุรกิจของ user
export async function GET() {
    try {
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        const business = await prisma.business.findFirst({
            where: { userId }
        });

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
        const authResult = await requireAuthUserId();
        if (isAuthError(authResult)) return authResult;
        const userId = authResult;

        const body = await request.json();

        // Validate input
        const validation = validateInput(BusinessSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const { name, taxId, address, phone, email, logo, bankName, bankAccount, bankAccountName } = validation.data;

        // หา business ที่มีอยู่ของ user นี้
        const existingBusiness = await prisma.business.findFirst({
            where: { userId }
        });

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
                    userId,
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
