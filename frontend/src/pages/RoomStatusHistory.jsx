import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import StatusHistory from '../components/StatusHistory'
import StatusChangeModal from '../components/StatusChangeModal'
import { roomAPI } from '../services/api'

/**
 * SC-112 — Page complète d'historique des statuts d'une salle.
 * Route : /rooms/:id/history
 *
 * Affiche :
 *  - En-tête avec statut courant
 *  - Bouton "Changer le statut" (ADMIN/PERSONNEL) — ouvre StatusChangeModal
 *  - Timeline paginée complète — StatusHistory
 */
export default function RoomStatusHistory() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()
  const canMutate = ['ADMIN', 'PERSONNEL'].includes(user?.role)

  const [room,          setRoom]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [changeLoading, setChangeLoading] = useState(false)
  const [changeError,   setChangeError]   = useState('')
  const [changeSuccess, setChangeSuccess] = useState('')
  // Clé de rechargement pour forcer le refresh de StatusHistory après un changement
  const [historyKey, setHistoryKey] = useState(0)

  useEffect(() => {
    roomAPI.getById(id)
      .then(res => setRoom(res.data))
      .catch(err => setError(err.response?.status === 404 ? '404' : (err.response?.data?.message || 'Impossible de charger la salle.')))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async ({ newStatus, reason }) => {
    setChangeLoading(true)
    setChangeError('')
    try {
      const res = await roomAPI.changeStatus(id, { newStatus, reason })
      setRoom(prev => ({ ...prev, status: res.data.status }))
      setModalOpen(false)
      setChangeSuccess(`Statut mis à jour : la salle est maintenant ${newStatus.toLowerCase().replace('_', ' ')}.`)
      setHistoryKey(k => k + 1)   // force le rechargement de l'historique
      setTimeout(() => setChangeSuccess(''), 4000)
    } catch (err) {
      setChangeError(err.response?.data?.message || 'Impossible de changer le statut.')
    } finally {
      setChangeLoading(false)
    }
  }

  // ── États ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          <div
            className="spinner"
            style={{ borderTopColor: '#2563eb', borderColor: '#e5e7eb', width: 40, height: 40, margin: '0 auto' }}
            role="status"
            aria-label="Chargement"
          />
          <p style={{ marginTop: 16 }}>Chargement…</p>
        </div>
      </div>
    )
  }

  if (error === '404') {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚪</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Salle introuvable</h2>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => navigate('/rooms')}>
            ← Retour au catalogue
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
        <Navbar />
        <div className="dashboard" style={{ maxWidth: 800 }}>
          <div className="alert alert-error" role="alert">⚠️ {error}</div>
          <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/rooms')}>
            ← Retour au catalogue
          </button>
        </div>
      </div>
    )
  }

  // ── Rendu principal ──────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      {/* Modal changement de statut */}
      <StatusChangeModal
        isOpen={modalOpen}
        currentStatus={room.status}
        roomNumber={room.roomNumber}
        loading={changeLoading}
        onConfirm={handleStatusChange}
        onCancel={() => { setModalOpen(false); setChangeError('') }}
      />

      <main className="dashboard" style={{ maxWidth: 780 }}>

        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" style={{ marginBottom: 20, fontSize: 14, color: '#6b7280' }}>
          <Link to="/rooms" style={{ color: '#2563eb', textDecoration: 'none' }}>Salles</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <Link to={`/rooms/${id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{room.roomNumber}</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#1f2937', fontWeight: 500 }}>Historique des statuts</span>
        </nav>

        {/* Feedback */}
        {changeSuccess && (
          <div className="alert alert-success" role="status" style={{ marginBottom: 20 }}>
            ✅ {changeSuccess}
          </div>
        )}
        {changeError && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 20 }}>
            ⚠️ {changeError}
          </div>
        )}

        {/* ── En-tête ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
          borderRadius: 12, padding: '24px 28px', marginBottom: 24,
          color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              📅 Historique des statuts — {room.building?.name}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>
              Salle {room.roomNumber}
              {room.name && <span style={{ fontWeight: 400, fontSize: 16, marginLeft: 8, opacity: 0.85 }}>— {room.name}</span>}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>Statut actuel :</span>
              <StatusBadge status={room.status} size="md" />
            </div>
          </div>

          {/* Bouton changer statut (ADMIN/PERSONNEL) */}
          {canMutate && (
            <button
              style={{
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 8, color: 'white', cursor: 'pointer',
              }}
              onClick={() => { setChangeError(''); setModalOpen(true) }}
              aria-label="Changer le statut de la salle"
            >
              🔄 Changer le statut
            </button>
          )}
        </div>

        {/* ── Timeline complète ── */}
        <div className="profile-card">
          <h2>📅 Historique complet</h2>
          <StatusHistory key={historyKey} roomId={id} compact={false} />
        </div>

        {/* Retour */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to={`/rooms/${id}`} style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>
            ← Retour au détail de la salle
          </Link>
        </div>

      </main>
    </div>
  )
}
