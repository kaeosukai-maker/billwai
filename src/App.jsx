import React, { useState, useRef } from 'react';

// ฟังก์ชันแปลงตัวเลขเป็นคำอ่านภาษาไทย (BahtText)
const bahtText = (number) => {
  const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const thaiUnits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  
  if (number === 0) return 'ศูนย์บาทถ้วน';
  if (number < 0) return 'ลบ' + bahtText(Math.abs(number));
  
  const num = Math.abs(number);
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  
  const convertGroup = (n) => {
    if (n === 0) return '';
    let result = '';
    const str = n.toString();
    const len = str.length;
    
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const unit = len - i - 1;
      
      if (digit !== 0) {
        if (unit === 1 && digit === 2) {
          result += 'ยี่สิบ';
        } else if (unit === 1 && digit === 1) {
          result += 'สิบ';
        } else if (unit === 0 && digit === 1 && len > 1) {
          result += 'เอ็ด';
        } else {
          result += thaiNumbers[digit] + thaiUnits[unit];
        }
      }
    }
    return result;
  };
  
  let result = '';
  
  if (intPart >= 1000000) {
    const millions = Math.floor(intPart / 1000000);
    result += convertGroup(millions) + 'ล้าน';
    const remainder = intPart % 1000000;
    if (remainder > 0) {
      result += convertGroup(remainder);
    }
  } else {
    result = convertGroup(intPart);
  }
  
  result += 'บาท';
  
  if (decPart === 0) {
    result += 'ถ้วน';
  } else {
    result += convertGroup(decPart) + 'สตางค์';
  }
  
  return result;
};

// ข้อมูล mock สำหรับ Supabase
const mockSupabase = {
  documents: [],
  saveDocument: (doc) => {
    const newDoc = { ...doc, id: Date.now(), created_at: new Date().toISOString() };
    mockSupabase.documents.push(newDoc);
    return newDoc;
  }
};

export default function ThaiInvoiceApp() {
  const [activeTab, setActiveTab] = useState('create');
  const [docType, setDocType] = useState('quotation');
  const [showPreview, setShowPreview] = useState(false);
  const [savedLink, setSavedLink] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // ข้อมูลบริษัท/ฟรีแลนซ์
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    logo: null,
    themeColor: '#2563eb'
  });
  
  // ข้อมูลลูกค้า
  const [clientInfo, setClientInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: ''
  });
  
  // รายการสินค้า/บริการ
  const [items, setItems] = useState([
    { id: 1, description: '', quantity: 1, price: 0 }
  ]);
  
  // ตัวเลือกภาษี
  const [taxOptions, setTaxOptions] = useState({
    includeVat: false,
    withholding: 'none' // none, 1, 3
  });
  
  // ข้อมูลเอกสาร
  const [docInfo, setDocInfo] = useState({
    docNumber: `QT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}001`,
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    note: ''
  });

  // คำนวณยอดรวม
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const vat = taxOptions.includeVat ? subtotal * 0.07 : 0;
    const totalBeforeWithholding = subtotal + vat;
    
    let withholdingRate = 0;
    if (taxOptions.withholding === '1') withholdingRate = 0.01;
    if (taxOptions.withholding === '3') withholdingRate = 0.03;
    
    const withholdingAmount = subtotal * withholdingRate;
    const netTotal = totalBeforeWithholding - withholdingAmount;
    
    return { subtotal, vat, withholdingAmount, withholdingRate, netTotal, totalBeforeWithholding };
  };

  const totals = calculateTotals();

  // เพิ่มรายการ
  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
  };

  // ลบรายการ
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // อัพเดทรายการ
  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // สร้างลิงก์แชร์
  const generateShareLink = () => {
    const doc = mockSupabase.saveDocument({
      type: docType,
      company: companyInfo,
      client: clientInfo,
      items,
      taxOptions,
      docInfo,
      totals
    });
    setSavedLink(`https://invoice.app/view/${doc.id}`);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const docTypeLabels = {
    quotation: 'ใบเสนอราคา',
    invoice: 'ใบแจ้งหนี้',
    receipt: 'ใบเสร็จรับเงิน'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Prompt', sans-serif;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #059669 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          ring: 2px;
          ring-color: #059669;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
        }
        
        .tab-active {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
        }
        
        .invoice-preview {
          background: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        
        @media print {
          .no-print { display: none !important; }
          .invoice-preview { box-shadow: none; }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-gray-100 no-print">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">billwai</h1>
              <p className="text-xs text-gray-500">เร็ว ง่าย สวย จบใน 1 นาที</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 no-print">
          <div className="glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">ตั้งค่าข้อมูลของคุณ</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท/ชื่อของคุณ</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="เช่น บริษัท ABC จำกัด"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                  <textarea
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    rows={2}
                    placeholder="ที่อยู่ของคุณ"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">โทรศัพท์</label>
                    <input
                      type="tel"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="081-234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                  <input
                    type="text"
                    value={companyInfo.taxId}
                    onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="0-1234-56789-01-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สีธีมเอกสาร</label>
                  <div className="flex gap-3">
                    {['#059669', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'].map(color => (
                      <button
                        key={color}
                        onClick={() => setCompanyInfo({...companyInfo, themeColor: color})}
                        className={`w-10 h-10 rounded-xl transition-transform ${companyInfo.themeColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 py-3 btn-primary text-white font-medium rounded-xl"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Document Type Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-print">
          {['quotation', 'invoice', 'receipt'].map(type => (
            <button
              key={type}
              onClick={() => setDocType(type)}
              className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                docType === type 
                  ? 'tab-active shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {docTypeLabels[type]}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 no-print">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'create' ? 'bg-white shadow-lg text-emerald-600' : 'text-gray-500 hover:bg-white/50'
            }`}
          >
            ✏️ สร้างเอกสาร
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'preview' ? 'bg-white shadow-lg text-emerald-600' : 'text-gray-500 hover:bg-white/50'
            }`}
          >
            👁️ ดูตัวอย่าง
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="space-y-4">
            {/* Document Info */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">📋</span>
                ข้อมูลเอกสาร
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">เลขที่เอกสาร</label>
                  <input
                    type="text"
                    value={docInfo.docNumber}
                    onChange={(e) => setDocInfo({...docInfo, docNumber: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">วันที่</label>
                  <input
                    type="date"
                    value={docInfo.date}
                    onChange={(e) => setDocInfo({...docInfo, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">วันครบกำหนด</label>
                  <input
                    type="date"
                    value={docInfo.dueDate}
                    onChange={(e) => setDocInfo({...docInfo, dueDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">👤</span>
                ข้อมูลลูกค้า
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อลูกค้า/บริษัท</label>
                  <input
                    type="text"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                    placeholder="ชื่อลูกค้าหรือชื่อบริษัท"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">ที่อยู่</label>
                  <textarea
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                    rows={2}
                    placeholder="ที่อยู่สำหรับออกเอกสาร"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">โทรศัพท์</label>
                    <input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                      placeholder="081-234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">เลขผู้เสียภาษี</label>
                    <input
                      type="text"
                      value={clientInfo.taxId}
                      onChange={(e) => setClientInfo({...clientInfo, taxId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                      placeholder="(ถ้ามี)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">📦</span>
                รายการสินค้า/บริการ
              </h3>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                          placeholder="รายละเอียดสินค้า/บริการ"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">จำนวน</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">ราคาต่อหน่วย (฿)</label>
                            <input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                            />
                          </div>
                        </div>
                        <div className="text-right text-sm font-medium text-gray-600">
                          รวม: <span className="text-emerald-600">฿{formatNumber(item.quantity * item.price)}</span>
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={addItem}
                className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
              >
                + เพิ่มรายการ
              </button>
            </div>

            {/* Tax Options */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">💰</span>
                ตัวเลือกภาษี
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxOptions.includeVat}
                    onChange={(e) => setTaxOptions({...taxOptions, includeVat: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">รวม VAT 7% <span className="text-gray-400 text-sm">(สำหรับผู้จด VAT)</span></span>
                </label>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">หักภาษี ณ ที่จ่าย</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'none', label: 'ไม่หัก' },
                      { value: '1', label: '1% (ค่าขนส่ง)' },
                      { value: '3', label: '3% (ค่าบริการ)' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setTaxOptions({...taxOptions, withholding: option.value})}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          taxOptions.withholding === option.value
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-5" style={{ borderLeft: `4px solid ${companyInfo.themeColor}` }}>
              <h3 className="font-semibold text-gray-800 mb-4">สรุปยอด</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดรวมก่อนภาษี</span>
                  <span>฿{formatNumber(totals.subtotal)}</span>
                </div>
                {taxOptions.includeVat && (
                  <div className="flex justify-between text-gray-600">
                    <span>VAT 7%</span>
                    <span>฿{formatNumber(totals.vat)}</span>
                  </div>
                )}
                {taxOptions.withholding !== 'none' && (
                  <div className="flex justify-between text-red-500">
                    <span>หัก ณ ที่จ่าย {taxOptions.withholding}%</span>
                    <span>-฿{formatNumber(totals.withholdingAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xl font-bold" style={{ color: companyInfo.themeColor }}>
                    <span>ยอดสุทธิ</span>
                    <span>฿{formatNumber(totals.netTotal)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 text-right">
                    ({bahtText(totals.netTotal)})
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-3">หมายเหตุ</h3>
              <textarea
                value={docInfo.note}
                onChange={(e) => setDocInfo({...docInfo, note: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                rows={2}
                placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('preview')}
                className="flex-1 py-4 btn-primary text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                ดูตัวอย่าง
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div>
            {/* Action Bar */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-white rounded-xl font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                บันทึก PDF
              </button>
              <button
                onClick={generateShareLink}
                className="px-5 py-2.5 btn-primary text-white rounded-xl font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                สร้างลิงก์แชร์
              </button>
            </div>

            {savedLink && (
              <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 no-print">
                <p className="text-sm text-emerald-700 font-medium mb-2">✅ สร้างลิงก์สำเร็จ!</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={savedLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white rounded-lg text-sm border border-emerald-200"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(savedLink)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
                  >
                    คัดลอก
                  </button>
                </div>
              </div>
            )}

            {/* Invoice Preview */}
            <div className="invoice-preview rounded-2xl overflow-hidden">
              <div className="p-6 md:p-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8 pb-6 border-b-2" style={{ borderColor: companyInfo.themeColor }}>
                  <div>
                    <h1 className="text-3xl font-bold mb-1" style={{ color: companyInfo.themeColor }}>
                      {docTypeLabels[docType]}
                    </h1>
                    <p className="text-gray-500">เลขที่: {docInfo.docNumber}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">{companyInfo.name || 'ชื่อบริษัท/ร้านค้า'}</h2>
                    <p className="text-gray-600 text-sm whitespace-pre-line">{companyInfo.address}</p>
                    {companyInfo.phone && <p className="text-gray-600 text-sm">โทร: {companyInfo.phone}</p>}
                    {companyInfo.email && <p className="text-gray-600 text-sm">{companyInfo.email}</p>}
                    {companyInfo.taxId && <p className="text-gray-600 text-sm">เลขผู้เสียภาษี: {companyInfo.taxId}</p>}
                  </div>
                </div>

                {/* Client & Date Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">ลูกค้า</p>
                    <p className="font-semibold text-gray-800">{clientInfo.name || '-'}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{clientInfo.address}</p>
                    {clientInfo.phone && <p className="text-sm text-gray-600">โทร: {clientInfo.phone}</p>}
                    {clientInfo.taxId && <p className="text-sm text-gray-600">เลขผู้เสียภาษี: {clientInfo.taxId}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">วันที่</p>
                        <p className="font-medium text-gray-800">{new Date(docInfo.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      {docInfo.dueDate && (
                        <div>
                          <p className="text-sm text-gray-500">ครบกำหนด</p>
                          <p className="font-medium text-gray-800">{new Date(docInfo.dueDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: companyInfo.themeColor }}>
                        <th className="py-3 px-4 text-left text-white font-medium rounded-tl-lg">#</th>
                        <th className="py-3 px-4 text-left text-white font-medium">รายการ</th>
                        <th className="py-3 px-4 text-center text-white font-medium">จำนวน</th>
                        <th className="py-3 px-4 text-right text-white font-medium">ราคา/หน่วย</th>
                        <th className="py-3 px-4 text-right text-white font-medium rounded-tr-lg">รวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                          <td className="py-3 px-4 text-gray-800">{item.description || '-'}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                          <td className="py-3 px-4 text-right text-gray-600">฿{formatNumber(item.price)}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-800">฿{formatNumber(item.quantity * item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-full md:w-80">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between">
                        <span>ยอดรวม</span>
                        <span>฿{formatNumber(totals.subtotal)}</span>
                      </div>
                      {taxOptions.includeVat && (
                        <div className="flex justify-between">
                          <span>VAT 7%</span>
                          <span>฿{formatNumber(totals.vat)}</span>
                        </div>
                      )}
                      {taxOptions.withholding !== 'none' && (
                        <div className="flex justify-between text-red-500">
                          <span>หัก ณ ที่จ่าย {taxOptions.withholding}%</span>
                          <span>-฿{formatNumber(totals.withholdingAmount)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t-2" style={{ borderColor: companyInfo.themeColor }}>
                      <div className="flex justify-between text-xl font-bold" style={{ color: companyInfo.themeColor }}>
                        <span>ยอดสุทธิ</span>
                        <span>฿{formatNumber(totals.netTotal)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 text-right">
                        ({bahtText(totals.netTotal)})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {docInfo.note && (
                  <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-1">หมายเหตุ</p>
                    <p className="text-amber-700">{docInfo.note}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200 grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="border-b border-gray-300 pb-2 mb-2 w-48 mx-auto"></div>
                    <p className="text-gray-500 text-sm">ผู้รับเงิน</p>
                    <p className="text-gray-400 text-xs">วันที่ ____/____/____</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-300 pb-2 mb-2 w-48 mx-auto"></div>
                    <p className="text-gray-500 text-sm">ผู้จ่ายเงิน</p>
                    <p className="text-gray-400 text-xs">วันที่ ____/____/____</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('create')}
              className="mt-4 w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors no-print"
            >
              ← กลับไปแก้ไข
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-400 text-sm no-print">
        <p>billwai - ระบบออกใบเสนอราคา/ใบแจ้งหนี้สำหรับฟรีแลนซ์ไทย</p>
        <p className="mt-1">เร็ว ง่าย สวย จบใน 1 นาที 🚀</p>
      </footer>
    </div>
  );
}
