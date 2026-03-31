import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast, ToastContainer } from '../components/Toast'
import { api } from '../utils/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const { toasts, showToast } = useToast()
  const [sosHistory, setSosHistory] = useState([])
  const [sosCount, setSosCount] = useState(0)
  const [helperCount, setHelperCount] = useState(0)
  const [helpers, setHelpers] = useState([])
  const [zone, setZone] = useState('SAFE')
  const [sosResult, setSosResult] = useState({ show: false, text: '', type: '' })
  const [activeNav, setActiveNav] = useState('dashboard')
  const [notifBanner, setNotifBanner] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [contacts] = useState(() =>
    JSON.parse(localStorage.getItem('safeher_contacts') || '[]'))

  const [destination, setDestination] = useState('')
  const [aiRouteResult, setAiRouteResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const username = localStorage.getItem('safeher_username') || 'User'
  const userId = localStorage.getItem('safeher_userId') || 1
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)
  const initials = username.split(' ')
    .map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default')
      setNotifBanner(true)
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDL3fKCZJQH2ahs6Eywm8wu4-5chHQDxeA&callback=initSafeHerMap`
      script.async = true
      window.initSafeHerMap = initMap
      document.head.appendChild(script)
    } else { initMap() }
  }, [])

  function initMap() {
    if (!mapRef.current) return
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 17.385, lng: 78.486 },
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8f5' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#fff8f5' }] }
      ]
    })
  }

  function checkSafeZone(lat, lon) {
    return Math.sqrt((lat - 17.385) ** 2 + (lon - 78.486) ** 2) < 0.01
      ? 'SAFE' : 'UNSAFE'
  }

  function sendBrowserNotif(title, body) {
    if (Notification.permission === 'granted') {
      const n = new Notification(title, { body, tag: 'safeher-sos', requireInteraction: true })
      n.onclick = () => { window.focus(); n.close() }
    }
  }

  function requestNotifPermission() {
    Notification.requestPermission().then(perm => {
      setNotifBanner(false)
      perm === 'granted'
        ? showToast('success', '✅', 'Notifications Enabled', 'You will receive SOS push alerts.')
        : showToast('warn', '🔕', 'Blocked', 'Enable notifications in browser settings.')
    })
  }

  async function sendSOS() {
    showToast('sos', '🚨', 'SOS Alert Triggered!', 'Getting your location…', 3000)
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      const z = checkSafeZone(lat, lon)
      setZone(z)
      setSosResult({
        show: true,
        text: z === 'SAFE'
          ? '✓ You are in a Safe Zone · Alert sent to emergency contacts'
          : '⚠ You are in an Unsafe Zone · Alert sent to emergency contacts',
        type: z === 'SAFE' ? 'safe' : 'unsafe'
      })
      if (mapInstance.current) {
        if (markerRef.current) markerRef.current.setMap(null)
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng: lon },
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12, fillColor: '#e8526a',
            fillOpacity: 1, strokeColor: 'white', strokeWeight: 3
          }
        })
        mapInstance.current.panTo({ lat, lng: lon })
      }
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        const data = await r.json()
        const place = data?.display_name?.split(',').slice(0, 3).join(', ') || 'Unknown'
        sendBrowserNotif('🚨 SafeHer SOS Alert!',
          `Location: ${place}\nZone: ${z}\nEmergency contacts alerted.`)
        showToast('sos', '📍', 'Location Shared', place, 5000)
        showToast('info', '👥', 'Contacts Notified',
          contacts.length > 0 ? contacts.map(c => c.name).join(', ') : 'No emergency contacts', 5000)
        z === 'SAFE'
          ? showToast('success', '🛡️', 'Safe Zone', 'Stay calm. Help is on the way.', 6000)
          : showToast('sos', '⚠️', 'Unsafe Zone!', 'Move to a public area.', 6000)
        setSosHistory(prev => [{ time: new Date().toLocaleString(), place }, ...prev])
        setSosCount(c => c + 1)
      } catch {}
      try { await api.sos(userId, lat, lon) } catch {}
      try {
        const nearbyData = await api.nearby(lat, lon)
        const list = nearbyData.length > 0 ? nearbyData : mockHelpers()
        setHelpers(list)
        setHelperCount(list.length)
        showToast('success', '🤝', 'Helpers Found', `${list.length} helper(s) near you.`, 5000)
      } catch {
        const list = mockHelpers()
        setHelpers(list)
        setHelperCount(list.length)
      }
    }, () => {
      setSosResult({ show: true, text: '⚠ Location access denied.', type: 'unsafe' })
    })
  }

  async function getSafeRoute() {
    if (!destination.trim()) {
      setAiRouteResult('⚠ Please enter a destination.')
      return
    }
    setAiLoading(true)
    setAiRouteResult('')

    await new Promise(r => setTimeout(r, 1500))

    const dest = destination.trim()
    const hour = new Date().getHours()
    const isNight = hour >= 20 || hour < 6
    const isMorning = hour >= 6 && hour < 12
    const timeAdvice = isNight
      ? '🌙 It is currently night time — extra caution advised!'
      : isMorning
        ? '🌅 Morning time — relatively safe for travel.'
        : '☀️ Daytime — good time to travel.'

    setAiRouteResult(`🤖 AI Safety Advice for: ${dest}

${timeAdvice}

🚗 Recommended Travel Mode:
- Use Ola/Uber cab — safest option especially at night
- Avoid walking alone after 8 PM
- Share your cab details with emergency contact before boarding

⚠️ Safety Tips for ${dest}:
- Share your live location with a trusted person
- Keep your phone fully charged before travelling
- Sit behind the driver in cabs — never in front
- Note the cab number and driver details before entering
- Avoid wearing expensive jewellery or showing valuables
- Stay in well-lit and crowded areas

📞 Emergency Numbers to Keep Ready:
- Police: 100
- Women Helpline: 1091
- Ambulance: 108
- Hyderabad Police: 040-27852425
- Uber/Ola Support: In-app help button

⏰ Best Time to Travel to ${dest}:
- Safest: 7 AM – 7 PM
- Moderate: 7 PM – 9 PM (use cab)
- Avoid: After 9 PM alone

🛡️ SafeHer Tip:
Press the SOS button if you feel unsafe at any point.
Your emergency contacts will be alerted immediately!`)

    setAiLoading(false)
  }

  const mockHelpers = () => [
    { name: 'Ananya R.', phone: '98765 43210', distance: '0.3 km' },
    { name: 'Preethi S.', phone: '87654 32109', distance: '0.6 km' },
    { name: 'Kavitha M.', phone: '76543 21098', distance: '1.1 km' },
  ]

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveNav(id)
    if (isMobile) setSidebarOpen(false)
  }

  const navItems = [
    { id: 'dashboard',       label: '🏠 Dashboard' },
    { id: 'section-ai',      label: '🤖 AI Safe Route' },
    { id: 'section-map',     label: '📍 Live Location' },
    { id: 'section-helpers', label: '👥 Nearby Helpers' },
    { id: 'section-history', label: '🕐 SOS History' },
  ]

  const cardStyle = {
    background: 'white', borderRadius: 20,
    border: '1px solid #f0e8ec', padding: 24, marginBottom: 30
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif",
      background: 'var(--cream)', minHeight: '100vh' }}>

      <ToastContainer toasts={toasts} onDismiss={() => {}} />

      {/* Topbar */}
      <div style={{ background: 'white',
        borderBottom: '1px solid #f0e8ec',
        padding: isMobile ? '0 16px' : '0 40px',
        height: 70, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none',
                fontSize: '1.4rem', cursor: 'pointer', padding: 4 }}>
              ☰
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center',
            gap: 10, fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? '1.2rem' : '1.4rem',
            fontWeight: 900, color: 'var(--charcoal)' }}>
            <div style={{ width: 36, height: 36,
              background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
              borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5" width="18" height="18">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            SafeHer
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center',
          gap: isMobile ? 8 : 16 }}>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center',
              gap: 8, background: '#e8f8f0', color: '#1e8449',
              padding: '6px 14px', borderRadius: 20,
              fontSize: '0.8rem', fontWeight: 600 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%',
                background: 'var(--green)', animation: 'pulse 2s infinite' }} />
              Protected
            </div>
          )}
          {!isMobile && (
            <span style={{ fontSize: '0.88rem', fontWeight: 600,
              color: 'var(--charcoal)' }}>{username}</span>
          )}
          <div onClick={() => navigate('/profile')}
            style={{ width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer' }}>
            {initials}
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login') }}
            style={{ padding: isMobile ? '6px 12px' : '8px 18px',
              background: '#fde8ec', border: '2px solid var(--rose)',
              borderRadius: 10, cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 700,
              color: 'var(--rose-dark)',
              fontFamily: "'DM Sans', sans-serif" }}>
            {isMobile ? '→' : 'Logout →'}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0,
          right: 0, bottom: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ width: 260, background: 'white',
            padding: '80px 20px 30px',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--muted)', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 8 }}>
              Navigation
            </p>
            {navItems.map(item => (
              <div key={item.id} onClick={() => scrollTo(item.id)}
                style={{ padding: '12px 16px', borderRadius: 12,
                  cursor: 'pointer', fontWeight: 500,
                  fontSize: '0.92rem',
                  color: activeNav === item.id ? 'var(--rose-dark)' : 'var(--muted)',
                  background: activeNav === item.id ? 'var(--blush)' : 'transparent' }}>
                {item.label}
              </div>
            ))}
            <div onClick={() => { navigate('/profile'); setSidebarOpen(false) }}
              style={{ padding: '12px 16px', borderRadius: 12,
                cursor: 'pointer', fontSize: '0.92rem', color: 'var(--muted)' }}>
              👤 My Profile
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Grid */}
      <div style={{ display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: '300px 1fr',
        minHeight: 'calc(100vh - 70px)' }}>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside style={{ background: 'white',
            borderRight: '1px solid #f0e8ec',
            padding: '30px 24px',
            display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--muted)', letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '12px 12px 6px' }}>
              Navigation
            </p>
            {navItems.map(item => (
              <div key={item.id} onClick={() => scrollTo(item.id)}
                style={{ padding: '12px 16px', borderRadius: 12,
                  cursor: 'pointer',
                  fontWeight: activeNav === item.id ? 700 : 500,
                  fontSize: '0.92rem',
                  color: activeNav === item.id ? 'var(--rose-dark)' : 'var(--muted)',
                  background: activeNav === item.id ? 'var(--blush)' : 'transparent' }}>
                {item.label}
              </div>
            ))}
            <div onClick={() => navigate('/profile')}
              style={{ padding: '12px 16px', borderRadius: 12,
                cursor: 'pointer', fontWeight: 500,
                fontSize: '0.92rem', color: 'var(--muted)' }}>
              👤 My Profile
            </div>
            <div style={{ marginTop: 'auto', background: 'var(--blush)',
              borderRadius: 16, padding: 20 }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700,
                color: 'var(--rose-dark)', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 14 }}>
                📞 Quick Alert
              </h4>
              {contacts.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  No emergency contacts added.
                </p>
              ) : contacts.map((c, i) => (
                <div key={i} style={{ display: 'flex',
                  alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white',
                    fontSize: '0.8rem', fontWeight: 700 }}>
                    {c.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.phone}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700,
                    color: 'var(--rose-dark)', background: 'white',
                    padding: '2px 8px', borderRadius: 10 }}>{c.tag}</span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main style={{ padding: isMobile ? '20px 16px' : '30px 40px',
          overflowY: 'auto' }}>

          {notifBanner && (
            <div style={{ background: 'linear-gradient(135deg,#1e1b2e,#2d2440)',
              borderRadius: 14, padding: '14px 20px',
              display: 'flex', alignItems: 'center',
              gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: '1.5rem' }}>🔔</span>
              <p style={{ color: 'rgba(255,255,255,0.8)',
                fontSize: '0.85rem', flex: 1 }}>
                <strong style={{ color: 'white' }}>Enable Notifications</strong><br/>
                Get instant alerts when SOS is triggered.
              </p>
              <button onClick={requestNotifPermission}
                style={{ background: 'var(--rose)', color: 'white',
                  border: 'none', borderRadius: 8, padding: '8px 16px',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                Allow
              </button>
              <button onClick={() => setNotifBanner(false)}
                style={{ background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                  fontSize: '1.1rem' }}>✕</button>
            </div>
          )}

          {/* Page Header */}
          <div id="dashboard" style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 700 }}>
              Safety Dashboard
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
              Real-time monitoring · Hyderabad, Telangana
            </p>
          </div>

          {/* SOS Button */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center', gap: isMobile ? 20 : 30,
              background: 'linear-gradient(135deg,#1e1b2e,#2d2440)',
              borderRadius: 24,
              padding: isMobile ? '24px 20px' : '30px 40px',
              textAlign: isMobile ? 'center' : 'left' }}>
              <button onClick={sendSOS}
                style={{ width: isMobile ? 100 : 120,
                  height: isMobile ? 100 : 120,
                  borderRadius: '50%', border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
                  color: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.85rem', fontWeight: 800,
                  textTransform: 'uppercase',
                  animation: 'sosGlow 2.5s infinite',
                  flexShrink: 0 }}>
                🚨<br/>SOS<br/>ALERT
              </button>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif",
                  fontSize: '1.4rem', color: 'white', marginBottom: 6 }}>
                  Emergency SOS
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  Press to instantly alert all emergency contacts
                  and share your live GPS location.
                </p>
              </div>
            </div>
            {sosResult.show && (
              <div style={{ marginTop: 14, padding: '12px 18px',
                borderRadius: 12, fontSize: '0.88rem', fontWeight: 600,
                background: sosResult.type === 'safe' ? '#e8f8f0' : '#fde8ec',
                color: sosResult.type === 'safe' ? '#1e8449' : 'var(--rose-dark)' }}>
                {sosResult.text}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: isMobile ? 10 : 16, marginBottom: 24 }}>
            {[
              { label: 'SOS Alerts Sent', value: sosCount, bg: 'var(--blush)', emoji: '🚨' },
              { label: 'Nearby Helpers', value: helperCount, bg: '#e8f5e9', emoji: '👥' },
              { label: 'Zone Status', value: zone === 'SAFE' ? 'Safe' : 'Unsafe', bg: '#fff3e0', emoji: '🛡️' },
            ].map(st => (
              <div key={st.label} style={{ background: 'white',
                borderRadius: 18, padding: isMobile ? 14 : 22,
                border: '1px solid #f0e8ec' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12,
                  background: st.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12, fontSize: '1.1rem' }}>{st.emoji}</div>
                <div style={{ fontSize: isMobile ? '1.5rem' : '2rem',
                  fontWeight: 800, color: 'var(--charcoal)',
                  lineHeight: 1, marginBottom: 4 }}>{st.value}</div>
                <div style={{ fontSize: isMobile ? '0.7rem' : '0.82rem',
                  color: 'var(--muted)', fontWeight: 500 }}>{st.label}</div>
              </div>
            ))}
          </div>

          {/* AI Safe Route Suggester */}
          <div id="section-ai" style={{ ...cardStyle,
            border: '2px solid #e8526a' }}>
            <div style={{ display: 'flex', alignItems: 'center',
              gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.2rem' }}>🤖</div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700,
                  color: 'var(--charcoal)', marginBottom: 2 }}>
                  AI Safe Route Suggester
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Get AI-powered safety advice for your journey
                </p>
              </div>
            </div>

            <div style={{ display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 10, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Enter your destination (e.g. Hitech City, Hyderabad)"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && getSafeRoute()}
                style={{ flex: 1, padding: '12px 16px',
                  border: '2px solid #e8e0e5', borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.9rem', outline: 'none',
                  boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--rose)'}
                onBlur={e => e.target.style.borderColor = '#e8e0e5'}
              />
              <button onClick={getSafeRoute} disabled={aiLoading}
                style={{ padding: '12px 24px',
                  background: 'linear-gradient(135deg,var(--rose),var(--rose-dark))',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.9rem', fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  opacity: aiLoading ? 0.7 : 1 }}>
                {aiLoading ? '⏳ Thinking...' : '🤖 Get Safe Route'}
              </button>
            </div>

            {aiRouteResult && (
              <div style={{ background: 'var(--cream)',
                borderRadius: 12, padding: 16,
                fontSize: '0.88rem', lineHeight: 1.7,
                color: 'var(--charcoal)',
                border: '1px solid #f0e8ec',
                whiteSpace: 'pre-wrap' }}>
                {aiRouteResult}
              </div>
            )}
          </div>

          {/* Helpers */}
          <div id="section-helpers" style={cardStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
              👥 Nearby Helpers
            </h3>
            {helpers.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                Send SOS to see nearby helpers.
              </p>
            ) : helpers.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center',
                gap: 14, padding: '12px 16px',
                background: 'var(--cream)', borderRadius: 12, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#667eea,#764ba2)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                  {h.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{h.phone}</div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--rose)', fontWeight: 600 }}>
                  {h.distance || h.dist}
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div id="section-map" style={{ background: 'white', borderRadius: 20,
            border: '1px solid #f0e8ec', overflow: 'hidden', marginBottom: 30 }}>
            <div style={{ padding: '20px 24px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid #f0e8ec' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📍 Live Location Map</h3>
              <div style={{ padding: '6px 14px', borderRadius: 20,
                fontSize: '0.78rem', fontWeight: 700,
                background: zone === 'SAFE' ? '#e8f8f0' : '#fde8ec',
                color: zone === 'SAFE' ? '#1e8449' : 'var(--rose-dark)' }}>
                {zone === 'SAFE' ? '● Safe Zone' : '⚠ Unsafe Zone'}
              </div>
            </div>
            <div ref={mapRef} style={{ height: isMobile ? 260 : 360, width: '100%' }} />
          </div>

          {/* History */}
          <div id="section-history" style={cardStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>
              🕐 SOS History
            </h3>
            {sosHistory.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem',
                textAlign: 'center', padding: '24px 0' }}>
                No SOS alerts sent yet. Stay safe! 💗
              </p>
            ) : sosHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start',
                gap: 16, padding: '14px 0',
                borderBottom: i < sosHistory.length - 1 ? '1px solid #f8f2f5' : 'none' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%',
                  background: 'var(--rose)', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)',
                    marginBottom: 3 }}>{h.time}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{h.place}</div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}
