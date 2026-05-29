import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { createTask, getStages } from './proujectapi'

export default function CreateTask() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [stages, setStages] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM',
    deadline: '', stage: '', assigned_to: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getStages(projectId).then(setStages).catch(console.error)
  }, [projectId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, project: projectId }
      if (!payload.stage) delete payload.stage
      if (!payload.deadline) delete payload.deadline
      await createTask(payload)
      navigate(`/projects/${projectId}/tasks`)
    } catch (e) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="breadcrumb">
        <Link to={`/projects/${projectId}`}>Project</Link> / <Link to={`/projects/${projectId}/tasks`}>Tasks</Link> / New
      </div>
      <div className="page-header"><h1>Create Task</h1></div>
      {error && <p className="error-msg">{error}</p>}
      <form className="form-card" onSubmit={handleSubmit}>
        <label>Title</label>
        <input type="text" placeholder="Task title" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} required />

        <label>Description</label>
        <textarea placeholder="What needs to be done?" value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })} required />

        <label>Priority</label>
        <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <label>Stage (optional)</label>
        <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
          <option value="">— No stage —</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.stage}</option>)}
        </select>

        <label>Deadline (optional)</label>
        <input type="date" value={form.deadline}
          onChange={e => setForm({ ...form, deadline: e.target.value })} />

        <label>Assign to User ID</label>
        <input type="number" placeholder="User ID" value={form.assigned_to}
          onChange={e => setForm({ ...form, assigned_to: e.target.value })} required />

        <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Task'}</button>
      </form>
    </div>
  )
}