import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userAPI, authAPI } from '../services/api'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [pwdForm, setPwdForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    userAPI.getProfile()
      .then(res => setProfile(res.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    try { await authAPI.logout() } catch (_) {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handlePasswordChange = async e => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setPwdError('Les mots de passe ne correspondent pas.')
      return
    }
    setPwdLoading(true)
    setPwdError('')
    setPwdSuccess('')
    try {
      await userAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      })
      setPwdSuccess('Mot de passe mis à jour avec succès !')
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Erreur lors du changement')
    } finally {
      setPwdLoading(false)
    }
  }

  const getRoleBadge = role => {
    const map = {
      ADMIN: 'badge-admin', ETUDIANT: 'badge-etudiant',
      PERSONNEL: 'badge-personnel', PROFESSEUR: 'badge-professeur'
    }
    return map[role] || 'badge-etudiant'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ borderTopColor: '#2563eb', borderColor: '#e5e7eb', width: 36, height: 36 }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span>🎓</span>
          <span>Smart<span style={{ color: '#7c3aed' }}>Campus</span></span>
        </Link>
        <div className="navbar-actions">
          <Link to="/dashboard">
            <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}>
              ← Dashboard
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
          <h1>Mon profil</h1>
          <p>Gérez vos informations personnelles</p>
        </div>

        {/* Profil info */}
        {profile && (
          <div className="profile-card">
            <h2>👤 Informations personnelles</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 28
              }}>
                {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>
                  {profile.firstName} {profile.lastName}
                </h3>
                <span className={`badge ${getRoleBadge(profile.role)}`}>
                  {profile.role}
                </span>
              </div>
            </div>

            <div className="profile-info">
              <div className="info-item">
                <label>Prénom</label>
                <p>{profile.firstName}</p>
              </div>
              <div className="info-item">
                <label>Nom</label>
                <p>{profile.lastName}</p>
              </div>
              <div className="info-item">
                <label>E-mail</label>
                <p>{profile.email}</p>
              </div>
              <div className="info-item">
                <label>Rôle</label>
                <p><span className={`badge ${getRoleBadge(profile.role)}`}>{profile.role}</span></p>
              </div>
              <div className="info-item">
                <label>ID utilisateur</label>
                <p>#{profile.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Changer mot de passe */}
        <div className="profile-card">
          <h2>🔒 Changer le mot de passe</h2>

          {pwdError   && <div className="alert alert-error">⚠️ {pwdError}</div>}
          {pwdSuccess && <div className="alert alert-success">✅ {pwdSuccess}</div>}

          <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
            <div className="form-group">
              <label>Mot de passe actuel</label>
              <input
                type="password"
                placeholder="••••••••"
                value={pwdForm.currentPassword}
                onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="Min. 8 car. avec majuscule, chiffre et symbole"
                value={pwdForm.newPassword}
                onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                placeholder="Répétez le mot de passe"
                value={pwdForm.confirm}
                onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                required
                className={pwdForm.confirm && pwdForm.newPassword !== pwdForm.confirm ? 'error' : ''}
              />
              {pwdForm.confirm && pwdForm.newPassword !== pwdForm.confirm && (
                <span className="error-text">Les mots de passe ne correspondent pas</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '12px 28px' }}
              disabled={pwdLoading}
            >
              {pwdLoading && <span className="spinner" />}
              {pwdLoading ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
