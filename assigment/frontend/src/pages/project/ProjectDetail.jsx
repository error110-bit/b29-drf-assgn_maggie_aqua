import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProjects,  getStages } from './proujectapi'
import { getAllAttachments } from '../attachment/taskapi'
import { getTasks } from './proujectapi'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [stats, setStats] = useState({ tasks: 0, attachments: 0, stages: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, tasks, attachments, stages] = await Promise.all([
          getProjects(),
          getTasks(projectId),
          getAllAttachments(),
          getStages(projectId),
        ])
        const proj = projects.find(p => String(p.id) === String(projectId))
        setProject(proj)
        setStats({
          tasks: tasks.length,
          attachments: attachments.filter(a => {
            return tasks.some(t => t.id === a.task)
          }).length,
          stages: stages.length,
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  if (loading) return <div className="loading">Loading project…</div>
  if (!project) return <div className="loading">Project not found.</div>

  const sections = [
    {
      to: `/projects/${projectId}/tasks`,
      label: 'Tasks',
      icon: '',
      count: stats.tasks,
      desc: 'View and manage all tasks',
    },
    {
      to: `/projects/${projectId}/attachments`,
      label: 'Attachments',
      icon: '',
      count: stats.attachments,
      desc: 'Files and documents',
    },
    {
      to: `/projects/${projectId}/discussions`,
      label: 'Discussions',
      icon: '',
      count: stats.stages,
      desc: 'Threads and comments per stage',
    },
  ]

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/studios">Studios</Link> / <span>{project.title}</span>
      </div>

      <div className="project-hero">
        <div>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </div>
      </div>

      <div className="section-grid">
        {sections.map(s => (
          <Link key={s.label} to={s.to} className="section-card">
            <div className="section-icon">{s.icon}</div>
            <div>
              <h3>{s.label}</h3>
              <p>{s.desc}</p>
            </div>
            <span className="section-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}