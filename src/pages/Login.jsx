import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [otpMode, setOtpMode] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '','',''])
  const [msg, setMsg] = useState({ text: '', color: '' })
  const [loading, setLoading] = useState(false)

  async function loginUser() {
    if (!phone || !password) {
      setMsg({ text: '⚠ Enter phone and password.', color: '#c23b53' })
      return
    }
    setLoading(true)
    try {
      const data = await api.login(phone, password)
      if (data.success) {
        localStorage.setItem('safeher_username', data.name)
        localStorage.setItem('safeher_userId', data.userId)
        if (data.emergencyContact) {
          localStorage.setItem('safeher_contacts', JSON.stringify([
            { name: 'Emergency Contact', phone: data.emergencyContact, tag: 'Primary' }
          ]))
        }
        setMsg({ text: '✓ Login Successful! Redirecting...', color: '#2e7d32' })
        setTimeout(() => navigate('/dashboard'), 1400)
      } else {
        setMsg({ text: '⚠ ' + data.message, color: '#c23b53' })
      }
    } catch {
      setMsg({ text: '⚠ Cannot connect to server.', color: '#c23b53' })
    }
    setLoading(false)
  }

  async function sendOtp() {
    if (!phone) {
      setMsg({ text: '⚠ Enter phone number first.', color: '#c23b53' })
      return
    }
    setLoading(true)
    try {
      const data = await api.sendOtp(phone)
      if (data.success) {
        setOtpMode(true)
        setMsg({ text: '✓ OTP sent to your phone!', color: '#2e7d32' })
      } else {
        setMsg({ text: '⚠ ' + data.message, color: '#c23b53' })
      }
    } catch {
      setMsg({ text: '⚠ Cannot connect to server.', color: '#c23b53' })
    }
    setLoading(false)
  }

  async function verifyOtp() {
    const otpStr = otp.join('')
    if (otpStr.length < 6) {
      setMsg({ text: '⚠ Enter 6-digit OTP.', color: '#c23b53' })
      return
    }
    setLoading(true)
    try {
      const data = await api.verifyOtp(phone, otpStr)
      if (data.success) {
        localStorage.setItem('safeher_username', data.name)
        localStorage.setItem('safeher_userId', data.userId)
        setMsg({ text: '✓ OTP Verified! Redirecting...', color: '#2e7d32' })
        setTimeout(() => navigate('/dashboard'), 1400)
      } else {
        setMsg({ text: '⚠ ' + data.message, color: '#c23b53' })
      }
    } catch {
      setMsg({ text: '⚠ Cannot connect to server.', color: '#c23b53' })
    }
    setLoading(false)
  }

  function handleOtpInput(val, idx) {
    const newOtp = [...otp]
    newOtp[idx] = val.replace(/\D/g, '').slice(0, 1)
    setOtp(newOtp)
    if (val && idx < 5)
      document.getElementById(`otp-${idx + 1}`)?.focus()
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #ede5ea',
    borderRadius: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem',
    color: 'var(--charcoal)',
    background: 'white',
    outline: 'none'
  }

  const btnPrimary = {
    width: '100%', padding: 16,
    background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
    color: 'white', border: 'none', borderRadius: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '1rem', fontWeight: 700,
    cursor: 'pointer', marginBottom: 14,
    boxShadow: '0 6px 24px rgba(232,82,106,0.4)',
    opacity: loading ? 0.7 : 1
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex',
      fontFamily: "'DM Sans', sans-serif",
      background: 'var(--cream)' }}>

      {/* Left Panel */}
      <div style={{
        width: '45%',
        background: 'linear-gradient(145deg,#1e1b2e,#2d2440,#3b1f35)',
        position: 'relative', display: 'flex',
        flexDirection: 'column', justifyContent: 'center',
        padding: 60, overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(232,82,106,0.12)' }} />

        <div style={{ display: 'flex', alignItems: 'center',
          gap: 14, marginBottom: 50,
          position: 'relative', zIndex: 1 }}>
          <div style={{ width: 48, height: 48,
            background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
            borderRadius: 14, display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif",
            fontSize: '1.6rem', fontWeight: 900, color: 'white' }}>
            SafeHer
          </span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif",
          fontSize: '3rem', fontWeight: 900, color: 'white',
          lineHeight: 1.1, marginBottom: 18,
          position: 'relative', zIndex: 1 }}>
          Welcome<br/>back!
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem',
          lineHeight: 1.7, maxWidth: 300, marginBottom: 40,
          position: 'relative', zIndex: 1 }}>
          Sign in to access your real-time safety dashboard.
        </p>

        {[
          { icon: '📍', title: 'Live GPS Tracking',  sub: 'Real-time location sharing' },
          { icon: '🚨', title: 'Instant SOS Alerts', sub: 'One tap emergency response' },
          { icon: '👥', title: 'Community Network',  sub: 'Nearby helpers always ready' },
        ].map(p => (
          <div key={p.title} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '14px 18px',
            marginBottom: 12, position: 'relative', zIndex: 1
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1rem' }}>{p.icon}</div>
            <div>
              <div style={{ color: 'white', fontWeight: 700,
                fontSize: '0.9rem' }}>{p.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)',
                fontSize: '0.75rem' }}>{p.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '60px 80px',
        position: 'relative' }}>

        <div style={{ width: '100%', maxWidth: 400,
          position: 'relative', zIndex: 1,
          animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center',
            gap: 8, background: 'var(--blush)',
            color: 'var(--rose-dark)', borderRadius: 20,
            padding: '6px 14px', fontSize: '0.75rem',
            fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 20 }}>
            🛡️ SafeHer Portal
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif",
            fontSize: '2.4rem', fontWeight: 900,
            color: 'var(--charcoal)', marginBottom: 8 }}>
            Sign In
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem',
            marginBottom: 38, lineHeight: 1.6 }}>
            Enter your registered phone number and password.
          </p>

          {/* Phone */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: '0.78rem',
              fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8,
              letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Phone Number
            </label>
            <input type="tel" placeholder="+91 99999 00000"
              value={phone} onChange={e => setPhone(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--rose)'}
              onBlur={e => e.target.style.borderColor = '#ede5ea'} />
          </div>

          {/* Password or OTP */}
          {!otpMode ? (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.78rem',
                fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8,
                letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--rose)'}
                  onBlur={e => e.target.style.borderColor = '#ede5ea'} />
                <button onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 16,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--muted)',
                    fontSize: '1.1rem' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: '0.78rem',
                fontWeight: 700, color: 'var(--charcoal)', marginBottom: 12,
                letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Enter OTP
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {otp.map((d, i) => (
  <input key={i} id={`otp-${i}`} type="text"
    maxLength={1} value={d}
    onChange={e => handleOtpInput(e.target.value, i)}
    style={{ width: 46, height: 56,
      border: '2px solid #ede5ea', borderRadius: 12,
      textAlign: 'center', fontSize: '1.4rem',
      fontWeight: 700, outline: 'none',
      fontFamily: "'DM Sans', sans-serif",
      color: 'var(--charcoal)' }}
    onFocus={e => e.target.style.borderColor = 'var(--rose)'}
    onBlur={e => e.target.style.borderColor = '#ede5ea'} />
))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 28, marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center',
              gap: 8, fontSize: '0.85rem',
              color: 'var(--muted)', cursor: 'pointer' }}>
              <input type="checkbox"
                style={{ accentColor: 'var(--rose)' }} />
              Remember me
            </label>
            <Link to="/forgot-password"
              style={{ color: 'var(--rose)', fontWeight: 600,
                fontSize: '0.85rem', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button onClick={otpMode ? verifyOtp : loginUser}
            disabled={loading} style={btnPrimary}>
            {loading ? 'Please wait...' :
              otpMode ? 'Verify OTP →' : 'Sign In to Dashboard →'}
          </button>

          <button onClick={otpMode ? () => setOtpMode(false) : sendOtp}
            disabled={loading}
            style={{ width: '100%', padding: 14,
              background: 'white', border: '2px solid #ede5ea',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.92rem', fontWeight: 600,
              color: 'var(--charcoal)' }}>
            {otpMode ? '← Back to Password' : '📱 Sign in with OTP'}
          </button>

          {msg.text && (
            <p style={{ textAlign: 'center', marginTop: 16,
              fontWeight: 600, fontSize: '0.88rem',
              color: msg.color }}>{msg.text}</p>
          )}

          <p style={{ textAlign: 'center', marginTop: 28,
            fontSize: '0.88rem', color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link to="/register"
              style={{ color: 'var(--rose)', fontWeight: 700,
                textDecoration: 'none' }}>
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}