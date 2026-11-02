/**
 * SC-109 — Composant de pagination réutilisable.
 * Props :
 *   page        : numéro de page courant (0-indexed)
 *   totalPages  : nombre total de pages
 *   totalItems  : nombre total d'éléments
 *   pageSize    : éléments par page
 *   onPageChange: (newPage: number) => void
 */
export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null

  const from = page * pageSize + 1
  const to   = Math.min((page + 1) * pageSize, totalItems)

  // Calcul des pages à afficher (fenêtre glissante de 5)
  const pages = []
  const delta = 2
  for (let i = Math.max(0, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
    pages.push(i)
  }

  const btnStyle = (active, disabled) => ({
    padding: '7px 13px',
    borderRadius: 8,
    border: `1.5px solid ${active ? '#2563eb' : '#e5e7eb'}`,
    background: active ? '#2563eb' : 'white',
    color: active ? 'white' : disabled ? '#d1d5db' : '#374151',
    fontWeight: active ? 700 : 500,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    minWidth: 38,
  })

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 12 }}
      role="navigation"
      aria-label="Pagination"
    >
      <span style={{ fontSize: 13, color: '#6b7280' }}>
        {totalItems === 0 ? 'Aucun résultat' : `${from}–${to} sur ${totalItems} salle${totalItems > 1 ? 's' : ''}`}
      </span>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* Précédent */}
        <button
          style={btnStyle(false, page === 0)}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Page précédente"
        >
          ‹
        </button>

        {/* Première page si non visible */}
        {pages[0] > 0 && (
          <>
            <button style={btnStyle(false, false)} onClick={() => onPageChange(0)}>1</button>
            {pages[0] > 1 && <span style={{ color: '#9ca3af', padding: '0 2px' }}>…</span>}
          </>
        )}

        {/* Pages visibles */}
        {pages.map(p => (
          <button
            key={p}
            style={btnStyle(p === page, false)}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p + 1}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p + 1}
          </button>
        ))}

        {/* Dernière page si non visible */}
        {pages[pages.length - 1] < totalPages - 1 && (
          <>
            {pages[pages.length - 1] < totalPages - 2 && (
              <span style={{ color: '#9ca3af', padding: '0 2px' }}>…</span>
            )}
            <button style={btnStyle(false, false)} onClick={() => onPageChange(totalPages - 1)}>
              {totalPages}
            </button>
          </>
        )}

        {/* Suivant */}
        <button
          style={btnStyle(false, page >= totalPages - 1)}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Page suivante"
        >
          ›
        </button>
      </div>
    </div>
  )
}
