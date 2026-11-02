/**
 * SC-109 — Badge représentant le type d'une salle.
 */

const TYPE_CONFIG = {
  AMPHITHEATRE:  { label: 'Amphithéâtre',   icon: '🎭', bg: '#ede9fe', color: '#5b21b6' },
  SALLE_TP:      { label: 'Salle TP',        icon: '🔬', bg: '#dbeafe', color: '#1e40af' },
  SALLE_COURS:   { label: 'Salle de cours',  icon: '📚', bg: '#d1fae5', color: '#065f46' },
  LABORATOIRE:   { label: 'Laboratoire',     icon: '🧪', bg: '#fce7f3', color: '#9d174d' },
  SALLE_REUNION: { label: 'Salle réunion',   icon: '🤝', bg: '#fef3c7', color: '#92400e' },
  BUREAU:        { label: 'Bureau',          icon: '🖥️', bg: '#e0f2fe', color: '#075985' },
  AUTRE:         { label: 'Autre',           icon: '📦', bg: '#f3f4f6', color: '#374151' },
}

export default function RoomTypeBadge({ type }) {
  const config = TYPE_CONFIG[type] ?? { label: type, icon: '📦', bg: '#f3f4f6', color: '#374151' }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: config.bg,
      color: config.color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 11 }}>{config.icon}</span>
      {config.label}
    </span>
  )
}
