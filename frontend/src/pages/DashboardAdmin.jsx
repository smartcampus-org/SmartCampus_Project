import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { adminAPI, userAPI } from '../services/api'

const STATS = [
  { icon: '👥', label: 'Utilisateurs', value: '—', color: '#dbeafe', key: 'users' },
  { icon: '🎓', label: 'Étudiants', value: '—', color: '#d1fae5', key: 'etudiants' },
  { icon: '👨‍🏫', label: 'Professeurs', value: '—', color: '#ede9fe', key: 'professeurs' },
  { icon: '🏢', label: 'Personnel', value: '—', color: '#fef3c7', key: 'personnel' },
]

const ACTIONS = [
  { icon: '👤', title: 'Gérer les utilisateurs', desc: 'Créer, modifier ou désactiver des comptes', color: '#dbeafe' },
  { icon: '🔑', title: 'Gestion des rôles', desc: 'Attribuer et modifier les permissions', color: '#ede9fe' },
  { icon: '📋', title: 'Journal d\'audit', desc: 'Consulter les connexions et actions', color: '#fef3c7' },
  { icon: '📧', title: 'Notifications', desc: 'Envoyer des messages aux utilisateurs', color: '#d1fae5' },
  { icon: '📊', title: 'Rapports', desc: 'Statistiques et exports de données', color: '#fce7f3' },
  { icon: '⚙️', title: 'Paramètres', desc: 'Configuration générale du système', color: '#fee2e2' },
]

export default function DashboardAdmin() {
  const navigate  = useNavigate()
  const [profile, setProfile]   = useState(null)
  const [apiMsg,  setApiMsg]    = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const res = await userAPI.getProfile()
      setProfile(res.data)
      // Vérification côté client : si pas ADMIN → redirect
      if (res.data.role !== 'ADMIN') {
        navigate('/dashboard', { replace: true })
        return
      }
    } catch {
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const testAdminAccess = async () => {
    try {
      const res = await adminAPI.test()
      setApiMsg(`✅ ${res.data}`)
    } catch (err) {
      setApiMsg(`❌ ${err.response?.data?.message || 'Accès refusé par le serveur'}`)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--gray-200)', width: 36, height: 36 }} />
          <p style={{ marginTop: 16 }}>Chargement de l'espace administrateur...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      <main className="dashboard">

        {/* Bannière admin */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
          borderRadius: 'var(--radius)',
          padding: '28px 32px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              Espace Administrateur
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
              Tableau de bord Admin 🛡️
            </h1>
            <p style={{ opacity: 0.85, marginTop: 6, fontSize: 15 }}>
              Bonjour, <strong>{profile?.firstName} {profile?.lastName}</strong> — accès complet accordé
            </p>
          </div>
          <span className="badge badge-admin" style={{ fontSize: 14, padding: '6px 16px' }}>
            ADMINISTRATEUR
          </span>
        </div>

        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          {STATS.map((s, i) => (
            <div key={i} className="profile-card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 16px',
              background: s.color,
              border: 'none',
              marginBottom: 0,
            }}>
              <span style={{ fontSize: 32 }}>{s.icon}</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-800)', margin: '8px 0 2px' }}>
                {s.value}
              </span>
              <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <h2>Actions administrateur</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}>
            {ACTIONS.map((a, i) => (
              <div
                key={i}
                style={{
                  background: a.color,
                  borderRadius: 12,
                  padding: '20px 16px',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 10 }}>{a.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)', marginBottom: 4 }}>
                  {a.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Test d'accès API */}
        <div className="profile-card">
          <h2>Vérification d'accès API</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 16 }}>
            Teste que le backend accepte bien votre token avec le rôle ADMIN (endpoint <code>/api/admin/test</code>).
          </p>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={testAdminAccess}
          >
            🔐 Tester l'accès ADMIN
          </button>
          {apiMsg && (
            <div
              className={`alert ${apiMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}
              style={{ marginTop: 16, marginBottom: 0 }}
            >
              {apiMsg}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
