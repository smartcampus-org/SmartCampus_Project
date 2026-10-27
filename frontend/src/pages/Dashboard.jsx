import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI, adminAPI, etudiantAPI } from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [testResult, setTestResult] = useState('')
  const [testError, setTestError]   = useState('')

  const handleLogout = async () => {
    try { await authAPI.logout() } catch (_) {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const testAccess = async () => {
    setTestResult('')
    setTestError('')
    try {
      let res
      if (user.role === 'ADMIN')    res = await adminAPI.test()
      else                          res = await etudiantAPI.test()
      setTestResult(res.data)
    } catch (err) {
      setTestError(err.response?.data?.message || 'Accès refusé (403)')
    }
  }

  const getRoleBadge = role => {
    const map = {
      ADMIN:      'badge-admin',
      ETUDIANT:   'badge-etudiant',
      PERSONNEL:  'badge-personnel',
      PROFESSEUR: 'badge-professeur'
    }
    return map[role] || 'badge-etudiant'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span>🎓</span>
          <span>Smart<span style={{color:'#7c3aed'}}>Campus</span></span>
        </Link>
        <div className="navbar-actions">
          <div className="navbar-user">
            <div className="avatar">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>
              {user.email}
            </span>
          </div>
          <Link to="/profile">
            <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}>
              Mon profil
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Tableau de bord</h1>
          <p>Bienvenue sur votre espace SmartCampus</p>
        </div>

        {/* Info card */}
        <div className="profile-card">
          <h2>👤 Informations du compte</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 24
            }}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 16 }}>{user.email}</p>
              <span className={`badge ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Test accès */}
        <div className="profile-card">
          <h2>🔐 Test d'accès par rôle</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 16 }}>
            Testez votre accès selon votre rôle ({user.role})
          </p>

          <button
            onClick={testAccess}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
          >
            Tester l'accès {user.role}
          </button>

          {testResult && (
            <div className="alert alert-success" style={{ marginTop: 16 }}>
              ✅ {testResult}
            </div>
          )}
          {testError && (
            <div className="alert alert-error" style={{ marginTop: 16 }}>
              ❌ {testError}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="profile-card">
          <h2>⚡ Actions rapides</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/profile">
              <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 20px' }}>
                👤 Mon profil
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ width: 'auto', padding: '10px 20px' }}
            >
              🚪 Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
