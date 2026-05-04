import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'

// Process ?demo_token synchronously before React renders so that
// ProtectedRoute sees isAuthenticated=true on the first render cycle.
// loadStoredAuth() in authStore reads localStorage on store creation,
// so writing here is enough — no setAuth call needed at this stage.
;(function bootstrapDemoToken() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('demo_token')
  if (!token) return
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const payload = JSON.parse(atob(padded))
    const exp: number = payload.exp
    if (!exp || Date.now() / 1000 > exp) return

    const user = {
      id: payload.user_id ?? payload.sub ?? 'demo',
      username: payload.username ?? 'demo',
      email: 'demo@jcrlabs.net',
      role: payload.role ?? 'viewer',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const expiresAt = new Date(exp * 1000).toISOString()

    localStorage.setItem('access_token', token)
    localStorage.setItem('refresh_token', 'demo-readonly')
    localStorage.setItem('expires_at', expiresAt)
    localStorage.setItem('user', JSON.stringify(user))

    // Clean the token from the URL before React Router sees it
    window.history.replaceState({}, '', window.location.pathname)
  } catch {
    // Malformed token — ignore, normal login flow continues
  }
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
