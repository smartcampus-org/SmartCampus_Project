import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { etudiantAPI, userAPI } from '../services/api'

const MODULES = [
  { icon: '📐', label: 'Mathématiques', note: '15.5/20', statut: 'En cours', color: '#dbeafe' },
  { icon: '💻', label: 'Algorithmique', note: '17/20',   statut: 'En cours', color: '#d1fae5' },
  { icon: '🔌', label: 'Réseaux',       note: '14/20',   statut: 'En cours', color: '#ede9fe' },
  { icon: '🗄️', label: 'Bases de données', note: '16/20', statut: 'En cours', color: '#fef3c7' },
]

const SERVICES = [
  { icon: '📅', title: 'Emploi du temps',     desc: 'Planning hebdomadaire de vos cours',      color: '#dbeafe' },
  { icon: '📝', title: 'Notes & résultats',   desc: 'Consulter vos relevés de notes',          color: '#d1fae5' },
  { icon: '🎓', title: 'Scolarité',           desc: 'Demandes et documents administratifs',    color: '#fef3c7' },
  { icon: '📚', title: 'Bibliothèque',        desc: 'Ressources pédagogiques en ligne',        color: '#ede9fe' },
  { icon: '💬', title: 'Messagerie',          desc: 'Contacter vos professeurs',               color: '#d1fae5' },
  { icon: '🏆', title: 'Classements',         desc: 'Voir votre position dans la promotion',   color: '#fce7f3' },
]

const AGENDA = [
  { heure: '08h30', matiere: 'Algorithmique',     salle: 'A101', type: 'CM' },
  { heure: '10h30', matiere: 'Mathématiques',     salle: 'B205', type: 'TD' },
  { heure: '14h00', matiere: 'Bases de données',  salle: 'Info3', type: 'TP' },
]

export default function DashboardEtudiant() {
  const navigate = useNavigate()
  const [profile, setProfile]  = useState(null)
  const [apiMsg,  setApiMsg]   = useState('')
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const res = await userAPI.getProfile()
      setProfile(res.data)
      // Vérification côté client : si pas ETUDIANT → redirect
      if (res.data.role !== 'ETUDIANT') {
        navigate('/dashboard', { replace: true })
        return
      }
    } catch {
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const testEtudiantAccess = async () => {
    try {
      const res = await etudiantAPI.test()
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
          <p style={{ marginTop: 16 }}>Chargement de votre espace étudiant...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      <main className="dashboard">

        {/* Bannière étudiant */}
        <div style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)',
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
              Espace Étudiant
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
              Mon tableau de bord 🎓
            </h1>
            <p style={{ opacity: 0.85, marginTop: 6, fontSize: 15 }}>
              Bonjour, <strong>{profile?.firstName} {profile?.lastName}</strong> — bonne journée d'études !
            </p>
          </div>
          <span className="badge badge-etudiant" style={{ fontSize: 14, padding: '6px 16px' }}>
            ÉTUDIANT
          </span>
        </div>

        {/* Agenda du jour */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <h2>📅 Cours d'aujourd'hui</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {AGENDA.map((c, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                background: 'var(--gray-100)',
                borderRadius: 10,
                borderLeft: '4px solid var(--primary)',
              }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: 52, fontSize: 14 }}>{c.heure}</span>
                <span style={{ flex: 1, fontWeight: 600, color: 'var(--gray-800)' }}>{c.matiere}</span>
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Salle {c.salle}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  background: c.type === 'TP' ? '#d1fae5' : c.type === 'TD' ? '#fef3c7' : '#dbeafe',
                  color: c.type === 'TP' ? '#065f46' : c.type === 'TD' ? '#92400e' : '#1e40af',
                }}>
                  {c.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mes modules / notes */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <h2>📊 Mes modules</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
          }}>
            {MODULES.map((m, i) => (
              <div key={i} style={{
                background: m.color,
                borderRadius: 12,
                padding: '18px 16px',
                border: '1px solid rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)', marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{m.note}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2 }}>{m.statut}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <h2>🎓 Mes services</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
          }}>
            {SERVICES.map((s, i) => (
              <div
                key={i}
                style={{
                  background: s.color,
                  borderRadius: 12,
                  padding: '18px 16px',
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
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-800)', marginBottom: 4 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Test d'accès API */}
        <div className="profile-card">
          <h2>Vérification d'accès API</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 16 }}>
            Teste que le backend accepte bien votre token avec le rôle ETUDIANT (endpoint <code>/api/etudiant/test</code>).
          </p>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={testEtudiantAccess}
          >
            🔐 Tester l'accès ETUDIANT
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
