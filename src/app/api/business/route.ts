import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - ดึงข้อมูลธุรกิจ
export async function GET() {
    try {
        const business = await prisma.business.findFirst();
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
        const body = await request.json();
        const { name, taxId, address, phone, email, logo, bankName, bankAccount, bankAccountName } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Business name is required' },
                { status: 400 }
            );
        }

        // ตรวจสอบว่ามีข้อมูลธุรกิจอยู่แล้วหรือไม่
        const existingBusiness = await prisma.business.findFirst();

        let business;
        if (existingBusiness) {
            // อัปเดตข้อมูลที่มีอยู่
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
            // สร้างข้อมูลใหม่
            business = await prisma.business.create({
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
