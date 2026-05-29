import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAllAttachments } from './taskapi'
import { getTasks } from '../project/proujectapi'

export default function AttachmentList() {
  const { projectId } = useParams()
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [tasks, allAttachments] = await Promise.all([
          getTasks(projectId),
          getAllAttachments(),
        ])
        const taskIds = new Set(tasks.map(t => t.id))
        setAttachments(allAttachments.filter(a => taskIds.has(a.task)))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  if (loading) return <div className="loading">Loading attachments…</div>

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to={`/projects/${projectId}`}>Project</Link> / Attachments
      </div>
      <div className="page-header">
        <h1>Attachments</h1>
        <Link to={`/projects/${projectId}/attachments/create`} className="btn-primary">+ Upload</Link>
      </div>

      {attachments.length === 0 && <p className="empty">No attachments yet.</p>}

      <div className="list">
        {attachments.map(a => (
          <div key={a.id} className="list-item">
            <div className="list-item-main">
              <h3>Attachment #{a.id}</h3>
              <p>{a.description}</p>
              <p className="meta">Task ID: {a.task}</p>
            </div>
            <div className="list-item-side">
              <a href={a.file_url} target="_blank" rel="noreferrer" className="btn-secondary">
                View File
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}