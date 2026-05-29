import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../../components/auth/api'
import { getStudios } from './StudioApi'

export default function StudioList() {
  const [studios, setStudios] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStudios(), getCurrentUser()])
      .then(([s, user]) => {
        setStudios(s)
        setCurrentUser(user)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading studios…</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Studios</h1>
        {currentUser?.role === 'admin' && (
          <Link to="/studios/create" className="btn-primary">+ New Studio</Link>
        )}
      </div>

      {studios.length === 0 && (
        <p className="empty">
          {currentUser?.role === 'admin' ? 'No studios yet. Create the first one!' : 'No studios assigned yet.'}
        </p>
      )}

      <div className="card-grid">
        {studios.map(studio => (
          <div key={studio.id} className="card">
            <h3>{studio.name}</h3>
            <p>{studio.description}</p>
            <div className="card-actions">
              <Link to={`/studios/${studio.id}/projects`} className="btn-primary">
                View Projects →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
