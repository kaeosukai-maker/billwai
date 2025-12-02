// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// ⚠️ แก้ไขค่านี้ให้ตรงกับโปรเจกต์ Supabase ของคุณ
// หาได้จาก: Supabase Dashboard > Settings > API
const supabaseUrl = 'https://ieygekttfioggutcvohq.supabase.co'  // เช่น https://xxxxx.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlleWdla3R0ZmlvZ2d1dGN2b2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDUzMjgsImV4cCI6MjA3OTk4MTMyOH0.LE47ndbrGoR9u-cJIiGNUq0K_yWkjFj8qy8tOBODyHY'  // เช่น eyJhbGciOiJIUzI1...

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// Authentication Functions
// ============================================

// สมัครสมาชิก
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  return { data, error }
}

// เข้าสู่ระบบ
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// ออกจากระบบ
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// ดึงข้อมูลผู้ใช้ปัจจุบัน
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// ดึง session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// ============================================
// Profile Functions
// ============================================

// ดึงข้อมูล profile
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

// อัพเดท profile
export const updateProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ 
      id: userId, 
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  return { data, error }
}

// ============================================
// Client Functions (ข้อมูลลูกค้า)
// ============================================

// ดึงลูกค้าทั้งหมด
export const getClients = async (userId) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// สร้างลูกค้าใหม่ (เปลี่ยนชื่อจาก createClient เป็น saveClient)
export const saveClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single()
  return { data, error }
}

// อัพเดทลูกค้า
export const updateClient = async (clientId, clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...clientData, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .select()
    .single()
  return { data, error }
}

// ลบลูกค้า
export const deleteClient = async (clientId) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
  return { error }
}

// ============================================
// Document Functions (เอกสาร)
// ============================================

// ดึงเอกสารทั้งหมด
export const getDocuments = async (userId, docType = null) => {
  let query = supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (docType) {
    query = query.eq('doc_type', docType)
  }
  
  const { data, error } = await query
  return { data, error }
}

// ดึงเอกสารตาม ID
export const getDocumentById = async (docId) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', docId)
    .single()
  return { data, error }
}

// ดึงเอกสารตาม share token (สำหรับ public view)
export const getDocumentByShareToken = async (shareToken) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('share_token', shareToken)
    .single()
  return { data, error }
}

// สร้างเอกสารใหม่
export const createDocument = async (docData) => {
  const { data, error } = await supabase
    .from('documents')
    .insert(docData)
    .select()
    .single()
  return { data, error }
}

// อัพเดทเอกสาร
export const updateDocument = async (docId, docData) => {
  const { data, error } = await supabase
    .from('documents')
    .update({ ...docData, updated_at: new Date().toISOString() })
    .eq('id', docId)
    .select()
    .single()
  return { data, error }
}

// ลบเอกสาร
export const deleteDocument = async (docId) => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId)
  return { error }
}

// สร้าง share token
export const generateShareToken = async (docId) => {
  const shareToken = crypto.randomUUID()
  const { data, error } = await supabase
    .from('documents')
    .update({ share_token: shareToken })
    .eq('id', docId)
    .select()
    .single()
  return { data, error, shareToken }
}

// ============================================
// สร้างเลขที่เอกสารอัตโนมัติ
// ============================================
export const generateDocNumber = async (userId, docType) => {
  const prefix = {
    quotation: 'QT',
    invoice: 'INV',
    receipt: 'RC'
  }[docType] || 'DOC'
  
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  
  // นับจำนวนเอกสารในเดือนนี้
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
  
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('doc_type', docType)
    .gte('created_at', startOfMonth)
    .lte('created_at', endOfMonth)
  
  const nextNumber = (count || 0) + 1
  return `${prefix}-${yearMonth}${String(nextNumber).padStart(3, '0')}`
}
