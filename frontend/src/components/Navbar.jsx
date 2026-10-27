import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function Navbar() {
  const navigate = useNavigate()

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()

  const initials = user
    ? (user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()
    : '?'

  const roleBadgeClass = {
    ADMIN: 'badge-admin',
    ETUDIANT: 'badge-etudiant',
    PERSONNEL: 'badge-personnel',
    PROFESSEUR: 'badge-professeur',
  }[user?.role] || 'badge-etudiant'

  const handleLogout = async () => {
    try { await authAPI.logout() } catch { /* ignore */ }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const dashboardPath = {
    ADMIN: '/dashboard/admin',
    ETUDIANT: '/dashboard/etudiant',
  }[user?.role] || '/dashboard'

  return (
    <nav className="navbar">
      <Link to={dashboardPath} className="navbar-brand">
        <span style={{ fontSize: 24 }}>🎓</span>
        <span>SmartCampus</span>
      </Link>

      <div className="navbar-actions">
        <Link to={dashboardPath} className="navbar-link">Tableau de bord</Link>
        <Link to="/profile" className="navbar-link">Mon profil</Link>

        <div className="navbar-user">
          <div className="avatar">{initials}</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
            <span style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 14 }}>
              {user?.email?.split('@')[0] || 'Utilisateur'}
            </span>
            <span className={`badge ${roleBadgeClass}`} style={{ fontSize: 11, padding: '1px 8px' }}>
              {user?.role || '—'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  )
}
