import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { createAttachment} from './taskapi'
import { getTasks } from '../project/proujectapi'

export default function CreateAttachment() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ task: '', description: '', file_url: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getTasks(projectId).then(setTasks).catch(console.error)
  }, [projectId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createAttachment(form)
      navigate(`/projects/${projectId}/attachments`)
    } catch (e) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="breadcrumb">
        <Link to={`/projects/${projectId}`}>Project</Link> / <Link to={`/projects/${projectId}/attachments`}>Attachments</Link> / New
      </div>
      <div className="page-header"><h1>Upload Attachment</h1></div>
      {error && <p className="error-msg">{error}</p>}
      <form className="form-card" onSubmit={handleSubmit}>
        <label>Task</label>
        <select value={form.task} onChange={e => setForm({ ...form, task: e.target.value })} required>
          <option value="">— Select a task —</option>
          {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>

        <label>Description</label>
        <textarea placeholder="What is this file?" value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })} required />

        <label>File URL</label>
        <input type="url" placeholder="https://…" value={form.file_url}
          onChange={e => setForm({ ...form, file_url: e.target.value })} required />

        <button type="submit" disabled={loading}>{loading ? 'Uploading…' : 'Upload'}</button>
      </form>
    </div>
  )
}