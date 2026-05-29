import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { createProject } from './proujectapi'

export default function CreateProject() {
  const navigate = useNavigate()
  const { studioId } = useParams()
  const [form, setForm] = useState({ title: '', description: '', lead_by: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createProject({ ...form, studio: studioId })
      navigate(`/studios/${studioId}/projects`)
    } catch (e) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="breadcrumb">
        <Link to="/studios">Studios</Link> / <Link to={`/studios/${studioId}/projects`}>Projects</Link> / New
      </div>
      <div className="page-header"><h1>Create Project</h1></div>
      {error && <p className="error-msg">{error}</p>}
      <form className="form-card" onSubmit={handleSubmit}>
        <label>Project Title</label>
        <input
          type="text"
          placeholder="e.g. Brand Refresh 2026"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
        <label>Description</label>
        <textarea
          placeholder="What is this project about?"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
        />
        <label>Lead User ID</label>
        <input
          type="number"
          placeholder="User ID of project lead"
          value={form.lead_by}
          onChange={e => setForm({ ...form, lead_by: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}