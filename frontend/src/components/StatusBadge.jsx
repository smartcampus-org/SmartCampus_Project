/**
 * SC-109 — Badge coloré représentant le statut d'une salle.
 * Utilisé dans les cartes de liste et les pages de détail.
 */

const STATUS_CONFIG = {
  DISPONIBLE:     { label: 'Disponible',      bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  OCCUPEE:        { label: 'Occupée',         bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  EN_MAINTENANCE: { label: 'En maintenance',  bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  FERMEE:         { label: 'Fermée',          bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
}

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] ?? { label: status, bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' }

  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12
  const padding  = size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 14px' : '3px 10px'
  const dotSize  = size === 'sm' ? 6 : size === 'lg' ? 10 : 7

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding,
      borderRadius: 20,
      fontSize,
      fontWeight: 600,
      background: config.bg,
      color: config.color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        background: config.dot,
        flexShrink: 0,
      }} />
      {config.label}
    </span>
  )
}
