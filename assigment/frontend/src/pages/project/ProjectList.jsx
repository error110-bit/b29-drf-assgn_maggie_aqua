import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getProjects, joinProject } from './proujectapi'
import { getCurrentUser } from '../../components/auth/api'
export default function ProjectList() {
  const { studioId } = useParams()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [memberOf, setMemberOf] = useState(new Set())
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)

  const fetchData = async (userId) => {
    try {
      const all = await getProjects()
      const studioProjects = all.filter(p => String(p.studio) === String(studioId))
      setProjects(studioProjects)

      const memberResults = await Promise.all(
        studioProjects.map(p => getProjectMembers(p.id))
      )
      const joined = new Set()
      studioProjects.forEach((p, i) => {
        if (memberResults[i].some(m => m.user === userId)) {
          joined.add(p.id)
        }
      })
      setMemberOf(joined)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUserId(user.id)
        await fetchData(user.id)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [studioId])

  const handleJoin = async (projectId) => {
    setJoining(projectId)
    try {
      await joinProject(projectId)
      navigate(`/projects/${projectId}`)
    } catch (e) {
      const msg = e.response?.data?.detail || 'Could not join project'
      if (e.response?.status === 400) {
        navigate(`/projects/${projectId}`)
      } else {
        alert(msg)
      }
    } finally {
      setJoining(null)
    }
  }

  if (loading) return <div className="loading">Loading projects…</div>

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/studios">Studios</Link> / Projects
      </div>
      <div className="page-header">
        <h1>Projects</h1>
        <Link to={`/studios/${studioId}/projects/create`} className="btn-primary">+ New Project</Link>
      </div>

      {projects.length === 0 && (
        <p className="empty">No projects in this studio yet.</p>
      )}

      <div className="card-grid">
        {projects.map(project => {
          const isMember = memberOf.has(project.id)
          return (
            <div key={project.id} className="card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="card-actions">
                {isMember ? (
                  <Link to={`/projects/${project.id}`} className="btn-primary">
                    Open Project →
                  </Link>
                ) : (
                  <button
                    className="btn-secondary"
                    onClick={() => handleJoin(project.id)}
                    disabled={joining === project.id}
                  >
                    {joining === project.id ? 'Joining…' : 'Join Project'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}