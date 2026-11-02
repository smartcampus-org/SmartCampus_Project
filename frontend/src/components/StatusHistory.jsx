import { useState, useEffect, useCallback } from 'react'
import StatusBadge from './StatusBadge'
import Pagination from './Pagination'
import { roomAPI } from '../services/api'

/**
 * SC-112 — Composant d'historique des changements de statut d'une salle.
 *
 * Charge la liste paginée depuis GET /api/rooms/{id}/status-history,
 * affiche une timeline avec ancien/nouveau statut, auteur, raison et date.
 *
 * Props :
 *   roomId   : number | string
 *   compact  : boolean  (true = affiche 3 entrées max sans pagination, dans RoomDetail)
 */

const PAGE_SIZE_FULL    = 10
const PAGE_SIZE_COMPACT = 3

export default function StatusHistory({ roomId, compact = false }) {
  const [entries,    setEntries]    = useState([])
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  const pageSize = compact ? PAGE_SIZE_COMPACT : PAGE_SIZE_FULL

  const load = useCallback((p) => {
    setLoading(true)
    setError('')
    roomAPI.getStatusHistory(roomId, { page: p, size: pageSize, sort: 'changedAt,desc' })
      .then(res => {
        setEntries(res.data.content)
        setTotalPages(res.data.totalPages)
        setTotalItems(res.data.totalElements)
      })
      .catch(err => setError(err.response?.data?.message || 'Impossible de charger l\'historique.'))
      .finally(() => setLoading(false))
  }, [roomId, pageSize])

  useEffect(() => { load(0) }, [load])

  const handlePage = (p) => { setPage(p); load(p) }

  // ── État chargement ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: compact ? '16px 0' : '32px 0', color: '#9ca3af' }}>
        <div
          className="spinner"
          style={{ borderTopColor: '#2563eb', borderColor: '#e5e7eb', width: 28, height: 28, margin: '0 auto' }}
          role="status"
          aria-label="Chargement de l'historique"
        />
        <p style={{ marginTop: 10, fontSize: 13 }}>Chargement de l'historique…</p>
      </div>
    )
  }

  // ── État erreur ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="alert alert-error" role="alert" style={{ margin: '8px 0' }}>
        ⚠️ {error}
        <button
          onClick={() => load(page)}
          style={{ marginLeft: 10, fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Réessayer
        </button>
      </div>
    )
  }

  // ── Vide ──────────────────────────────────────────────────────────────────
  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
        <p style={{ fontSize: 13 }}>Aucun changement de statut enregistré.</p>
      </div>
    )
  }

  // ── Timeline ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
        role="list"
        aria-label="Historique des statuts"
      >
        {entries.map((entry, idx) => (
          <HistoryEntry key={entry.id} entry={entry} isLast={idx === entries.length - 1} />
        ))}
      </div>

      {/* Pagination (mode complet uniquement) */}
      {!compact && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE_FULL}
          onPageChange={handlePage}
        />
      )}

      {/* Mode compact : lien "voir tout" si plus d'entrées */}
      {compact && totalItems > PAGE_SIZE_COMPACT && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>
            {totalItems - PAGE_SIZE_COMPACT} entrée{totalItems - PAGE_SIZE_COMPACT > 1 ? 's' : ''} supplémentaire{totalItems - PAGE_SIZE_COMPACT > 1 ? 's' : ''} dans l'historique complet.
          </span>
        </div>
      )}
    </div>
  )
}

// ── HistoryEntry — ligne de timeline ─────────────────────────────────────────

function HistoryEntry({ entry, isLast }) {
  return (
    <div
      role="listitem"
      style={{
        display: 'flex',
        gap: 14,
        position: 'relative',
      }}
    >
      {/* Ligne verticale de timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: '#2563eb', border: '2px solid white',
          boxShadow: '0 0 0 2px #2563eb',
          marginTop: 16, flexShrink: 0,
        }} />
        {!isLast && (
          <div style={{ width: 2, flex: 1, background: '#e5e7eb', minHeight: 20 }} />
        )}
      </div>

      {/* Contenu */}
      <div style={{
        flex: 1,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: '12px 16px',
        marginBottom: 10,
      }}>
        {/* Ligne 1 : transition de statuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          {entry.oldStatus
            ? <StatusBadge status={entry.oldStatus} size="sm" />
            : <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>—</span>
          }
          <span style={{ fontSize: 16, color: '#9ca3af' }}>→</span>
          <StatusBadge status={entry.newStatus} size="sm" />
        </div>

        {/* Ligne 2 : méta (auteur + date) */}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
          <span title="Modifié par">
            👤 <strong style={{ color: '#374151' }}>{entry.changedBy}</strong>
          </span>
          <span title="Date du changement">
            🕐 {formatDateTime(entry.changedAt)}
          </span>
        </div>

        {/* Raison */}
        {entry.reason && (
          <div style={{
            marginTop: 8,
            padding: '6px 10px',
            background: '#f9fafb',
            borderRadius: 6,
            fontSize: 13,
            color: '#374151',
            borderLeft: '3px solid #2563eb',
          }}>
            💬 <em>{entry.reason}</em>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
