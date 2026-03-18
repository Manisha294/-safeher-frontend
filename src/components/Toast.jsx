import { useState, useCallback } from 'react'

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((type, icon, title, message, duration = 4000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, type, icon, title, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return { toasts, showToast }
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
            background: t.type === 'success' ? '#e8f8f0' :
                        t.type === 'warn'    ? '#fef9e7' :
                        t.type === 'info'    ? '#eaf4fd' : '#fde8ec'
          }}>{t.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem',
              color: 'var(--charcoal)', marginBottom: 3 }}>{t.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)',
              lineHeight: 1.5 }}>{t.message}</div>
          </div>
          <button onClick={() => onDismiss(t.id)} style={{
            background: 'none', border: 'none', color: '#c0b8c8',
            cursor: 'pointer', fontSize: '1.1rem', alignSelf: 'flex-start'
          }}>✕</button>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, height: 3,
            background: t.type === 'success' ? '#2ecc71' :
                        t.type === 'warn'    ? '#f39c12' :
                        t.type === 'info'    ? '#3498db' : 'var(--rose)',
            animation: 'toastProgress 4s linear forwards'
          }} />
        </div>
      ))}
    </div>
  )
}