import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">Creative Workflow</Link>
      <nav>
        <Link to="/studios">Studios</Link>
        <Link to="/notifications">Notifications</Link>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </nav>
    </header>
  )
}