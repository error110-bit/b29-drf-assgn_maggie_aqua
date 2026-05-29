import { useEffect, useState } from 'react'
import { getNotifications } from './NotificationApi'

const TYPE_COLOR = {
  Comment: '#6366f1',
  Task: '#f59e0b',
  Stage: '#22c55e',
  Deadline: '#ef4444',
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading notifications…</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notifications</h1>
      </div>

      {notifications.length === 0 && <p className="empty">You're all caught up!</p>}

      <div className="list">
        {notifications.map(n => (
          <div key={n.id} className={`list-item ${!n.is_read ? 'unread' : ''}`}>
            <div className="list-item-main">
              <h3>{n.title}</h3>
              <p>{n.message}</p>
              <p className="meta">{new Date(n.created_at).toLocaleString()}</p>
            </div>
            <div className="list-item-side">
              <span className="badge" style={{ background: TYPE_COLOR[n.type] || '#64748b' }}>
                {n.type}
              </span>
              {!n.is_read && <span className="dot-unread" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}