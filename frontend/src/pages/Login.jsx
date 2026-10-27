import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

// Détecte le type d'erreur pour afficher un message adapté
function parseLoginError(err) {
  const msg = (err.response?.data?.message || '').toLowerCase()
  const status = err.response?.status

  if (status === 423 || msg.includes('verrou') || msg.includes('lock') || msg.includes('bloqué')) {
    return {
      type: 'locked',
      text: 'Votre compte est temporairement verrouillé après plusieurs tentatives échouées. Réinitialisez votre mot de passe pour le déverrouiller.',
    }
  }
  if (status === 401 || msg.includes('incorrect') || msg.includes('invalid') || msg.includes('identifiant')) {
    return {
      type: 'credentials',
      text: 'E-mail ou mot de passe incorrect. Vérifiez vos identifiants.',
    }
  }
  if (msg.includes('désactivé') || msg.includes('disabled')) {
    return { type: 'disabled', text: 'Ce compte a été désactivé. Contactez l\'administration.' }
  }
  return { type: 'generic', text: err.response?.data?.message || 'Erreur de connexion. Réessayez.' }
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState(null)   // { type, text }
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await authAPI.login(form)
      localStorage.setItem('token', res.data.accessToken)
      localStorage.setItem('user', JSON.stringify({
        id: res.data.userId,
        email: res.data.email,
        role: res.data.role
      }))
      // Redirection selon le rôle
      const role = res.data.role
      if (role === 'ADMIN')     navigate('/dashboard/admin')
      else if (role === 'ETUDIANT') navigate('/dashboard/etudiant')
      else navigate('/dashboard')
    } catch (err) {
      setError(parseLoginError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <div className="auth-logo">
          <div className="logo-icon">🎓</div>
          <h1>SmartCampus</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div className={`alert ${error.type === 'locked' ? 'alert-warning' : 'alert-error'}`}>
            {error.type === 'locked' ? '🔒' : '⚠️'} {error.text}
            {error.type === 'locked' && (
              <div style={{ marginTop: 8 }}>
                <Link to="/forgot-password" className="link" style={{ fontSize: 13 }}>
                  → Réinitialiser le mot de passe
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail institutionnel</label>
            <input
              type="email"
              name="email"
              placeholder="prenom.nom@smartcampus.ma"
              value={form.email}
              onChange={handleChange}
              required
              className={error?.type === 'credentials' ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Link to="/forgot-password" className="link" style={{ fontSize: 14 }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-footer">
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </div>
      </div>
    </div>
  )
}
