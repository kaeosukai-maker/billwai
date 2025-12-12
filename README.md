# BillWai - ระบบทำบิลและใบเสนอราคา

ระบบจัดการใบเสนอราคาและใบแจ้งหนี้สำหรับฟรีแลนซ์ไทย

## ✨ Features

- 📝 สร้างใบเสนอราคา (Quotation)
- 🧾 สร้างใบแจ้งหนี้ (Invoice)
- 👥 จัดการลูกค้า
- 💰 คำนวณ VAT 7% อัตโนมัติ
- 📊 ภาษีหัก ณ ที่จ่าย 1-5%
- 🔢 เลขที่เอกสารอัตโนมัติ
- 🖨️ พิมพ์เอกสาร
- 🌙 Dark Mode

## 🚀 Getting Started

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. สร้าง Database

```bash
npm run db:push
```

### 3. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📁 Project Structure

```
billwai/
├── prisma/           # Database schema
├── src/
│   ├── app/          # Pages & API routes
│   ├── components/   # React components
│   ├── lib/          # Utilities
│   └── types/        # TypeScript types
└── public/           # Static files
```

## 📝 License

MIT
