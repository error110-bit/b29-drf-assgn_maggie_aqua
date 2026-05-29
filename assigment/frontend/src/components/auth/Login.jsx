import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from './api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form)
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to your account</p>
        {error && <p className="error-msg">{error}</p>}
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'logging in…' : 'log In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}