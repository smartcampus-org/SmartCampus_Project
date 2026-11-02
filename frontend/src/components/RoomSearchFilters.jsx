/**
 * SC-109 — Formulaire de filtres de recherche des salles.
 * Props :
 *   filters    : { keyword, status, type, buildingId, minCapacity }
 *   buildings  : BuildingResponse[]
 *   onChange   : (name, value) => void
 *   onReset    : () => void
 *   loading    : boolean
 */

const ROOM_STATUSES = [
  { value: '', label: 'Tous les statuts' },
  { value: 'DISPONIBLE',     label: 'Disponible' },
  { value: 'OCCUPEE',        label: 'Occupée' },
  { value: 'EN_MAINTENANCE', label: 'En maintenance' },
  { value: 'FERMEE',         label: 'Fermée' },
]

const ROOM_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'AMPHITHEATRE',  label: 'Amphithéâtre' },
  { value: 'SALLE_TP',      label: 'Salle TP' },
  { value: 'SALLE_COURS',   label: 'Salle de cours' },
  { value: 'LABORATOIRE',   label: 'Laboratoire' },
  { value: 'SALLE_REUNION', label: 'Salle de réunion' },
  { value: 'BUREAU',        label: 'Bureau' },
  { value: 'AUTRE',         label: 'Autre' },
]

export default function RoomSearchFilters({ filters, buildings, onChange, onReset, loading }) {
  const hasActiveFilter =
    filters.keyword || filters.status || filters.type ||
    filters.buildingId || filters.minCapacity

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: 0 }}>
          🔍 Recherche et filtres
        </h2>
        {hasActiveFilter && (
          <button
            onClick={onReset}
            style={{
              fontSize: 13, color: '#6b7280', background: 'none',
              border: 'none', cursor: 'pointer', textDecoration: 'underline',
            }}
            aria-label="Réinitialiser les filtres"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}>
        {/* Recherche textuelle */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Mot-clé
          </label>
          <input
            type="text"
            placeholder="Numéro, nom, bâtiment…"
            value={filters.keyword}
            onChange={e => onChange('keyword', e.target.value)}
            disabled={loading}
            aria-label="Rechercher par mot-clé"
          />
        </div>

        {/* Statut */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Statut
          </label>
          <select
            value={filters.status}
            onChange={e => onChange('status', e.target.value)}
            disabled={loading}
            aria-label="Filtrer par statut"
          >
            {ROOM_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Type
          </label>
          <select
            value={filters.type}
            onChange={e => onChange('type', e.target.value)}
            disabled={loading}
            aria-label="Filtrer par type"
          >
            {ROOM_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Bâtiment */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Bâtiment
          </label>
          <select
            value={filters.buildingId}
            onChange={e => onChange('buildingId', e.target.value)}
            disabled={loading}
            aria-label="Filtrer par bâtiment"
          >
            <option value="">Tous les bâtiments</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Capacité minimale */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Capacité min.
          </label>
          <input
            type="number"
            placeholder="Ex : 30"
            min={1}
            max={5000}
            value={filters.minCapacity}
            onChange={e => onChange('minCapacity', e.target.value)}
            disabled={loading}
            aria-label="Capacité minimale"
          />
        </div>
      </div>
    </div>
  )
}
