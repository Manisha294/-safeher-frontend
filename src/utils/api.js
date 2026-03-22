const BASE = 'https://safeher-backend-2.onrender.com'

export const api = {
  register: (data) =>
    fetch(`${BASE}/users/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  login: (phone, password) =>
    fetch(`${BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    }).then(r => r.json()),

  sendOtp: (phone) =>
    fetch(`${BASE}/users/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    }).then(r => r.json()),

  verifyOtp: (phone, otp) =>
    fetch(`${BASE}/users/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    }).then(r => r.json()),

  forgotPassword: (phone) =>
    fetch(`${BASE}/users/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    }).then(r => r.json()),

  resetPassword: (phone, otp, newPassword) =>
    fetch(`${BASE}/users/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, newPassword })
    }).then(r => r.json()),

  sos: (id, lat, lon) =>
    fetch(`${BASE}/users/sos?id=${id}&lat=${lat}&lon=${lon}`)
      .then(r => r.json()),

  nearby: (lat, lon) =>
    fetch(`${BASE}/users/nearby?lat=${lat}&lon=${lon}`)
      .then(r => r.json()),
}