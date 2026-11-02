import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import RoomCard from '../components/RoomCard'
import RoomSearchFilters from '../components/RoomSearchFilters'
import Pagination from '../components/Pagination'
import { roomAPI, buildingAPI } from '../services/api'

/**
 * SC-109 — Page de consultation et de recherche des salles.
 *
 * Fonctionnalités :
 *  - Liste paginée de toutes les salles (GET /api/rooms)
 *  - Recherche multi-critères (GET /api/rooms/search)
 *  - Filtres : keyword, status, type, buildingId, minCapacity
 *  - Pagination avec affichage du total
 *  - Export CSV (GET /api/rooms/export) pour ADMIN/PERSONNEL/PROFESSEUR
 *  - États : chargement, erreur, résultats vides
 *  - Règle SC-21 : les salles FERMEE sont masquées automatiquement pour les étudiants
 *    (géré côté backend — transparent ici)
 */

const PAGE_SIZE = 12

const INITIAL_FILTERS = {
  keyword: '',
  status: '',
  type: '',
  buildingId: '',
  minCapacity: '',
}

export default function Rooms() {
  const navigate = useNavigate()

  // Récupération du rôle depuis localStorage
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()
  const role = user?.role ?? ''
  const canExport = ['ADMIN', 'PERSONNEL', 'PROFESSEUR'].includes(role)
  const canCreate = ['ADMIN', 'PERSONNEL'].includes(role)

  // --- State ---
  const [rooms,      setRooms]      = useState([])
  const [buildings,  setBuildings]  = useState([])
  const [filters,    setFilters]    = useState(INITIAL_FILTERS)
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [exporting,  setExporting]  = useState(false)

  // --- Chargement des bâtiments (une seule fois) ---
  useEffect(() => {
    buildingAPI.getAll()
      .then(res => setBuildings(res.data))
      .catch(() => {}) // Non bloquant
  }, [])

  // --- Détermine si des filtres sont actifs ---
  const hasActiveFilter = Object.values(filters).some(v => v !== '')

  // --- Chargement des salles ---
  const fetchRooms = useCallback(async (currentPage, currentFilters) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: currentPage, size: PAGE_SIZE, sort: 'roomNumber,asc' }

      // Ajout des filtres non vides
      if (currentFilters.keyword)    params.keyword    = currentFilters.keyword
      if (currentFilters.status)     params.status     = currentFilters.status
      if (currentFilters.type)       params.type       = currentFilters.type
      if (currentFilters.buildingId) params.buildingId = currentFilters.buildingId
      if (currentFilters.minCapacity) params.minCapacity = currentFilters.minCapacity

      // Utilise /search si au moins un filtre est actif, sinon /rooms
      const res = hasActiveFilter || Object.values(currentFilters).some(v => v !== '')
        ? await roomAPI.search(params)
        : await roomAPI.getAll(params)

      setRooms(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalItems(res.data.totalElements)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les salles. Vérifiez votre connexion.')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [hasActiveFilter])

  // Rechargement quand page ou filtres changent
  useEffect(() => {
    fetchRooms(page, filters)
  }, [page, filters, fetchRooms])

  // --- Gestion des filtres ---
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
    setPage(0) // Retour en page 1 à chaque changement de filtre
  }

  const handleReset = () => {
    setFilters(INITIAL_FILTERS)
    setPage(0)
  }

  // --- Export CSV ---
  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await roomAPI.exportCsv()
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'smartcampus_rooms.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Impossible de générer l\'export CSV.')
    } finally {
      setExporting(false)
    }
  }

  // --- Rendu ---
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      <main className="dashboard" style={{ maxWidth: 1100 }}>

        {/* En-tête */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1f2937', margin: 0 }}>
              🚪 Catalogue des salles
            </h1>
            <p style={{ color: '#6b7280', marginTop: 6, fontSize: 15 }}>
              Consultez et recherchez les salles disponibles sur le campus
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Bouton créer (ADMIN/PERSONNEL) */}
            {canCreate && (
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}
                onClick={() => navigate('/rooms/new')}
              >
                + Nouvelle salle
              </button>
            )}

            {/* Export CSV */}
            {canExport && (
              <button
                className="btn btn-outline"
                style={{ width: 'auto', padding: '10px 20px', fontSize: 14 }}
                onClick={handleExport}
                disabled={exporting}
                aria-label="Exporter en CSV"
              >
                {exporting ? <><span className="spinner" style={{ borderTopColor: '#374151', borderColor: '#e5e7eb' }} /> Export…</> : '📥 Export CSV'}
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <RoomSearchFilters
          filters={filters}
          buildings={buildings}
          onChange={handleFilterChange}
          onReset={handleReset}
          loading={loading}
        />

        {/* Résumé de la recherche */}
        {!loading && !error && (
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>
              {totalItems === 0
                ? 'Aucune salle trouvée'
                : `${totalItems} salle${totalItems > 1 ? 's' : ''} trouvée${totalItems > 1 ? 's' : ''}`
              }
            </span>
            {hasActiveFilter && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px',
                borderRadius: 10, background: '#dbeafe', color: '#1e40af',
              }}>
                Filtres actifs
              </span>
            )}
          </div>
        )}

        {/* État : chargement */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <div
              className="spinner"
              style={{ borderTopColor: '#2563eb', borderColor: '#e5e7eb', width: 40, height: 40, margin: '0 auto' }}
              role="status"
              aria-label="Chargement des salles"
            />
            <p style={{ marginTop: 16, fontSize: 15 }}>Chargement des salles…</p>
          </div>
        )}

        {/* État : erreur */}
        {!loading && error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 24 }}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => fetchRooms(page, filters)}
              style={{
                marginLeft: 12, fontSize: 13, color: '#dc2626',
                background: 'none', border: 'none', cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* État : résultats vides */}
        {!loading && !error && rooms.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'white', borderRadius: 12,
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>
              Aucune salle trouvée
            </h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
              {hasActiveFilter
                ? 'Aucune salle ne correspond à vos critères de recherche.'
                : 'Aucune salle n\'est disponible pour le moment.'}
            </p>
            {hasActiveFilter && (
              <button
                className="btn btn-outline"
                style={{ width: 'auto', padding: '10px 24px' }}
                onClick={handleReset}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* Grille de salles */}
        {!loading && !error && rooms.length > 0 && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 16,
              }}
              role="list"
              aria-label="Liste des salles"
            >
              {rooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  )
}
