import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import RoomTypeBadge from '../components/RoomTypeBadge'
import ConfirmModal from '../components/ConfirmModal'
import { roomAPI } from '../services/api'

/**
 * SC-109 / SC-110 — Page de détail d'une salle.
 *
 * SC-109 : affichage complet (infos, équipements, historique)
 * SC-110 : actions de gestion (modifier, supprimer) pour ADMIN/PERSONNEL
 *
 * Règle SC-21 : salle FERMEE → 404 pour ETUDIANT (géré backend)
 */
export default function RoomDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const location     = useLocation()

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()
  const role      = user?.role ?? ''
  const canMutate = ['ADMIN', 'PERSONNEL'].includes(role)

  const [room,          setRoom]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [deleteOpen,    setDeleteOpen]    = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError,   setDeleteError]   = useState('')

  // Message de succès transmis depuis RoomForm (après create/edit)
  const successMsg = location.state?.success ?? ''

  useEffect(() => {
    roomAPI.getById(id)
      .then(res => setRoom(res.data))
      .catch(err => {
        setError(err.response?.status === 404 ? '404' : (err.response?.data?.message || 'Impossible de charger la salle.'))
      })
      .finally(() => setLoading(false))
  }, [id])

  // --- Suppression ---
  const handleDelete = async () => {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await roomAPI.delete(id)
      navigate('/rooms', { state: { success: 'Salle supprimée avec succès.' } })
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Impossible de supprimer la salle.')
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  // ── États de chargement / erreur ─────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          <div
            className="spinner"
            style={{ borderTopColor: '#2563eb', borderColor: '#e5e7eb', width: 40, height: 40, margin: '0 auto' }}
            role="status"
            aria-label="Chargement de la salle"
          />
          <p style={{ marginTop: 16 }}>Chargement de la salle…</p>
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
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>
            Salle introuvable
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 24 }}>
            Cette salle n'existe pas ou vous n'avez pas les droits pour la consulter.
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
        <div className="dashboard" style={{ maxWidth: 800 }}>
          <div className="alert alert-error" role="alert">⚠️ {error}</div>
          <button
            className="btn btn-outline"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={() => navigate('/rooms')}
          >
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

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteOpen}
        title="Supprimer la salle"
        message={
          <>
            Voulez-vous vraiment supprimer la salle <strong>{room.roomNumber}</strong> ?
            <br /><br />
            <span style={{ color: '#dc2626', fontSize: 13 }}>
              ⚠️ Cette action est irréversible. Les équipements et l'historique associés seront également supprimés.
            </span>
          </>
        }
        confirmLabel="Supprimer"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <main className="dashboard" style={{ maxWidth: 860 }}>

        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" style={{ marginBottom: 20, fontSize: 14, color: '#6b7280' }}>
          <Link to="/rooms" style={{ color: '#2563eb', textDecoration: 'none' }}>Salles</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#1f2937', fontWeight: 500 }}>{room.roomNumber}</span>
        </nav>

        {/* Message de succès (après create/edit) */}
        {successMsg && (
          <div className="alert alert-success" role="status" style={{ marginBottom: 20 }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Erreur de suppression */}
        {deleteError && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 20 }}>
            ⚠️ {deleteError}
          </div>
        )}

        {/* ── Bannière ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          borderRadius: 12,
          padding: '28px 32px',
          marginBottom: 24,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              {room.building?.name} · Étage {room.floor}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px' }}>
              {room.roomNumber}
              {room.name && (
                <span style={{ fontWeight: 400, fontSize: 20, marginLeft: 10, opacity: 0.85 }}>
                  — {room.name}
                </span>
              )}
            </h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <StatusBadge status={room.status} size="lg" />
              <RoomTypeBadge type={room.type} />
            </div>
          </div>

          {/* Actions ADMIN/PERSONNEL */}
          {canMutate && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                style={ghostBtn}
                onClick={() => navigate(`/rooms/${room.id}/edit`)}
                aria-label="Modifier la salle"
              >
                ✏️ Modifier
              </button>
              <button
                style={{ ...ghostBtn, background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.5)' }}
                onClick={() => setDeleteOpen(true)}
                aria-label="Supprimer la salle"
              >
                🗑️ Supprimer
              </button>
            </div>
          )}
        </div>

        {/* ── Informations générales ── */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <h2>📋 Informations générales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            <InfoItem label="Bâtiment"  value={room.building?.name}              icon="🏢" />
            <InfoItem label="Étage"     value={`Étage ${room.floor}`}             icon="📍" />
            <InfoItem label="Capacité"  value={`${room.capacity} places`}         icon="👥" />
            <InfoItem label="Type"      value={<RoomTypeBadge type={room.type} />} icon="🏷️" />
            <InfoItem label="Statut"    value={<StatusBadge status={room.status} />} icon="🔵" />
            {room.building?.floors !== undefined && (
              <InfoItem
                label="Nb étages (bât.)"
                value={`${room.building.floors} étage${room.building.floors > 1 ? 's' : ''}`}
                icon="🏗️"
              />
            )}
          </div>
          {room.description && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Description
              </span>
              <p style={{ marginTop: 6, color: '#374151', fontSize: 14, lineHeight: 1.6 }}>
                {room.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Équipements ── */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #e5e7eb',
          }}>
            <h2 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
              🖥️ Équipements
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: '#9ca3af' }}>
                ({room.equipments?.length ?? 0})
              </span>
            </h2>
            {canMutate && (
              <button
                className="btn btn-outline"
                style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
                onClick={() => navigate(`/rooms/${room.id}/equipments`)}
              >
                + Gérer
              </button>
            )}
          </div>

          {!room.equipments || room.equipments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <p style={{ fontSize: 14 }}>Aucun équipement enregistré pour cette salle.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {room.equipments.map(eq => <EquipmentRow key={eq.id} equipment={eq} />)}
            </div>
          )}
        </div>

        {/* ── Historique des statuts ── */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #e5e7eb',
          }}>
            <h2 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
              📅 Historique des statuts
            </h2>
            <Link
              to={`/rooms/${room.id}/history`}
              style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
            >
              Voir tout →
            </Link>
          </div>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            Consultez l'historique complet des changements de statut pour cette salle.
          </p>
        </div>

        {/* ── Méta ── */}
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#9ca3af', justifyContent: 'flex-end' }}>
          <span>Créé le {formatDate(room.createdAt)}</span>
          <span>Mis à jour le {formatDate(room.updatedAt)}</span>
        </div>

      </main>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────

const ghostBtn = {
  padding: '9px 18px',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: 8,
  color: 'white',
  transition: 'background 0.15s',
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function InfoItem({ label, value, icon }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#1f2937' }}>
        {value ?? '—'}
      </div>
    </div>
  )
}

function EquipmentRow({ equipment }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', background: '#f9fafb',
      borderRadius: 8, border: '1px solid #e5e7eb',
    }}>
      <span style={{ fontSize: 20 }}>🖥️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{equipment.name}</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          {equipment.type}{equipment.notes && ` · ${equipment.notes}`}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>x{equipment.quantity}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
          background: equipment.functional ? '#d1fae5' : '#fee2e2',
          color:      equipment.functional ? '#065f46' : '#991b1b',
        }}>
          {equipment.functional ? '✓ OK' : '✗ HS'}
        </span>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
