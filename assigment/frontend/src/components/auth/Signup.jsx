import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from './api'

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'designer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/login', { replace: true })
    } catch (err) {
      const data = err.response?.data
      const firstKey = data ? Object.keys(data)[0] : null
      setError(
        Array.isArray(data?.[firstKey]) ? data[firstKey][0] :
        data?.detail || 'Registration failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="auth-sub">Join the creative workflow</p>
        {error && <p className="error-msg">{error}</p>}
        <form className="form-card" onSubmit={handleSubmit}>
          <label>Username</label>
          <input type="text" placeholder="yourname" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required />

          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />

          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />

          <label>Role</label>
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="project_lead">Project Lead</option>
            <option value="designer">Designer</option>
            <option value="writer">Writer</option>
            <option value="reviewer">Reviewer</option>
            <option value="client">Client</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}