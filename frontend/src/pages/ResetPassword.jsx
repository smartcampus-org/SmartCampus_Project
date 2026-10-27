import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [form, setForm]       = useState({ token, newPassword: '', confirm: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authAPI.resetPassword({ token: form.token, newPassword: form.newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <div className="auth-logo">
          <div className="logo-icon">🔒</div>
          <h1>Nouveau mot de passe</h1>
          <p>Choisissez un mot de passe sécurisé</p>
        </div>

        {success ? (
          <div>
            <div className="alert alert-success">
              ✅ Mot de passe réinitialisé avec succès ! Redirection...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {!token && (
              <div className="alert alert-warning">
                ⚠️ Token manquant. Utilisez le lien reçu par e-mail.
              </div>
            )}

            <div className="form-group">
              <label>Token de réinitialisation</label>
              <input
                type="text"
                value={form.token}
                onChange={e => setForm({ ...form, token: e.target.value })}
                placeholder="Collez votre token ici"
                required
              />
            </div>

            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="Min. 8 car. avec majuscule, chiffre et symbole"
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                placeholder="Répétez le mot de passe"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                required
                className={form.confirm && form.newPassword !== form.confirm ? 'error' : ''}
              />
              {form.confirm && form.newPassword !== form.confirm && (
                <span className="error-text">Les mots de passe ne correspondent pas</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading || !token}>
              {loading && <span className="spinner" />}
              {loading ? 'Enregistrement...' : 'Réinitialiser'}
            </button>

            <div className="auth-footer" style={{ marginTop: 20 }}>
              <Link to="/login">← Retour à la connexion</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
