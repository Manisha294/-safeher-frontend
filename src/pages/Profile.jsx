import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()

  const [name, setName] = useState(
    localStorage.getItem('safeher_username') || '')
  const [phone] = useState(
    localStorage.getItem('safeher_phone') || '')
  const [email, setEmail] = useState(
    localStorage.getItem('safeher_email') || '')
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('safeher_contacts')
    return saved ? JSON.parse(saved) : []
  })
  const [newContact, setNewContact] = useState(
    { name: '', phone: '' })
  const [msg, setMsg] = useState({ text: '', color: '' })
  const [activeTab, setActiveTab] = useState('profile')

  const initials = name.split(' ')
    .map(w => w[0]).join('').toUpperCase().slice(0, 2)

  function saveProfile() {
    localStorage.setItem('safeher_username', name)
    localStorage.setItem('safeher_email', email)
    setMsg({ text: '✓ Profile updated!', color: '#2e7d32' })
    setTimeout(() => setMsg({ text: '', color: '' }), 3000)
  }

  function addContact() {
    if (!newContact.name || !newContact.phone) {
      setMsg({ text: '⚠ Enter name and phone.',
        color: '#c0392b' }); return
    }
    if (newContact.phone.replace(/\D/g, '').length < 10) {
      setMsg({ text: '⚠ Enter valid 10-digit phone.',
        color: '#c0392b' }); return
    }
    if (contacts.length >= 5) {
      setMsg({ text: '⚠ Maximum 5 contacts allowed.',
        color: '#c0392b' }); return
    }
    const updated = [...contacts, {
      name: newContact.name,
      phone: newContact.phone,
      tag: contacts.length === 0 ? 'Primary' : 'Secondary'
    }]
    setContacts(updated)
    localStorage.setItem('safeher_contacts',
      JSON.stringify(updated))
    setNewContact({ name: '', phone: '' })
    setMsg({ text: '✓ Contact added!', color: '#2e7d32' })
    setTimeout(() => setMsg({ text: '', color: '' }), 3000)
  }

  function removeContact(index) {
    const updated = contacts.filter((_, i) => i !== index)
    if (updated.length > 0) updated[0].tag = 'Primary'
    setContacts(updated)
    localStorage.setItem('safeher_contacts',
      JSON.stringify(updated))
    setMsg({ text: '✓ Contact removed.', color: '#2e7d32' })
    setTimeout(() => setMsg({ text: '', color: '' }), 3000)
  }

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    border: '2px solid #ede5ea', borderRadius: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem', color: 'var(--charcoal)',
    background: 'white', outline: 'none', marginBottom: 16
  }

  const tabStyle = (active) => ({
    flex: 1, padding: '10px 16px', border: 'none',
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.88rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? 'white' : 'transparent',
    color: active ? 'var(--charcoal)' : 'var(--muted)',
    boxShadow: active
      ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
  })

  return (
    <div style={{ minHeight: '100vh',
      background: 'var(--cream)',
      fontFamily: "'DM Sans', sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: 'white',
        borderBottom: '1px solid #f0e8ec',
        padding: '0 40px', height: 70,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

        <div style={{ display: 'flex', alignItems: 'center',
          gap: 12, fontFamily: "'Playfair Display', serif",
          fontSize: '1.4rem', fontWeight: 900 }}>
          <div style={{ width: 38, height: 38,
            background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
            borderRadius: 10, display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5"
              width="20" height="20">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          SafeHer
        </div>

        <div style={{ display: 'flex',
          alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ padding: '8px 16px',
              background: 'var(--blush)', border: 'none',
              borderRadius: 10, cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--rose-dark)',
              fontFamily: "'DM Sans', sans-serif" }}>
            ← Dashboard
          </button>
          <button onClick={logout}
            style={{ padding: '8px 16px',
              background: '#fde8ec',
              border: '2px solid var(--rose)',
              borderRadius: 10, cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 700,
              color: 'var(--rose-dark)',
              fontFamily: "'DM Sans', sans-serif" }}>
            Logout →
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 700, margin: '0 auto',
        padding: '40px 20px' }}>

        {/* Header Card */}
        <div style={{ background: 'linear-gradient(135deg,#1e1b2e,#2d2440)',
          borderRadius: 24, padding: '30px 40px',
          display: 'flex', alignItems: 'center',
          gap: 24, marginBottom: 30,
          position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute',
            right: -40, top: -40, width: 200,
            height: 200, borderRadius: '50%',
            background: 'rgba(232,82,106,0.15)' }} />
          <div style={{ width: 80, height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white',
            fontSize: '1.8rem', fontWeight: 900,
            flexShrink: 0, position: 'relative',
            zIndex: 1 }}>
            {initials}
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif",
              fontSize: '1.6rem', fontWeight: 900,
              color: 'white', marginBottom: 4 }}>{name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)',
              fontSize: '0.88rem' }}>{phone}</p>
            <div style={{ display: 'flex', gap: 8,
              marginTop: 10 }}>
              <span style={{ background: 'rgba(46,204,113,0.2)',
                color: '#2ecc71', padding: '4px 12px',
                borderRadius: 20, fontSize: '0.75rem',
                fontWeight: 600 }}>● Protected</span>
              <span style={{ background: 'rgba(232,82,106,0.2)',
                color: '#ff8fa3', padding: '4px 12px',
                borderRadius: 20, fontSize: '0.75rem',
                fontWeight: 600 }}>
                {contacts.length} Contact{contacts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex',
          background: '#ede8ec', borderRadius: 14,
          padding: 4, marginBottom: 24 }}>
          {[
            { id: 'profile', label: '👤 My Profile' },
            { id: 'contacts', label: '📞 Emergency Contacts' },
            { id: 'security', label: '🔒 Security' },
          ].map(t => (
            <button key={t.id}
              style={tabStyle(activeTab === t.id)}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white',
            borderRadius: 20, padding: 32,
            border: '1px solid #f0e8ec' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif",
              fontSize: '1.2rem', fontWeight: 700,
              marginBottom: 24 }}>Personal Information</h3>

            {[
              { label: 'Full Name', value: name,
                setter: setName, type: 'text',
                disabled: false,
                placeholder: 'Your name' },
              { label: 'Phone Number', value: phone,
                setter: null, type: 'tel',
                disabled: true,
                placeholder: 'Phone' },
              { label: 'Email Address', value: email,
                setter: setEmail, type: 'email',
                disabled: false,
                placeholder: 'your@email.com' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block',
                  fontSize: '0.78rem', fontWeight: 700,
                  color: 'var(--charcoal)', marginBottom: 8,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' }}>
                  {f.label}
                </label>
                <input type={f.type} value={f.value}
                  placeholder={f.placeholder}
                  disabled={f.disabled}
                  onChange={f.setter
                    ? e => f.setter(e.target.value)
                    : undefined}
                  style={{ ...inputStyle,
                    background: f.disabled
                      ? '#f8f4f6' : 'white',
                    color: f.disabled
                      ? 'var(--muted)' : 'var(--charcoal)',
                    cursor: f.disabled
                      ? 'not-allowed' : 'text' }}
                  onFocus={f.disabled ? undefined
                    : e => e.target.style.borderColor='var(--rose)'}
                  onBlur={f.disabled ? undefined
                    : e => e.target.style.borderColor='#ede5ea'} />
              </div>
            ))}

            <button onClick={saveProfile}
              style={{ width: '100%', padding: 14,
                background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
                color: 'white', border: 'none',
                borderRadius: 12, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.95rem', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(232,82,106,0.3)' }}>
              Save Profile ✓
            </button>

            {msg.text && (
              <p style={{ textAlign: 'center',
                marginTop: 14, fontWeight: 600,
                fontSize: '0.88rem',
                color: msg.color }}>{msg.text}</p>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div>
            <div style={{ background: 'white',
              borderRadius: 20, padding: 32,
              border: '1px solid #f0e8ec',
              marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif",
                fontSize: '1.2rem', fontWeight: 700,
                marginBottom: 20 }}>
                Emergency Contacts
                <span style={{ marginLeft: 10,
                  background: 'var(--blush)',
                  color: 'var(--rose)',
                  padding: '2px 10px', borderRadius: 20,
                  fontSize: '0.78rem', fontWeight: 700 }}>
                  {contacts.length}/5
                </span>
              </h3>

              {contacts.length === 0 ? (
                <div style={{ textAlign: 'center',
                  padding: '30px 0',
                  color: 'var(--muted)' }}>
                  <div style={{ fontSize: '2.5rem',
                    marginBottom: 12 }}>📞</div>
                  <p>No emergency contacts added yet.</p>
                </div>
              ) : contacts.map((c, i) => (
                <div key={i} style={{ display: 'flex',
                  alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  background: 'var(--cream)',
                  borderRadius: 12, marginBottom: 10,
                  border: '1px solid #f0e8ec' }}>
                  <div style={{ width: 44, height: 44,
                    borderRadius: '50%',
                    background: i === 0
                      ? 'linear-gradient(135deg,var(--rose),var(--rose-dark))'
                      : 'linear-gradient(135deg,#667eea,#764ba2)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white', fontWeight: 700,
                    fontSize: '1rem' }}>
                    {c.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700,
                      fontSize: '0.92rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem',
                      color: 'var(--muted)' }}>{c.phone}</div>
                  </div>
                  <span style={{ padding: '4px 12px',
                    borderRadius: 20, fontSize: '0.72rem',
                    fontWeight: 700,
                    background: i === 0
                      ? 'var(--blush)' : '#f0f0ff',
                    color: i === 0
                      ? 'var(--rose-dark)' : '#667eea' }}>
                    {c.tag}
                  </span>
                  <button onClick={() => removeContact(i)}
                    style={{ width: 32, height: 32,
                      borderRadius: '50%',
                      background: '#fde8ec', border: 'none',
                      cursor: 'pointer',
                      color: 'var(--rose)',
                      fontSize: '1.1rem', fontWeight: 700 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            {contacts.length < 5 && (
              <div style={{ background: 'white',
                borderRadius: 20, padding: 32,
                border: '1px solid #f0e8ec' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif",
                  fontSize: '1.2rem', fontWeight: 700,
                  marginBottom: 20 }}>Add New Contact</h3>

                <label style={{ display: 'block',
                  fontSize: '0.78rem', fontWeight: 700,
                  color: 'var(--charcoal)', marginBottom: 8,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' }}>
                  Contact Name
                </label>
                <input type="text"
                  placeholder="e.g. Mom, Sister, Friend"
                  value={newContact.name}
                  onChange={e => setNewContact({
                    ...newContact, name: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor='var(--rose)'}
                  onBlur={e => e.target.style.borderColor='#ede5ea'} />

                <label style={{ display: 'block',
                  fontSize: '0.78rem', fontWeight: 700,
                  color: 'var(--charcoal)', marginBottom: 8,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' }}>
                  Phone Number
                </label>
                <input type="tel"
                  placeholder="10-digit phone number"
                  value={newContact.phone}
                  onChange={e => setNewContact({
                    ...newContact, phone: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor='var(--rose)'}
                  onBlur={e => e.target.style.borderColor='#ede5ea'} />

                <button onClick={addContact}
                  style={{ width: '100%', padding: 14,
                    background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
                    color: 'white', border: 'none',
                    borderRadius: 12, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.95rem', fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(232,82,106,0.3)' }}>
                  + Add Contact
                </button>

                {msg.text && (
                  <p style={{ textAlign: 'center',
                    marginTop: 14, fontWeight: 600,
                    fontSize: '0.88rem',
                    color: msg.color }}>{msg.text}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{ background: 'white',
            borderRadius: 20, padding: 32,
            border: '1px solid #f0e8ec' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif",
              fontSize: '1.2rem', fontWeight: 700,
              marginBottom: 24 }}>Security Settings</h3>

            <div style={{ background: 'var(--blush)',
              borderRadius: 14, padding: 20,
              marginBottom: 16 }}>
              <div style={{ fontWeight: 700,
                color: 'var(--rose-dark)',
                marginBottom: 6 }}>🔒 Change Password</div>
              <p style={{ fontSize: '0.85rem',
                color: 'var(--muted)', marginBottom: 12 }}>
                Reset your password using OTP verification.
              </p>
              <button onClick={() => navigate('/forgot-password')}
                style={{ padding: '8px 16px',
                  background: 'var(--rose)', color: 'white',
                  border: 'none', borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.85rem', fontWeight: 600 }}>
                Reset Password →
              </button>
            </div>

            <div style={{ background: '#fde8ec',
              borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700,
                color: 'var(--rose-dark)',
                marginBottom: 6 }}>🚪 Logout</div>
              <p style={{ fontSize: '0.85rem',
                color: 'var(--muted)', marginBottom: 12 }}>
                Sign out from your SafeHer account.
              </p>
              <button onClick={logout}
                style={{ padding: '8px 16px',
                  background: 'var(--rose-dark)',
                  color: 'white', border: 'none',
                  borderRadius: 8, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.85rem', fontWeight: 600 }}>
                Logout →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
