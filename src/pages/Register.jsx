import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function Register() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('signup')
  const [form, setForm] = useState({
    name: '', phone: '', email: '', emergency: '', password: ''
  })
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' })
  const [msg, setMsg] = useState({ text: '', color: '' })
  const [loading, setLoading] = useState(false)
  const isMobile = window.innerWidth < 768

  const handleChange = e =>
    setForm({ ...form, [e.target.id]: e.target.value })

  async function registerUser() {
    if (!form.name || !form.phone || !form.password) {
      setMsg({ text: '⚠ Fill in name, phone and password.', color: '#c0392b' })
      return
    }
    setLoading(true)
    try {
      const data = await api.register({
        name: form.name, phone: form.phone,
        email: form.email, password: form.password,
        emergencyContact: form.emergency
      })
      if (data.success) {
        localStorage.setItem('safeher_username', data.name)
        localStorage.setItem('safeher_userId', data.userId)
        if (form.emergency) {
          localStorage.setItem('safeher_contacts', JSON.stringify([
            { name: 'Emergency Contact', phone: form.emergency, tag: 'Primary' }
          ]))
        }
        setMsg({ text: '✓ Registration Successful! Redirecting...', color: '#2e7d32' })
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        setMsg({ text: '⚠ ' + data.message, color: '#c0392b' })
      }
    } catch {
      localStorage.setItem('safeher_username', form.name)
      if (form.emergency) {
        localStorage.setItem('safeher_contacts', JSON.stringify([
          { name: 'Emergency Contact', phone: form.emergency, tag: 'Primary' }
        ]))
      }
      setMsg({ text: '✓ Saved locally! Redirecting...', color: '#2e7d32' })
      setTimeout(() => navigate('/dashboard'), 1500)
    }
    setLoading(false)
  }

  async function loginUser() {
    if (!loginForm.phone || !loginForm.password) {
      setMsg({ text: '⚠ Enter phone and password.', color: '#c0392b' })
      return
    }
    setLoading(true)
    try {
      const data = await api.login(loginForm.phone, loginForm.password)
      if (data.success) {
        localStorage.setItem('safeher_username', data.name)
        localStorage.setItem('safeher_userId', data.userId)
        if (data.emergencyContact) {
          localStorage.setItem('safeher_contacts', JSON.stringify([
            { name: 'Emergency Contact', phone: data.emergencyContact, tag: 'Primary' }
          ]))
        }
        setMsg({ text: '✓ Login Successful! Redirecting...', color: '#2e7d32' })
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        setMsg({ text: '⚠ ' + data.message, color: '#c0392b' })
      }
    } catch {
      setMsg({ text: '⚠ Cannot connect to server.', color: '#c0392b' })
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    border: '2px solid #e8e0e5', borderRadius: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem', color: 'var(--charcoal)',
    background: 'white', outline: 'none',
    boxSizing: 'border-box'
  }

  const signupFields = [
    { id: 'name',      label: 'Full Name',        placeholder: 'e.g. Priya Sharma',      type: 'text'     },
    { id: 'phone',     label: 'Phone Number',      placeholder: '+91 99999 00000',         type: 'tel'      },
    { id: 'email',     label: 'Email Address',     placeholder: 'you@example.com',         type: 'email'    },
    { id: 'password',  label: 'Password',          placeholder: 'Create a password',       type: 'password' },
    { id: 'emergency', label: 'Emergency Contact', placeholder: "Trusted person's number", type: 'tel'      },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      fontFamily: "'DM Sans', sans-serif",
      background: 'var(--cream)' }}>

      {/* Left Panel - Desktop only */}
      {!isMobile && (
        <div style={{ width: '45%',
          background: 'linear-gradient(145deg,#e8526a,#c23b53,#8b1a35)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: 60, overflow: 'hidden' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif",
            fontSize: '3rem', fontWeight: 900, color: 'white',
            lineHeight: 1.1, marginBottom: 20 }}>
            Your Safety,<br/>Our Priority
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem',
            lineHeight: 1.7, maxWidth: 300, marginBottom: 50 }}>
            Real-time women safety platform with SOS alerts,
            live location tracking, and emergency response.
          </p>
          <ul style={{ listStyle: 'none' }}>
            {['One-tap SOS emergency alert', 'Live GPS location sharing',
              'Nearby helpers network', 'Emergency contact alerts',
              'Safe zone monitoring'].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center',
                gap: 14, color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9rem', marginBottom: 18, fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div style={{
          background: 'linear-gradient(145deg,#e8526a,#c23b53,#8b1a35)',
          padding: '30px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif",
            fontSize: '1.8rem', fontWeight: 900,
            color: 'white', marginBottom: 6 }}>SafeHer</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)',
            fontSize: '0.85rem' }}>Your Safety, Our Priority</p>
        </div>
      )}

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '24px 20px' : '60px 80px' }}>

        <div style={{ width: '100%', maxWidth: 420 }}>

          <p style={{ fontSize: '0.8rem', color: 'var(--muted)',
            marginBottom: 8, fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Welcome to SafeHer
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? '1.8rem' : '2.2rem',
            fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>
            {tab === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem',
            marginBottom: 28, lineHeight: 1.5 }}>
            {tab === 'signup'
              ? 'Join thousands of women staying safer every day.'
              : 'Sign in to access your safety dashboard.'}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#ede8ec',
            borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {['signup', 'login'].map(t => (
              <button key={t}
                onClick={() => { setTab(t); setMsg({ text: '', color: '' }) }}
                style={{ flex: 1, padding: 10, border: 'none',
                  borderRadius: 9,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.9rem', fontWeight: 600,
                  cursor: 'pointer',
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? 'var(--charcoal)' : 'var(--muted)',
                  boxShadow: tab === t
                    ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                {t === 'signup' ? 'Sign Up' : 'Sign In'}
              </button>
            ))}
          </div>

          {tab === 'signup' ? (
            signupFields.map(f => (
              <div key={f.id} style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.82rem',
                  fontWeight: 600, color: 'var(--charcoal)',
                  marginBottom: 8, letterSpacing: '0.03em',
                  textTransform: 'uppercase' }}>
                  {f.label}
                </label>
                <input id={f.id} type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.id]} onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--rose)'}
                  onBlur={e => e.target.style.borderColor = '#e8e0e5'} />
              </div>
            ))
          ) : (
            <>
              {[
                { id: 'phone',    label: 'Phone Number',
                  placeholder: '+91 99999 00000', type: 'tel' },
                { id: 'password', label: 'Password',
                  placeholder: 'Enter password',  type: 'password' },
              ].map(f => (
                <div key={f.id} style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem',
                    fontWeight: 600, color: 'var(--charcoal)',
                    marginBottom: 8, letterSpacing: '0.03em',
                    textTransform: 'uppercase' }}>
                    {f.label}
                  </label>
                  <input id={f.id} type={f.type}
                    placeholder={f.placeholder}
                    value={loginForm[f.id]}
                    onChange={e => setLoginForm({
                      ...loginForm, [e.target.id]: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--rose)'}
                    onBlur={e => e.target.style.borderColor = '#e8e0e5'} />
                </div>
              ))}
              <div style={{ textAlign: 'right',
                marginBottom: 20, marginTop: -8 }}>
                <Link to="/forgot-password"
                  style={{ color: 'var(--rose)', fontWeight: 600,
                    fontSize: '0.85rem', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            </>
          )}

          <button onClick={tab === 'signup' ? registerUser : loginUser}
            disabled={loading}
            style={{ width: '100%', padding: 16,
              background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
              color: 'white', border: 'none', borderRadius: 12,
              fontFamily: "'DM Sans', sans-serif", fontSize: '1rem',
              fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(232,82,106,0.4)',
              opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' :
              tab === 'signup' ? 'Create My Account →' : 'Sign In →'}
          </button>

          {msg.text && (
            <p style={{ textAlign: 'center', marginTop: 16,
              fontWeight: 600, fontSize: '0.9rem',
              color: msg.color }}>{msg.text}</p>
          )}
        </div>
      </div>
    </div>
  )
}