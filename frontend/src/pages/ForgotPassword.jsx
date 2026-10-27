import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authAPI.forgotPassword({ email })
      setSuccess(true)
    } catch (err) {
      // SC-101 : même en cas d'erreur on affiche le message générique
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <div className="auth-logo">
          <div className="logo-icon">🔑</div>
          <h1>Mot de passe oublié</h1>
          <p>Entrez votre e-mail pour recevoir un lien de réinitialisation</p>
        </div>

        {success ? (
          <div>
            <div className="alert alert-success">
              ✅ Si cet e-mail est associé à un compte, un lien de réinitialisation a été envoyé.
            </div>
            <p style={{ fontSize: 14, color: 'var(--gray-400)', textAlign: 'center', marginBottom: 20 }}>
              Vérifiez votre boîte mail et suivez les instructions.
            </p>
            <Link to="/login">
              <button className="btn btn-outline">← Retour à la connexion</button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <div className="form-group">
              <label>E-mail institutionnel</label>
              <input
                type="email"
                placeholder="prenom.nom@smartcampus.ma"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Envoi...' : 'Envoyer le lien'}
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
