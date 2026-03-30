import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminLogin.css'

export default function AdminLogin() {
  const { login, isLoggedIn, API } = useAuth()
  const navigate = useNavigate()
  const [adminExists, setAdminExists] = useState(null)
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate('/admin/dashboard')
  }, [isLoggedIn])

  useEffect(() => {
    fetch(`${API}/api/auth/status?t=${new Date().getTime()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setAdminExists(d.adminExists))
      .catch(() => setError('Cannot connect to server'))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Phase 2: Verify OTP
    if (step === 1) {
      try {
        const res = await fetch(`${API}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-secret': import.meta.env.VITE_API_SECRET || '' },
          body: JSON.stringify({ email, otp }),
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
      return
    }

    // Phase 1: Setup or Initial Login 
    const endpoint = adminExists ? '/api/auth/login' : '/api/auth/setup'
    try {
      const payload = adminExists ? { email, password } : { email, password, mobile }
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-secret': import.meta.env.VITE_API_SECRET || '' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      if (data.otpRequired) {
        setStep(1)
      } else {
        login(data.token)
        navigate('/admin/dashboard')
      }
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
          {step === 1 ? '🔐 Verification Required' : (adminExists ? '📝 Admin Login' : '🚀 Create Admin Account')}
        </h1>
        <p className="admin-login-sub">
          {step === 1
            ? 'We sent a 6-digit authentication code to your registered email.'
            : (adminExists
               ? 'Enter your credentials to access the dashboard.'
               : 'Set up your master account. You can optionally link a mobile number.')}
        </p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          {step === 0 && (
            <>
              <input
                type="email"
                placeholder="Email Address"
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
              {!adminExists && (
                <input
                  type="tel"
                  placeholder="Mobile Number (Optional)"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                />
              )}
            </>
          )}

          {step === 1 && (
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: 'bold' }}
            />
          )}

          {error && <p className="admin-error">{error}</p>}
          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? 'Please wait...' : (step === 1 ? 'Verify Code' : (adminExists ? 'Login' : 'Create Account'))}
          </button>
        </form>
      </div>
    </div>
  )
}
