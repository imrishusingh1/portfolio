import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminLogin.css'

export default function AdminLogin() {
  const { login, isLoggedIn, API } = useAuth()
  const navigate = useNavigate()
  const [adminExists, setAdminExists] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate('/admin/dashboard')
  }, [isLoggedIn])

  useEffect(() => {
    fetch(`${API}/api/auth/status`)
      .then(r => r.json())
      .then(d => setAdminExists(d.adminExists))
      .catch(() => setError('Cannot connect to server'))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const endpoint = adminExists ? '/api/auth/login' : '/api/auth/setup'
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      login(data.token)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (adminExists === null) return <div className="admin-login-wrap"><p>Connecting to server...</p></div>

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <h1 className="admin-login-title">
          {adminExists ? '🔐 Admin Login' : '🚀 Create Admin Account'}
        </h1>
        <p className="admin-login-sub">
          {adminExists
            ? 'Enter your credentials to access the dashboard.'
            : 'Set up your admin account. You can only do this once.'}
        </p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? 'Please wait...' : adminExists ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
