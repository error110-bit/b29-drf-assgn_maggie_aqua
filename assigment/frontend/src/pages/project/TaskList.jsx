import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTasks } from './proujectapi'

const PRIORITY_COLOR = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444' }

export default function TaskList() {
  const { projectId } = useParams()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTasks(projectId)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return <div className="loading">Loading tasks…</div>

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to={`/projects/${projectId}`}>Project</Link> / Tasks
      </div>
      <div className="page-header">
        <h1>Tasks</h1>
        <Link to={`/projects/${projectId}/tasks/create`} className="btn-primary">+ New Task</Link>
      </div>

      {tasks.length === 0 && <p className="empty">No tasks yet. Create the first one!</p>}

      <div className="list">
        {tasks.map(task => (
          <div key={task.id} className="list-item">
            <div className="list-item-main">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              {task.deadline && <p className="meta">Due: {new Date(task.deadline).toLocaleDateString()}</p>}
            </div>
            <div className="list-item-side">
              <span
                className="badge"
                style={{ background: PRIORITY_COLOR[task.priority] || '#64748b' }}
              >
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}