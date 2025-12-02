// src/utils/pdfExport.js
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// ฟังก์ชันแปลงตัวเลขเป็นคำอ่านภาษาไทย
export const bahtText = (number) => {
  const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const thaiUnits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']
  
  if (number === 0) return 'ศูนย์บาทถ้วน'
  if (number < 0) return 'ลบ' + bahtText(Math.abs(number))
  
  const num = Math.abs(number)
  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)
  
  const convertGroup = (n) => {
    if (n === 0) return ''
    let result = ''
    const str = n.toString()
    const len = str.length
    
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i])
      const unit = len - i - 1
      
      if (digit !== 0) {
        if (unit === 1 && digit === 2) {
          result += 'ยี่สิบ'
        } else if (unit === 1 && digit === 1) {
          result += 'สิบ'
        } else if (unit === 0 && digit === 1 && len > 1) {
          result += 'เอ็ด'
        } else {
          result += thaiNumbers[digit] + thaiUnits[unit]
        }
      }
    }
    return result
  }
  
  let result = ''
  
  if (intPart >= 1000000) {
    const millions = Math.floor(intPart / 1000000)
    result += convertGroup(millions) + 'ล้าน'
    const remainder = intPart % 1000000
    if (remainder > 0) {
      result += convertGroup(remainder)
    }
  } else {
    result = convertGroup(intPart)
  }
  
  result += 'บาท'
  
  if (decPart === 0) {
    result += 'ถ้วน'
  } else {
    result += convertGroup(decPart) + 'สตางค์'
  }
  
  return result
}

// Format number
export const formatNumber = (num) => {
  return new Intl.NumberFormat('th-TH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(num)
}

// Format date ภาษาไทย
export const formatThaiDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// ============================================
// วิธีที่ 1: Export PDF จาก HTML Element (แนะนำ)
// ใช้ html2canvas + jsPDF
// ============================================
export const exportPdfFromElement = async (elementId, filename = 'document.pdf') => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Element not found')
  }

  try {
    // แสดง loading (ถ้ามี)
    const loadingEl = document.createElement('div')
    loadingEl.id = 'pdf-loading'
    loadingEl.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">
        <div style="background:white;padding:24px 48px;border-radius:12px;text-align:center;">
          <div style="font-size:24px;margin-bottom:8px;">⏳</div>
          <div>กำลังสร้าง PDF...</div>
        </div>
      </div>
    `
    document.body.appendChild(loadingEl)

    // สร้าง canvas จาก HTML element
    const canvas = await html2canvas(element, {
      scale: 2, // เพิ่มความคมชัด
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // คำนวณขนาด
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // สร้าง PDF
    const pdf = new jsPDF({
      orientation: imgHeight > 297 ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // ถ้าความสูงมากกว่า A4 ต้องแบ่งหน้า
    const pageHeight = 297
    let heightLeft = imgHeight
    let position = 0

    // หน้าแรก
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    )
    heightLeft -= pageHeight

    // หน้าถัดไป (ถ้ามี)
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      )
      heightLeft -= pageHeight
    }

    // ดาวน์โหลด
    pdf.save(filename)

    // ลบ loading
    document.body.removeChild(loadingEl)

    return { success: true }
  } catch (error) {
    console.error('PDF export error:', error)
    // ลบ loading ถ้ามี
    const loadingEl = document.getElementById('pdf-loading')
    if (loadingEl) document.body.removeChild(loadingEl)
    return { success: false, error }
  }
}

// ============================================
// วิธีที่ 2: สร้าง PDF แบบ Manual (รองรับภาษาไทย)
// ต้องใช้ font ภาษาไทย
// ============================================
export const createPdfManual = async (documentData) => {
  const {
    docType,
    docNumber,
    docDate,
    dueDate,
    company,
    client,
    items,
    taxOptions,
    totals,
    note,
    themeColor = '#059669'
  } = documentData

  const docTypeLabels = {
    quotation: 'ใบเสนอราคา',
    invoice: 'ใบแจ้งหนี้',
    receipt: 'ใบเสร็จรับเงิน'
  }

  // สร้าง PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Note: jsPDF ไม่รองรับภาษาไทยโดยตรง
  // ต้องใช้ font ภาษาไทย (THSarabunNew หรือ Prompt)
  // สำหรับตอนนี้ใช้วิธี html2canvas แทน

  // แนะนำให้ใช้ exportPdfFromElement() แทน
  console.warn('createPdfManual: Use exportPdfFromElement() for Thai language support')
  
  return { success: false, error: 'Use exportPdfFromElement() instead' }
}

// ============================================
// วิธีที่ 3: ใช้ window.print() (ง่ายที่สุด)
// ============================================
export const printDocument = () => {
  window.print()
}

// ============================================
// Helper: เตรียม element สำหรับ export PDF
// ============================================
export const preparePdfElement = (elementId) => {
  const element = document.getElementById(elementId)
  if (!element) return null

  // ซ่อนปุ่มต่างๆ ก่อน export
  const buttonsToHide = element.querySelectorAll('.no-print')
  buttonsToHide.forEach(btn => btn.style.display = 'none')

  return () => {
    // แสดงปุ่มกลับมา
    buttonsToHide.forEach(btn => btn.style.display = '')
  }
}
