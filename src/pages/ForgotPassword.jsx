import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '','',''])
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [msg, setMsg] = useState({ text: '', color: '' })
  const [loading, setLoading] = useState(false)

  async function sendOtp() {
    if (!phone) { setMsg({ text: '⚠ Enter phone number.', color: '#c23b53' }); return }
    setLoading(true)
    try {
      const data = await api.forgotPassword(phone)
      if (data.success) { setStep(2); setMsg({ text: '✓ OTP sent!', color: '#2e7d32' }) }
      else setMsg({ text: '⚠ ' + data.message, color: '#c23b53' })
    } catch { setMsg({ text: '⚠ Cannot connect.', color: '#c23b53' }) }
    setLoading(false)
  }

  function handleOtp(val, idx) {
    const n = [...otp]; n[idx] = val.replace(/\D/g, '').slice(0, 1); setOtp(n)
    if (val && idx < 5) document.getElementById(`fotp-${idx + 1}`)?.focus()
  }

  function verifyStep() {
    if (otp.join('').length < 6) {
      setMsg({ text: '⚠ Enter all 6 digits.', color: '#c23b53' }); return
    }
    setStep(3); setMsg({ text: '', color: '' })
  }

  async function resetPassword() {
    if (!newPass || newPass !== confirmPass) {
      setMsg({ text: '⚠ Passwords do not match.', color: '#c23b53' }); return
    }
    if (newPass.length < 6) {
      setMsg({ text: '⚠ Minimum 6 characters.', color: '#c23b53' }); return
    }
    setLoading(true)
    try {
      const data = await api.resetPassword(phone, otp.join(''), newPass)
      if (data.success) {
        setMsg({ text: '✓ Password reset! Redirecting...', color: '#2e7d32' })
        setTimeout(() => navigate('/login'), 1500)
      } else setMsg({ text: '⚠ ' + data.message, color: '#c23b53' })
    } catch { setMsg({ text: '⚠ Cannot connect.', color: '#c23b53' }) }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    border: '2px solid #ede5ea', borderRadius: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem', color: 'var(--charcoal)',
    background: 'white', outline: 'none', marginBottom: 22
  }

  const btnStyle = {
    width: '100%', padding: 16,
    background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
    color: 'white', border: 'none', borderRadius: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
    opacity: loading ? 0.7 : 1
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream)', fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ width: '100%', maxWidth: 440, background: 'white',
        borderRadius: 24, padding: 48,
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        animation: 'slideUp 0.5s ease both' }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, background: 'var(--blush)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem' }}>
            {step === 1 ? '🔑' : step === 2 ? '📱' : '🔒'}
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif",
            fontSize: '1.8rem', fontWeight: 900,
            color: 'var(--charcoal)', marginBottom: 8 }}>
            {step === 1 ? 'Forgot Password' :
             step === 2 ? 'Enter OTP' : 'New Password'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            {step === 1 ? 'Enter your registered phone number to receive OTP.' :
             step === 2 ? `We sent a 4-digit code to ${phone}` :
             'Create a new strong password for your account.'}
          </p>
        </div>

        {/* Step bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2,
              background: s <= step ? 'var(--rose)' : '#ede5ea',
              transition: 'background 0.3s' }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700,
              color: 'var(--charcoal)', marginBottom: 8, textTransform: 'uppercase',
              letterSpacing: '0.06em' }}>Phone Number</label>
            <input type="tel" placeholder="+91 99999 00000"
              value={phone} onChange={e => setPhone(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--rose)'}
              onBlur={e => e.target.style.borderColor = '#ede5ea'} />
            <button onClick={sendOtp} disabled={loading} style={btnStyle}>
              {loading ? 'Sending...' : 'Send OTP →'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ display: 'flex', gap: 12,
              justifyContent: 'center', marginBottom: 28 }}>
             {otp.map((d, i) => (
  <input key={i} id={`fotp-${i}`} type="text"
    maxLength={1} value={d}
    onChange={e => handleOtp(e.target.value, i)}
    style={{ width: 52, height: 60,
      border: '2px solid #ede5ea', borderRadius: 14,
      textAlign: 'center', fontSize: '1.4rem',
      fontWeight: 700,
      fontFamily: "'DM Sans', sans-serif",
      color: 'var(--charcoal)', outline: 'none' }}
    onFocus={e => e.target.style.borderColor = 'var(--rose)'}
    onBlur={e => e.target.style.borderColor = '#ede5ea'} />
))} 
            </div>
            <button onClick={verifyStep} style={{ ...btnStyle, marginBottom: 12 }}>
              Verify OTP →
            </button>
            <button onClick={sendOtp} disabled={loading}
              style={{ width: '100%', padding: 12, background: 'none',
                border: '2px solid #ede5ea', borderRadius: 14,
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem',
                fontWeight: 600, color: 'var(--muted)', cursor: 'pointer' }}>
              {loading ? 'Resending...' : 'Resend OTP'}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700,
              color: 'var(--charcoal)', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              New Password
            </label>
            <input type="password" placeholder="Enter new password"
              value={newPass} onChange={e => setNewPass(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--rose)'}
              onBlur={e => e.target.style.borderColor = '#ede5ea'} />
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700,
              color: 'var(--charcoal)', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Confirm Password
            </label>
            <input type="password" placeholder="Confirm new password"
              value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--rose)'}
              onBlur={e => e.target.style.borderColor = '#ede5ea'} />
            <button onClick={resetPassword} disabled={loading} style={btnStyle}>
              {loading ? 'Resetting...' : 'Reset Password ✓'}
            </button>
          </>
        )}

        {msg.text && (
          <p style={{ textAlign: 'center', marginTop: 16,
            fontWeight: 600, fontSize: '0.88rem', color: msg.color }}>
            {msg.text}
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: 24,
          fontSize: '0.88rem', color: 'var(--muted)' }}>
          <Link to="/login" style={{ color: 'var(--rose)',
            fontWeight: 700, textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}