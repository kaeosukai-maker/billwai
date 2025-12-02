// src/components/AuthModal.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { signIn, signUp } = useAuth()

  if (!isOpen) return null

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setError('')
    setSuccess('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        } else {
          setError(error.message)
        }
      } else {
        resetForm()
        onClose()
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, fullName)
      if (error) {
        if (error.message.includes('already registered')) {
          setError('อีเมลนี้ถูกใช้งานแล้ว')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี')
        // บาง Supabase project อาจไม่ต้องยืนยันอีเมล
        // ถ้าเป็นแบบนั้น จะ login อัตโนมัติ
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="logo-text">billwai</h2>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); resetForm(); }}
            >
              เข้าสู่ระบบ
            </button>
            <button 
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); resetForm(); }}
            >
              สมัครสมาชิก
            </button>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button 
              type="button" 
              className="forgot-link"
              onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
            >
              ลืมรหัสผ่าน?
            </button>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="ชื่อของคุณ"
                required
              />
            </div>

            <div className="form-group">
              <label>อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label>ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <h3 className="forgot-title">รีเซ็ตรหัสผ่าน</h3>
            <p className="forgot-desc">กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้</p>

            <div className="form-group">
              <label>อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต'}
            </button>

            <button 
              type="button" 
              className="back-link"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
