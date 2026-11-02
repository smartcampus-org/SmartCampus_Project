import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import EquipmentList from '../components/EquipmentList'
import { roomAPI, equipmentAPI } from '../services/api'

/**
 * SC-111 — Page de gestion des équipements d'une salle.
 * Route : /rooms/:id/equipments
 *
 * Accessible à tous les rôles authentifiés (lecture).
 * Les mutations (ajout, modification, suppression) sont réservées à ADMIN/PERSONNEL
 * — contrôle géré dans EquipmentList via `canMutate`.
 *
 * Charge la salle (pour l'en-tête) puis les équipements via l'API.
 */
export default function RoomEquipments() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()
  const canMutate = ['ADMIN', 'PERSONNEL'].includes(user?.role)

  const [room,        setRoom]        = useState(null)
  const [equipments,  setEquipments]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    // Charge la salle et ses équipements en parallèle
    Promise.all([
      roomAPI.getById(id),
      equipmentAPI.findByRoom(id),
    ])
      .then(([roomRes, eqRes]) => {
        setRoom(roomRes.data)
        setEquipments(eqRes.data)
      })
      .catch(err => {
        setError(
          err.response?.status === 404
            ? '404'
            : err.response?.data?.message || 'Impossible de charger les données.'
        )
      })
      .finally(() => setLoading(false))
  }, [id])

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
          <p style={{ marginTop: 16 }}>Chargement des équipements…</p>
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
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>
            Salle introuvable
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 24 }}>
            Cette salle n'existe pas ou vous n'avez pas accès à ses équipements.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '12px 28px' }}
            onClick={() => navigate('/rooms')}
          >
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
        <div className="dashboard" style={{ maxWidth: 860 }}>
          <div className="alert alert-error" role="alert">⚠️ {error}</div>
          <button
            className="btn btn-outline"
            style={{ width: 'auto', padding: '10px 24px', marginTop: 12 }}
            onClick={() => navigate('/rooms')}
          >
            ← Retour au catalogue
          </button>
        </div>
      </div>
    )
  }

  // ── Rendu principal ──────────────────────────────────────────────────────

  const functional  = equipments.filter(e => e.functional).length
  const outOfService = equipments.filter(e => !e.functional).length

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      <main className="dashboard" style={{ maxWidth: 860 }}>

        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" style={{ marginBottom: 20, fontSize: 14, color: '#6b7280' }}>
          <Link to="/rooms" style={{ color: '#2563eb', textDecoration: 'none' }}>Salles</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <Link to={`/rooms/${id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
            {room.roomNumber}
          </Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#1f2937', fontWeight: 500 }}>Équipements</span>
        </nav>

        {/* ── En-tête salle ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)',
          borderRadius: 12, padding: '22px 28px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12, color: 'white',
        }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              🖥️ Équipements — {room.building?.name}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>
              Salle {room.roomNumber}
              {room.name && <span style={{ fontWeight: 400, fontSize: 16, marginLeft: 8, opacity: 0.85 }}>— {room.name}</span>}
            </h1>
            <StatusBadge status={room.status} size="sm" />
          </div>

          {/* Compteurs */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <StatPill icon="📦" label="Total"    value={equipments.length} bg="rgba(255,255,255,0.15)" />
            <StatPill icon="✓"  label="Fonct."   value={functional}        bg="rgba(16,185,129,0.25)" />
            <StatPill icon="✗"  label="Hors serv." value={outOfService}    bg="rgba(239,68,68,0.25)" />
          </div>
        </div>

        {/* ── Zone équipements ── */}
        <div className="profile-card">
          <EquipmentList
            roomId={id}
            equipments={equipments}
            canMutate={canMutate}
            onUpdated={setEquipments}
          />
        </div>

        {/* Lien retour détail */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link
            to={`/rooms/${id}`}
            style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}
          >
            ← Retour au détail de la salle
          </Link>
        </div>

      </main>
    </div>
  )
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function StatPill({ icon, label, value, bg }) {
  return (
    <div style={{
      background: bg, borderRadius: 10, padding: '8px 14px',
      textAlign: 'center', minWidth: 72,
    }}>
      <div style={{ fontSize: 18, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{label}</div>
    </div>
  )
}
