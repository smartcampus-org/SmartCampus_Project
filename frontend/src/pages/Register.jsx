import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'ETUDIANT'
  })
  const [errors, setErrors]   = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '', general: '' })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await authAPI.register(form)
      setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object' && !data.message) {
        setErrors(data) // erreurs de validation par champ
      } else {
        setErrors({ general: data?.message || 'Erreur lors de l\'inscription' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <div className="logo-icon">🎓</div>
          <h1>Créer un compte</h1>
          <p>Rejoignez SmartCampus avec votre e-mail institutionnel</p>
        </div>

        {errors.general && (
          <div className="alert alert-error">⚠️ {errors.general}</div>
        )}
        {success && (
          <div className="alert alert-success">✅ {success}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Prénom</label>
              <input
                name="firstName"
                placeholder="Youssef"
                value={form.firstName}
                onChange={handleChange}
                required
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nom</label>
              <input
                name="lastName"
                placeholder="Alami"
                value={form.lastName}
                onChange={handleChange}
                required
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>E-mail institutionnel</label>
            <input
              type="email"
              name="email"
              placeholder="prenom.nom@smartcampus.ma"
              value={form.email}
              onChange={handleChange}
              required
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="Min. 8 car. avec majuscule, chiffre et symbole"
              value={form.password}
              onChange={handleChange}
              required
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Rôle</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="ETUDIANT">Étudiant</option>
              <option value="PERSONNEL">Personnel</option>
              <option value="PROFESSEUR">Professeur</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  )
}
