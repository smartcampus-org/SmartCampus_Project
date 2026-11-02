import { useState, useEffect } from 'react'
import StatusBadge from './StatusBadge'

/**
 * SC-112 — Modal de changement de statut d'une salle.
 *
 * Affiche le statut actuel, un sélecteur du nouveau statut,
 * un champ raison optionnel et demande une confirmation
 * avant toute action sensible (désactivation, fermeture).
 *
 * Props :
 *   isOpen       : boolean
 *   currentStatus: string  (RoomStatus)
 *   roomNumber   : string
 *   loading      : boolean
 *   onConfirm    : ({ newStatus, reason }) => void
 *   onCancel     : () => void
 */

const STATUSES = [
  {
    value: 'DISPONIBLE',
    label: 'Disponible',
    desc: 'La salle est accessible et peut être utilisée.',
    icon: '✅',
    sensitive: false,
  },
  {
    value: 'OCCUPEE',
    label: 'Occupée',
    desc: 'La salle est actuellement en cours d\'utilisation.',
    icon: '🔶',
    sensitive: false,
  },
  {
    value: 'EN_MAINTENANCE',
    label: 'En maintenance',
    desc: 'La salle est temporairement indisponible pour travaux.',
    icon: '🔧',
    sensitive: true,
  },
  {
    value: 'FERMEE',
    label: 'Fermée',
    desc: 'La salle est désactivée. Les étudiants ne la verront plus.',
    icon: '🚫',
    sensitive: true,
  },
]

export default function StatusChangeModal({
  isOpen,
  currentStatus,
  roomNumber,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [selected, setSelected] = useState(currentStatus)
  const [reason,   setReason]   = useState('')
  const [error,    setError]    = useState('')

  // Réinitialise à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setSelected(currentStatus)
      setReason('')
      setError('')
    }
  }, [isOpen, currentStatus])

  if (!isOpen) return null

  const chosenConfig  = STATUSES.find(s => s.value === selected)
  const isUnchanged   = selected === currentStatus
  const isSensitive   = chosenConfig?.sensitive

  const handleSubmit = () => {
    if (isUnchanged) {
      setError('Veuillez sélectionner un statut différent du statut actuel.')
      return
    }
    setError('')
    onConfirm({ newStatus: selected, reason: reason.trim() || null })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '28px 28px 24px',
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
      }}>
        {/* En-tête */}
        <div style={{ marginBottom: 20 }}>
          <h2 id="status-modal-title" style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: '0 0 6px' }}>
            🔄 Changer le statut
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Salle <strong>{roomNumber}</strong> — statut actuel :&nbsp;
            <StatusBadge status={currentStatus} size="sm" />
          </p>
        </div>

        {/* Sélecteur de statut */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}
          role="radiogroup"
          aria-label="Nouveau statut"
        >
          {STATUSES.map(s => {
            const isActive = selected === s.value
            const isCurrent = currentStatus === s.value
            return (
              <label
                key={s.value}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `2px solid ${isActive ? '#2563eb' : '#e5e7eb'}`,
                  background: isActive ? '#eff6ff' : isCurrent ? '#f9fafb' : 'white',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="newStatus"
                  value={s.value}
                  checked={isActive}
                  onChange={() => { setSelected(s.value); setError('') }}
                  style={{ marginTop: 3, accentColor: '#2563eb' }}
                  aria-label={s.label}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15 }}>{s.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>
                      {s.label}
                    </span>
                    {isCurrent && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 7px',
                        borderRadius: 10, background: '#dbeafe', color: '#1e40af',
                      }}>
                        ACTUEL
                      </span>
                    )}
                    {s.sensitive && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 7px',
                        borderRadius: 10, background: '#fef3c7', color: '#92400e',
                      }}>
                        ⚠️ SENSIBLE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{s.desc}</div>
                </div>
              </label>
            )
          })}
        </div>

        {/* Alerte statut sensible */}
        {isSensitive && !isUnchanged && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: '#92400e',
            marginBottom: 14,
          }}>
            ⚠️ Ce changement affecte la visibilité de la salle.
            {selected === 'FERMEE' && ' Les étudiants ne verront plus cette salle.'}
          </div>
        )}

        {/* Champ raison */}
        <div className="form-group" style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Raison du changement</span>
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>
              Optionnelle — {reason.length}/300
            </span>
          </label>
          <input
            type="text"
            placeholder="Ex : Travaux de peinture, réservation, inspection…"
            value={reason}
            maxLength={300}
            onChange={e => setReason(e.target.value)}
            aria-label="Raison du changement de statut"
          />
        </div>

        {/* Erreur */}
        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 16, padding: '10px 14px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-outline"
            style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 22px', fontSize: 14 }}
            onClick={handleSubmit}
            disabled={loading || isUnchanged}
            aria-disabled={isUnchanged}
          >
            {loading && (
              <span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
            )}
            {loading ? 'Application…' : '🔄 Appliquer'}
          </button>
        </div>
      </div>
    </div>
  )
}
