import { useState } from 'react'
import './App.css'

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

function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [docType, setDocType] = useState('quotation');
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
    themeColor: '#059669'
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
    withholding: 'none'
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
    const docId = Date.now();
    setSavedLink(`https://billwai.com/view/${docId}`);
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
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="logo-text">billwai</h1>
              <p className="logo-tagline">เร็ว ง่าย สวย จบใน 1 นาที</p>
            </div>
          </div>
          
          <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>ตั้งค่าข้อมูลของคุณ</h2>
              <button onClick={() => setShowSettings(false)} className="close-btn">✕</button>
            </div>
            
            <div className="form-group">
              <label>ชื่อบริษัท/ชื่อของคุณ</label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                placeholder="เช่น บริษัท ABC จำกัด"
              />
            </div>
            
            <div className="form-group">
              <label>ที่อยู่</label>
              <textarea
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                rows={2}
                placeholder="ที่อยู่ของคุณ"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>โทรศัพท์</label>
                <input
                  type="tel"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  placeholder="081-234-5678"
                />
              </div>
              <div className="form-group">
                <label>อีเมล</label>
                <input
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>เลขประจำตัวผู้เสียภาษี</label>
              <input
                type="text"
                value={companyInfo.taxId}
                onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
                placeholder="0-1234-56789-01-2"
              />
            </div>
            
            <div className="form-group">
              <label>สีธีมเอกสาร</label>
              <div className="color-picker">
                {['#059669', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'].map(color => (
                  <button
                    key={color}
                    onClick={() => setCompanyInfo({...companyInfo, themeColor: color})}
                    className={`color-btn ${companyInfo.themeColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <button onClick={() => setShowSettings(false)} className="btn-primary full-width">
              บันทึก
            </button>
          </div>
        </div>
      )}

      <main className="main-content">
        {/* Document Type Selector */}
        <div className="doc-type-selector">
          {['quotation', 'invoice', 'receipt'].map(type => (
            <button
              key={type}
              onClick={() => setDocType(type)}
              className={`doc-type-btn ${docType === type ? 'active' : ''}`}
            >
              {docTypeLabels[type]}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            onClick={() => setActiveTab('create')}
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          >
            ✏️ สร้างเอกสาร
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          >
            👁️ ดูตัวอย่าง
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="create-form">
            {/* Document Info */}
            <div className="card">
              <h3 className="card-title">
                <span className="card-icon">📋</span>
                ข้อมูลเอกสาร
              </h3>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>เลขที่เอกสาร</label>
                  <input
                    type="text"
                    value={docInfo.docNumber}
                    onChange={(e) => setDocInfo({...docInfo, docNumber: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>วันที่</label>
                  <input
                    type="date"
                    value={docInfo.date}
                    onChange={(e) => setDocInfo({...docInfo, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>วันครบกำหนด</label>
                  <input
                    type="date"
                    value={docInfo.dueDate}
                    onChange={(e) => setDocInfo({...docInfo, dueDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="card">
              <h3 className="card-title">
                <span className="card-icon blue">👤</span>
                ข้อมูลลูกค้า
              </h3>
              <div className="form-group">
                <label>ชื่อลูกค้า/บริษัท</label>
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                  placeholder="ชื่อลูกค้าหรือชื่อบริษัท"
                />
              </div>
              <div className="form-group">
                <label>ที่อยู่</label>
                <textarea
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                  rows={2}
                  placeholder="ที่อยู่สำหรับออกเอกสาร"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>โทรศัพท์</label>
                  <input
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                    placeholder="081-234-5678"
                  />
                </div>
                <div className="form-group">
                  <label>เลขผู้เสียภาษี</label>
                  <input
                    type="text"
                    value={clientInfo.taxId}
                    onChange={(e) => setClientInfo({...clientInfo, taxId: e.target.value})}
                    placeholder="(ถ้ามี)"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card">
              <h3 className="card-title">
                <span className="card-icon amber">📦</span>
                รายการสินค้า/บริการ
              </h3>
              
              {items.map((item, index) => (
                <div key={item.id} className="item-row">
                  <div className="item-number">{index + 1}</div>
                  <div className="item-content">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="รายละเอียดสินค้า/บริการ"
                      className="item-desc"
                    />
                    <div className="item-numbers">
                      <div className="form-group">
                        <label>จำนวน</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="form-group">
                        <label>ราคา/หน่วย (฿)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="item-total">
                      รวม: <span className="amount">฿{formatNumber(item.quantity * item.price)}</span>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(item.id)} className="remove-btn">
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              
              <button onClick={addItem} className="add-item-btn">
                + เพิ่มรายการ
              </button>
            </div>

            {/* Tax Options */}
            <div className="card">
              <h3 className="card-title">
                <span className="card-icon purple">💰</span>
                ตัวเลือกภาษี
              </h3>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={taxOptions.includeVat}
                  onChange={(e) => setTaxOptions({...taxOptions, includeVat: e.target.checked})}
                />
                <span>รวม VAT 7% <small>(สำหรับผู้จด VAT)</small></span>
              </label>
              
              <div className="tax-withholding">
                <p>หักภาษี ณ ที่จ่าย</p>
                <div className="tax-options">
                  {[
                    { value: 'none', label: 'ไม่หัก' },
                    { value: '1', label: '1% (ค่าขนส่ง)' },
                    { value: '3', label: '3% (ค่าบริการ)' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setTaxOptions({...taxOptions, withholding: option.value})}
                      className={`tax-btn ${taxOptions.withholding === option.value ? 'active' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card summary-card" style={{ borderLeftColor: companyInfo.themeColor }}>
              <h3 className="card-title">สรุปยอด</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>ยอดรวมก่อนภาษี</span>
                  <span>฿{formatNumber(totals.subtotal)}</span>
                </div>
                {taxOptions.includeVat && (
                  <div className="summary-row">
                    <span>VAT 7%</span>
                    <span>฿{formatNumber(totals.vat)}</span>
                  </div>
                )}
                {taxOptions.withholding !== 'none' && (
                  <div className="summary-row red">
                    <span>หัก ณ ที่จ่าย {taxOptions.withholding}%</span>
                    <span>-฿{formatNumber(totals.withholdingAmount)}</span>
                  </div>
                )}
                <div className="summary-total" style={{ color: companyInfo.themeColor }}>
                  <span>ยอดสุทธิ</span>
                  <span>฿{formatNumber(totals.netTotal)}</span>
                </div>
                <p className="baht-text">({bahtText(totals.netTotal)})</p>
              </div>
            </div>

            {/* Notes */}
            <div className="card">
              <h3 className="card-title">หมายเหตุ</h3>
              <textarea
                value={docInfo.note}
                onChange={(e) => setDocInfo({...docInfo, note: e.target.value})}
                rows={2}
                placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              />
            </div>

            {/* Action Button */}
            <button onClick={() => setActiveTab('preview')} className="btn-primary full-width">
              👁️ ดูตัวอย่าง
            </button>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-section">
            {/* Action Bar */}
            <div className="action-bar">
              <button onClick={() => window.print()} className="btn-secondary">
                📥 บันทึก PDF
              </button>
              <button onClick={generateShareLink} className="btn-primary">
                🔗 สร้างลิงก์แชร์
              </button>
            </div>

            {savedLink && (
              <div className="share-link-box">
                <p>✅ สร้างลิงก์สำเร็จ!</p>
                <div className="share-link-input">
                  <input type="text" value={savedLink} readOnly />
                  <button onClick={() => navigator.clipboard.writeText(savedLink)}>
                    คัดลอก
                  </button>
                </div>
              </div>
            )}

            {/* Invoice Preview */}
            <div className="invoice-preview">
              {/* Header */}
              <div className="invoice-header" style={{ borderColor: companyInfo.themeColor }}>
                <div>
                  <h1 style={{ color: companyInfo.themeColor }}>{docTypeLabels[docType]}</h1>
                  <p>เลขที่: {docInfo.docNumber}</p>
                </div>
                <div className="company-info">
                  <h2>{companyInfo.name || 'ชื่อบริษัท/ร้านค้า'}</h2>
                  <p>{companyInfo.address}</p>
                  {companyInfo.phone && <p>โทร: {companyInfo.phone}</p>}
                  {companyInfo.email && <p>{companyInfo.email}</p>}
                  {companyInfo.taxId && <p>เลขผู้เสียภาษี: {companyInfo.taxId}</p>}
                </div>
              </div>

              {/* Client & Date */}
              <div className="invoice-meta">
                <div className="meta-box">
                  <p className="meta-label">ลูกค้า</p>
                  <p className="meta-value">{clientInfo.name || '-'}</p>
                  <p>{clientInfo.address}</p>
                  {clientInfo.phone && <p>โทร: {clientInfo.phone}</p>}
                  {clientInfo.taxId && <p>เลขผู้เสียภาษี: {clientInfo.taxId}</p>}
                </div>
                <div className="meta-box">
                  <div className="meta-row">
                    <div>
                      <p className="meta-label">วันที่</p>
                      <p className="meta-value">{new Date(docInfo.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    {docInfo.dueDate && (
                      <div>
                        <p className="meta-label">ครบกำหนด</p>
                        <p className="meta-value">{new Date(docInfo.dueDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="invoice-table">
                <thead style={{ backgroundColor: companyInfo.themeColor }}>
                  <tr>
                    <th>#</th>
                    <th>รายการ</th>
                    <th>จำนวน</th>
                    <th>ราคา/หน่วย</th>
                    <th>รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.description || '-'}</td>
                      <td className="center">{item.quantity}</td>
                      <td className="right">฿{formatNumber(item.price)}</td>
                      <td className="right">฿{formatNumber(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="invoice-totals">
                <div className="totals-box">
                  <div className="total-row">
                    <span>ยอดรวม</span>
                    <span>฿{formatNumber(totals.subtotal)}</span>
                  </div>
                  {taxOptions.includeVat && (
                    <div className="total-row">
                      <span>VAT 7%</span>
                      <span>฿{formatNumber(totals.vat)}</span>
                    </div>
                  )}
                  {taxOptions.withholding !== 'none' && (
                    <div className="total-row red">
                      <span>หัก ณ ที่จ่าย {taxOptions.withholding}%</span>
                      <span>-฿{formatNumber(totals.withholdingAmount)}</span>
                    </div>
                  )}
                  <div className="total-final" style={{ borderColor: companyInfo.themeColor, color: companyInfo.themeColor }}>
                    <span>ยอดสุทธิ</span>
                    <span>฿{formatNumber(totals.netTotal)}</span>
                  </div>
                  <p className="baht-text-preview">({bahtText(totals.netTotal)})</p>
                </div>
              </div>

              {/* Notes */}
              {docInfo.note && (
                <div className="invoice-note">
                  <p className="note-label">หมายเหตุ</p>
                  <p>{docInfo.note}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="signatures">
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <p>ผู้รับเงิน</p>
                  <small>วันที่ ____/____/____</small>
                </div>
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <p>ผู้จ่ายเงิน</p>
                  <small>วันที่ ____/____/____</small>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button onClick={() => setActiveTab('create')} className="btn-secondary full-width">
              ← กลับไปแก้ไข
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>billwai - ระบบออกใบเสนอราคา/ใบแจ้งหนี้สำหรับฟรีแลนซ์ไทย</p>
        <p>เร็ว ง่าย สวย จบใน 1 นาที 🚀</p>
      </footer>
    </div>
  )
}

export default App
