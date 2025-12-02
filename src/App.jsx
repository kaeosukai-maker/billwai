// src/App.jsx
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import { 
  getDocuments, 
  createDocument, 
  updateDocument, 
  deleteDocument,
  generateShareToken,
  generateDocNumber,
  getClients,
  saveClient
} from './lib/supabase'
import { exportPdfFromElement, bahtText, formatNumber, formatThaiDate } from './utils/pdfExport'
import './App.css'

// ============================================
// Main App Component
// ============================================
function AppContent() {
  const { user, profile, loading, signOut, saveProfile, isAuthenticated } = useAuth()
  
  const [activeTab, setActiveTab] = useState('create')
  const [docType, setDocType] = useState('quotation')
  const [savedLink, setSavedLink] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [documents, setDocuments] = useState([])
  const [clients, setClients] = useState([])
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [currentDocId, setCurrentDocId] = useState(null)
  
  // ข้อมูลบริษัท/ฟรีแลนซ์
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    themeColor: '#059669'
  })
  
  // ข้อมูลลูกค้า
  const [clientInfo, setClientInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: ''
  })
  
  // รายการสินค้า/บริการ
  const [items, setItems] = useState([
    { id: 1, description: '', quantity: 1, price: 0 }
  ])
  
  // ตัวเลือกภาษี
  const [taxOptions, setTaxOptions] = useState({
    includeVat: false,
    withholding: 'none'
  })
  
  // ข้อมูลเอกสาร
  const [docInfo, setDocInfo] = useState({
    docNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    note: ''
  })

  // โหลดข้อมูลเมื่อ login
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData()
    }
  }, [isAuthenticated, user])

  // โหลด profile ลง companyInfo
  useEffect(() => {
    if (profile) {
      setCompanyInfo({
        name: profile.name || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        taxId: profile.tax_id || '',
        themeColor: profile.theme_color || '#059669'
      })
    }
  }, [profile])

  // สร้างเลขที่เอกสารใหม่เมื่อเปลี่ยนประเภท
  useEffect(() => {
    if (isAuthenticated && user && !currentDocId) {
      generateNewDocNumber()
    }
  }, [docType, isAuthenticated, user])

  const generateNewDocNumber = async () => {
    if (!user) return
    const newNumber = await generateDocNumber(user.id, docType)
    setDocInfo(prev => ({ ...prev, docNumber: newNumber }))
  }

  const loadUserData = async () => {
    if (!user) return
    
    // โหลดเอกสาร
    const { data: docs } = await getDocuments(user.id)
    setDocuments(docs || [])
    
    // โหลดลูกค้า
    const { data: clientsData } = await getClients(user.id)
    setClients(clientsData || [])
    
    // สร้างเลขที่เอกสารใหม่
    generateNewDocNumber()
  }

  // คำนวณยอดรวม
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const vat = taxOptions.includeVat ? subtotal * 0.07 : 0
    const totalBeforeWithholding = subtotal + vat
    
    let withholdingRate = 0
    if (taxOptions.withholding === '1') withholdingRate = 0.01
    if (taxOptions.withholding === '3') withholdingRate = 0.03
    
    const withholdingAmount = subtotal * withholdingRate
    const netTotal = totalBeforeWithholding - withholdingAmount
    
    return { subtotal, vat, withholdingAmount, withholdingRate, netTotal, totalBeforeWithholding }
  }

  const totals = calculateTotals()

  // เพิ่มรายการ
  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }])
  }

  // ลบรายการ
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  // อัพเดทรายการ
  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // บันทึกเอกสาร
  const saveDocument = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    setSaving(true)
    
    const docData = {
      user_id: user.id,
      doc_type: docType,
      doc_number: docInfo.docNumber,
      doc_date: docInfo.date,
      due_date: docInfo.dueDate || null,
      client_name: clientInfo.name,
      client_address: clientInfo.address,
      client_phone: clientInfo.phone,
      client_tax_id: clientInfo.taxId,
      items: items,
      include_vat: taxOptions.includeVat,
      withholding_tax: taxOptions.withholding,
      subtotal: totals.subtotal,
      vat_amount: totals.vat,
      withholding_amount: totals.withholdingAmount,
      net_total: totals.netTotal,
      note: docInfo.note,
      status: 'draft'
    }

    try {
      if (currentDocId) {
        // อัพเดทเอกสารเดิม
        const { data, error } = await updateDocument(currentDocId, docData)
        if (error) throw error
        setDocuments(docs => docs.map(d => d.id === currentDocId ? data : d))
        alert('บันทึกสำเร็จ!')
      } else {
        // สร้างเอกสารใหม่
        const { data, error } = await createDocument(docData)
        if (error) throw error
        setCurrentDocId(data.id)
        setDocuments(docs => [data, ...docs])
        alert('สร้างเอกสารสำเร็จ!')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // สร้างลิงก์แชร์
  const handleGenerateShareLink = async () => {
    if (!currentDocId) {
      // บันทึกก่อนถ้ายังไม่ได้บันทึก
      await saveDocument()
    }

    if (!currentDocId) {
      alert('กรุณาบันทึกเอกสารก่อน')
      return
    }

    try {
      const { shareToken, error } = await generateShareToken(currentDocId)
      if (error) throw error
      
      const shareUrl = `${window.location.origin}/view/${shareToken}`
      setSavedLink(shareUrl)
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      alert('คัดลอกลิงก์แล้ว!')
    } catch (error) {
      console.error('Share error:', error)
      alert('เกิดข้อผิดพลาด')
    }
  }

  // Export PDF
  const handleExportPdf = async () => {
    setExporting(true)
    try {
      const filename = `${docInfo.docNumber || 'document'}.pdf`
      await exportPdfFromElement('invoice-preview', filename)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('เกิดข้อผิดพลาดในการสร้าง PDF')
    } finally {
      setExporting(false)
    }
  }

  // โหลดเอกสารเก่า
  const loadDocument = (doc) => {
    setCurrentDocId(doc.id)
    setDocType(doc.doc_type)
    setDocInfo({
      docNumber: doc.doc_number,
      date: doc.doc_date,
      dueDate: doc.due_date || '',
      note: doc.note || ''
    })
    setClientInfo({
      name: doc.client_name || '',
      address: doc.client_address || '',
      phone: doc.client_phone || '',
      email: '',
      taxId: doc.client_tax_id || ''
    })
    setItems(doc.items || [{ id: 1, description: '', quantity: 1, price: 0 }])
    setTaxOptions({
      includeVat: doc.include_vat || false,
      withholding: doc.withholding_tax || 'none'
    })
    setShowHistory(false)
    setActiveTab('create')
  }

  // สร้างเอกสารใหม่
  const createNewDocument = () => {
    setCurrentDocId(null)
    setClientInfo({ name: '', address: '', phone: '', email: '', taxId: '' })
    setItems([{ id: 1, description: '', quantity: 1, price: 0 }])
    setTaxOptions({ includeVat: false, withholding: 'none' })
    setDocInfo({
      docNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      note: ''
    })
    setSavedLink('')
    generateNewDocNumber()
  }

  // บันทึก profile
  const handleSaveSettings = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    const { error } = await saveProfile({
      name: companyInfo.name,
      address: companyInfo.address,
      phone: companyInfo.phone,
      email: companyInfo.email,
      tax_id: companyInfo.taxId,
      theme_color: companyInfo.themeColor
    })

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      alert('บันทึกการตั้งค่าสำเร็จ!')
      setShowSettings(false)
    }
  }

  // ลบเอกสาร
  const handleDeleteDocument = async (docId) => {
    if (!confirm('ต้องการลบเอกสารนี้?')) return
    
    const { error } = await deleteDocument(docId)
    if (error) {
      alert('เกิดข้อผิดพลาด')
    } else {
      setDocuments(docs => docs.filter(d => d.id !== docId))
      if (currentDocId === docId) {
        createNewDocument()
      }
    }
  }

  const docTypeLabels = {
    quotation: 'ใบเสนอราคา',
    invoice: 'ใบแจ้งหนี้',
    receipt: 'ใบเสร็จรับเงิน'
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header no-print">
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
          
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <button onClick={() => setShowHistory(true)} className="header-btn">
                  📄 ประวัติ
                </button>
                <button onClick={() => setShowSettings(true)} className="header-btn">
                  ⚙️ ตั้งค่า
                </button>
                <button onClick={signOut} className="header-btn logout">
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn-primary small">
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
            
            <button onClick={handleSaveSettings} className="btn-primary full-width">
              บันทึก
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content history-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 ประวัติเอกสาร</h2>
              <button onClick={() => setShowHistory(false)} className="close-btn">✕</button>
            </div>
            
            <button onClick={() => { createNewDocument(); setShowHistory(false); }} className="btn-primary full-width mb-16">
              + สร้างเอกสารใหม่
            </button>

            {documents.length === 0 ? (
              <div className="empty-state">
                <p>ยังไม่มีเอกสาร</p>
              </div>
            ) : (
              <div className="document-list">
                {documents.map(doc => (
                  <div key={doc.id} className="document-item">
                    <div className="doc-info" onClick={() => loadDocument(doc)}>
                      <div className="doc-type-badge" style={{ backgroundColor: companyInfo.themeColor }}>
                        {docTypeLabels[doc.doc_type]}
                      </div>
                      <div className="doc-details">
                        <p className="doc-number">{doc.doc_number}</p>
                        <p className="doc-client">{doc.client_name || 'ไม่ระบุลูกค้า'}</p>
                        <p className="doc-amount">฿{formatNumber(doc.net_total)}</p>
                        <p className="doc-date">{formatThaiDate(doc.doc_date)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="main-content">
        {/* Document Type Selector */}
        <div className="doc-type-selector no-print">
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
        <div className="tab-nav no-print">
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
              
              {/* Client Select (if has saved clients) */}
              {clients.length > 0 && (
                <div className="form-group">
                  <label>เลือกลูกค้าที่บันทึกไว้</label>
                  <select 
                    onChange={(e) => {
                      const selected = clients.find(c => c.id === e.target.value)
                      if (selected) {
                        setClientInfo({
                          name: selected.name,
                          address: selected.address || '',
                          phone: selected.phone || '',
                          email: selected.email || '',
                          taxId: selected.tax_id || ''
                        })
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">-- เลือกลูกค้า --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

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

            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={saveDocument} className="btn-secondary" disabled={saving}>
                {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
              </button>
              <button onClick={() => setActiveTab('preview')} className="btn-primary">
                👁️ ดูตัวอย่าง
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-section">
            {/* Action Bar */}
            <div className="action-bar no-print">
              <button onClick={handleExportPdf} className="btn-secondary" disabled={exporting}>
                {exporting ? '⏳ กำลังสร้าง...' : '📥 ดาวน์โหลด PDF'}
              </button>
              <button onClick={handleGenerateShareLink} className="btn-primary">
                🔗 สร้างลิงก์แชร์
              </button>
            </div>

            {savedLink && (
              <div className="share-link-box no-print">
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
            <div className="invoice-preview" id="invoice-preview">
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
                      <p className="meta-value">{formatThaiDate(docInfo.date)}</p>
                    </div>
                    {docInfo.dueDate && (
                      <div>
                        <p className="meta-label">ครบกำหนด</p>
                        <p className="meta-value">{formatThaiDate(docInfo.dueDate)}</p>
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
            <button onClick={() => setActiveTab('create')} className="btn-secondary full-width no-print">
              ← กลับไปแก้ไข
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer no-print">
        <p>billwai - ระบบออกใบเสนอราคา/ใบแจ้งหนี้สำหรับฟรีแลนซ์ไทย</p>
        <p>เร็ว ง่าย สวย จบใน 1 นาที 🚀</p>
      </footer>
    </div>
  )
}

// ============================================
// App with AuthProvider
// ============================================
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
