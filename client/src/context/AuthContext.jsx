import { createContext, useContext, useState, useEffect } from 'react'

const AuthCtx = createContext(null)

const API = import.meta.env.VITE_API_URL || 'https://api.rishurajput.com'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`${API}/api/auth/check`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(() => setLoading(false))
      .catch(() => { logout(); setLoading(false) })
  }, [])

  function login(t) {
    localStorage.setItem('admin_token', t)
    setToken(t)
  }

  function logout() {
    localStorage.removeItem('admin_token')
    setToken(null)
  }

  return (
    <AuthCtx.Provider value={{ token, login, logout, loading, isLoggedIn: !!token, API }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() { return useContext(AuthCtx) }
