import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../../components/auth/api'
import { createStudio, createStudioMembership, getUsers } from './StudioApi'

const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PROJECT_LEAD', label: 'Project Lead' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'WRITER', label: 'Writer' },
  { value: 'REVIEWER', label: 'Reviewer' },
  { value: 'CLIENT_VIEWER', label: 'Client Viewer' },
]

const defaultRoleForUser = role => {
  const roleMap = {
    admin: 'ADMIN',
    project_lead: 'PROJECT_LEAD',
    designer: 'DESIGNER',
    writer: 'WRITER',
    reviewer: 'REVIEWER',
    client: 'CLIENT_VIEWER',
  }
  return roleMap[role] || 'DESIGNER'
}

export default function CreateStudio() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '' })
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const me = await getCurrentUser()
        setCurrentUser(me)

        if (me.role === 'admin') {
          const userList = await getUsers()
          setUsers(userList)
        }
      } catch (e) {
        setError(e.response?.data?.detail || 'Could not load users')
      } finally {
        setLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  const toggleMember = user => {
    setSelectedMembers(prev => {
      const next = { ...prev }

      if (next[user.id]) {
        delete next[user.id]
      } else {
        next[user.id] = defaultRoleForUser(user.role)
      }

      return next
    })
  }

  const updateMemberRole = (userId, role) => {
    setSelectedMembers(prev => ({ ...prev, [userId]: role }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const studio = await createStudio(form)
      const memberships = Object.entries(selectedMembers).map(([userId, role]) =>
        createStudioMembership({
          studio: studio.id,
          user: Number(userId),
          role,
        })
      )

      await Promise.all(memberships)
      navigate('/studios')
    } catch (e) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Failed to create studio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <h1>Create Studio</h1>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <form className="form-card" onSubmit={handleSubmit}>
        <label>Studio Name</label>
        <input
          type="text"
          placeholder="e.g. Moonshot Creative"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <label>Description</label>
        <textarea
          placeholder="What does this studio work on?"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
        />
        {currentUser?.role === 'admin' && (
          <div className="member-picker">
            <div className="member-picker-header">
              <label>Add People</label>
              <span>{Object.keys(selectedMembers).length} selected</span>
            </div>

            {loadingUsers ? (
              <p className="empty-sm">Loading users…</p>
            ) : users.length === 0 ? (
              <p className="empty-sm">No users found.</p>
            ) : (
              <div className="member-list">
                {users.map(user => {
                  const selectedRole = selectedMembers[user.id]
                  return (
                    <div key={user.id} className="member-row">
                      <label className="member-checkbox">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedRole)}
                          onChange={() => toggleMember(user)}
                        />
                        <span>
                          <strong>{user.username}</strong>
                          <small>{user.email}</small>
                        </span>
                      </label>
                      <select
                        value={selectedRole || defaultRoleForUser(user.role)}
                        onChange={e => updateMemberRole(user.id, e.target.value)}
                        disabled={!selectedRole}
                      >
                        {roleOptions.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create Studio'}
        </button>
      </form>
    </div>
  )
}
