import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ExportButton from '../components/ExportButton'

/**
 * SC-113 — Page dédiée à l'export du catalogue des salles.
 * Route : /rooms/export
 *
 * Accessible à ADMIN, PERSONNEL, PROFESSEUR.
 * Les ETUDIANT sont redirigés (contrôle dans App.jsx via RolesRoute).
 *
 * Affiche :
 *  - Description du fichier généré (colonnes, format, encodage)
 *  - Règles de filtrage selon le rôle (SC-21 : salles FERMEE exclues pour ETUDIANT)
 *  - Bouton de téléchargement avec gestion d'état complète
 *  - Feedback succès / erreur
 *  - Historique des exports de la session (date + heure)
 */

const ROLE_LABELS = {
  ADMIN:      'Administrateur',
  PERSONNEL:  'Personnel',
  PROFESSEUR: 'Professeur',
  ETUDIANT:   'Étudiant',
}

const CSV_COLUMNS = [
  { col: 'ID',          desc: 'Identifiant unique de la salle' },
  { col: 'Numéro',      desc: 'Code de la salle (ex : A101)' },
  { col: 'Nom',         desc: 'Nom descriptif optionnel' },
  { col: 'Bâtiment',    desc: 'Nom du bâtiment' },
  { col: 'Étage',       desc: 'Numéro d\'étage (0 = RDC)' },
  { col: 'Capacité',    desc: 'Nombre de places' },
  { col: 'Type',        desc: 'Type de salle (AMPHITHEATRE, SALLE_COURS…)' },
  { col: 'Statut',      desc: 'Statut actuel (DISPONIBLE, OCCUPEE…)' },
  { col: 'Description', desc: 'Notes libres' },
  { col: 'Équipements', desc: 'Résumé des équipements (Nom ×qté, OK/HS)' },
]

export default function RoomsExport() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()
  const role = user?.role ?? ''

  const [exportError,   setExportError]   = useState('')
  const [exportHistory, setExportHistory] = useState([])  // { date: Date }[]

  const handleSuccess = () => {
    setExportError('')
    setExportHistory(prev => [{ date: new Date() }, ...prev].slice(0, 5))
  }

  const handleError = (msg) => {
    setExportError(msg)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      <main className="dashboard" style={{ maxWidth: 760 }}>

        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" style={{ marginBottom: 20, fontSize: 14, color: '#6b7280' }}>
          <Link to="/rooms" style={{ color: '#2563eb', textDecoration: 'none' }}>Salles</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#1f2937', fontWeight: 500 }}>Export CSV</span>
        </nav>

        {/* ── En-tête ── */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          borderRadius: 12, padding: '24px 28px', marginBottom: 24,
          color: 'white',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              📤 Export du catalogue
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>
              Télécharger le catalogue des salles
            </h1>
            <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>
              Format CSV · UTF-8 + BOM · Séparateur&nbsp;
              <code style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: 4 }}>;</code>
              · Compatible Excel
            </p>
          </div>
          <span style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: 20,
            padding: '5px 14px', fontSize: 13, fontWeight: 600,
          }}>
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>

        {/* ── Feedback ── */}
        {exportError && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 20 }}>
            ⚠️ {exportError}
            <button
              onClick={() => setExportError('')}
              style={{ marginLeft: 10, fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label="Fermer l'alerte"
            >
              ✕
            </button>
          </div>
        )}

        {exportHistory.length > 0 && (
          <div className="alert alert-success" role="status" style={{ marginBottom: 20 }}>
            ✅ Dernier export réussi à {exportHistory[0].date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {/* ── Zone d'export principale ── */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <h2>📥 Télécharger le fichier</h2>

          {/* Info contenu */}
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 10, padding: '14px 18px', marginBottom: 20,
            fontSize: 14, color: '#065f46',
          }}>
            <strong>Contenu :</strong> Toutes les salles du campus avec leurs équipements associés.
            {role !== 'ETUDIANT' && (
              <span> Toutes les salles sont incluses, y compris celles en maintenance et fermées.</span>
            )}
          </div>

          {/* Règle SC-21 */}
          {role === 'ETUDIANT' && (
            <div style={{
              background: '#fef3c7', border: '1px solid #fde68a',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontSize: 13, color: '#92400e',
            }}>
              ⚠️ En tant qu'étudiant, les salles fermées sont automatiquement exclues de l'export.
            </div>
          )}

          <ExportButton
            label="📥 Télécharger le catalogue CSV"
            variant="primary"
            withTimestamp={true}
            onSuccess={handleSuccess}
            onError={handleError}
            style={{ padding: '12px 28px', fontSize: 15 }}
          />

          <p style={{ marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
            Le fichier sera nommé <code>smartcampus_rooms_AAAA-MM-JJ.csv</code> et s'ouvrira directement dans Excel.
          </p>
        </div>

        {/* ── Description des colonnes ── */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <h2>📋 Structure du fichier CSV</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={thStyle}>Colonne</th>
                  <th style={thStyle}>Description</th>
                </tr>
              </thead>
              <tbody>
                {CSV_COLUMNS.map((c, i) => (
                  <tr key={c.col} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#1f2937' }}>
                      <code style={{ background: '#f3f4f6', padding: '1px 7px', borderRadius: 5, fontSize: 13 }}>
                        {c.col}
                      </code>
                    </td>
                    <td style={{ ...tdStyle, color: '#6b7280' }}>{c.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Historique des exports de la session ── */}
        {exportHistory.length > 0 && (
          <div className="profile-card" style={{ marginBottom: 24 }}>
            <h2>🕐 Exports de cette session</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exportHistory.map((e, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 14px', background: '#f0fdf4',
                  borderRadius: 8, border: '1px solid #bbf7d0',
                  fontSize: 13, color: '#065f46',
                }}>
                  <span>✅</span>
                  <span>
                    <strong>smartcampus_rooms_{e.date.toISOString().slice(0, 10)}.csv</strong>
                    &nbsp;— téléchargé à {e.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retour */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/rooms" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>
            ← Retour au catalogue des salles
          </Link>
        </div>

      </main>
    </div>
  )
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #e5e7eb',
}

const tdStyle = {
  padding: '9px 14px',
  borderBottom: '1px solid #f3f4f6',
}
