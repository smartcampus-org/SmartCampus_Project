import { useState } from 'react'
import { roomAPI } from '../services/api'

/**
 * SC-113 — Bouton d'export CSV réutilisable.
 *
 * Gère :
 *  - Le déclenchement du téléchargement via l'API (GET /api/rooms/export)
 *  - L'état de chargement pendant la génération
 *  - Les erreurs de génération (réseau, serveur, permission)
 *  - Le nommage du fichier avec horodatage optionnel
 *
 * Props :
 *   label        : string    (défaut "📥 Export CSV")
 *   variant      : 'outline' | 'primary'  (défaut 'outline')
 *   withTimestamp: boolean   (défaut true — ajoute la date dans le nom du fichier)
 *   onSuccess    : () => void
 *   onError      : (msg: string) => void
 *   style        : object    (styles supplémentaires)
 */
export default function ExportButton({
  label         = '📥 Export CSV',
  variant       = 'outline',
  withTimestamp = true,
  onSuccess,
  onError,
  style = {},
}) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await roomAPI.exportCsv()

      // Construit le nom du fichier
      const timestamp  = withTimestamp
        ? `_${new Date().toISOString().slice(0, 10)}`
        : ''
      const filename   = `smartcampus_rooms${timestamp}.csv`

      // Déclenche le téléchargement dans le navigateur
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', filename)
      link.setAttribute('aria-hidden', 'true')
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      onSuccess?.()
    } catch (err) {
      const status = err.response?.status
      let msg

      if (status === 403) {
        msg = 'Vous n\'avez pas les droits pour exporter le catalogue.'
      } else if (status === 503 || !err.response) {
        msg = 'Le serveur est inaccessible. Vérifiez votre connexion.'
      } else {
        msg = err.response?.data?.message || 'Erreur lors de la génération du fichier CSV.'
      }

      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`btn btn-${variant}`}
      style={{ width: 'auto', padding: '10px 20px', fontSize: 14, ...style }}
      onClick={handleExport}
      disabled={loading}
      aria-label={loading ? 'Génération du fichier CSV en cours…' : 'Télécharger le catalogue des salles au format CSV'}
      aria-busy={loading}
    >
      {loading
        ? (
          <>
            <span
              className="spinner"
              style={{
                borderTopColor: variant === 'primary' ? 'white' : '#374151',
                borderColor:    variant === 'primary' ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
              }}
            />
            Génération…
          </>
        )
        : label
      }
    </button>
  )
}
