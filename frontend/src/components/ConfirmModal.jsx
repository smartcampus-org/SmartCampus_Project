/**
 * SC-110 — Modal de confirmation générique.
 * Utilisé pour confirmer les suppressions.
 *
 * Props :
 *   isOpen    : boolean
 *   title     : string
 *   message   : string | ReactNode
 *   confirmLabel  : string  (défaut "Confirmer")
 *   cancelLabel   : string  (défaut "Annuler")
 *   danger    : boolean     (bouton rouge si true)
 *   loading   : boolean
 *   onConfirm : () => void
 *   onCancel  : () => void
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel  = 'Annuler',
  danger       = false,
  loading      = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    /* Overlay */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      {/* Boîte */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '32px 28px',
        maxWidth: 440,
        width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
      }}>
        {/* Icône danger */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: danger ? '#fee2e2' : '#dbeafe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, marginBottom: 16,
        }}>
          {danger ? '🗑️' : '❓'}
        </div>

        <h2
          id="confirm-modal-title"
          style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}
        >
          {title}
        </h2>

        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-outline"
            style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={danger ? 'btn btn-danger' : 'btn btn-primary'}
            style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && (
              <span
                className="spinner"
                style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              />
            )}
            {loading ? 'En cours…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
