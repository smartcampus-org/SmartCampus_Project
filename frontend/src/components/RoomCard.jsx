import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import RoomTypeBadge from './RoomTypeBadge'

/**
 * SC-109 — Carte résumée d'une salle.
 * Affichée dans la liste des salles (/rooms).
 * Props : room (RoomSummaryResponse)
 */
export default function RoomCard({ room }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/rooms/${room.id}`)}
      style={{
        background: 'white',
        borderRadius: 12,
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
      }}
      role="article"
      aria-label={`Salle ${room.roomNumber} — ${room.name || ''}`}
    >
      {/* En-tête : numéro + statut */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#1f2937' }}>
            {room.roomNumber}
          </div>
          {room.name && (
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              {room.name}
            </div>
          )}
        </div>
        <StatusBadge status={room.status} />
      </div>

      {/* Type */}
      <div>
        <RoomTypeBadge type={room.type} />
      </div>

      {/* Infos secondaires */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <InfoChip icon="🏢" label={room.buildingName} />
        <InfoChip icon="📍" label={`Étage ${room.floor}`} />
        <InfoChip icon="👥" label={`${room.capacity} places`} />
        {room.equipmentCount > 0 && (
          <InfoChip icon="🖥️" label={`${room.equipmentCount} équipement${room.equipmentCount > 1 ? 's' : ''}`} />
        )}
      </div>

      {/* Lien détail */}
      <div style={{ textAlign: 'right', marginTop: 4 }}>
        <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>
          Voir le détail →
        </span>
      </div>
    </div>
  )
}

function InfoChip({ icon, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#4b5563' }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </span>
  )
}
