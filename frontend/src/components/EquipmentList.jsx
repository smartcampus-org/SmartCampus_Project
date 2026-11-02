import { useState } from 'react'
import EquipmentForm from './EquipmentForm'
import ConfirmModal from './ConfirmModal'
import { equipmentAPI } from '../services/api'

/**
 * SC-111 — Liste des équipements d'une salle avec gestion CRUD complète.
 *
 * Fonctionnalités :
 *  - Affichage de tous les équipements avec statut fonctionnel/HS
 *  - Filtres : texte libre, état fonctionnel
 *  - Formulaire inline (create / edit) — EquipmentForm
 *  - Suppression avec confirmation — ConfirmModal
 *  - Accès lecture pour tous, mutations pour ADMIN/PERSONNEL
 *
 * Props :
 *   roomId    : number | string
 *   equipments: EquipmentResponse[]       (données initiales depuis RoomDetail)
 *   canMutate : boolean
 *   onUpdated : (equipments: []) => void  (callback pour rafraîchir la liste parente)
 */
export default function EquipmentList({ roomId, equipments: initial = [], canMutate, onUpdated }) {
  const [equipments,     setEquipments]     = useState(initial)
  const [filterText,     setFilterText]     = useState('')
  const [filterState,    setFilterState]    = useState('')   // '' | 'true' | 'false'
  const [showForm,       setShowForm]       = useState(false)
  const [editTarget,     setEditTarget]     = useState(null) // EquipmentResponse | null
  const [formLoading,    setFormLoading]    = useState(false)
  const [formErrors,     setFormErrors]     = useState({})
  const [deleteTarget,   setDeleteTarget]   = useState(null) // EquipmentResponse | null
  const [deleteLoading,  setDeleteLoading]  = useState(false)
  const [globalError,    setGlobalError]    = useState('')
  const [globalSuccess,  setGlobalSuccess]  = useState('')

  // ── Filtrage ─────────────────────────────────────────────────────────────

  const filtered = equipments.filter(eq => {
    const matchText = filterText
      ? eq.name.toLowerCase().includes(filterText.toLowerCase()) ||
        eq.type.toLowerCase().includes(filterText.toLowerCase()) ||
        (eq.notes ?? '').toLowerCase().includes(filterText.toLowerCase())
      : true
    const matchState = filterState === '' ? true : String(eq.functional) === filterState
    return matchText && matchState
  })

  // ── Création ─────────────────────────────────────────────────────────────

  const handleCreate = async (data) => {
    setFormLoading(true)
    setFormErrors({})
    setGlobalError('')
    try {
      const res = await equipmentAPI.create(roomId, data)
      const updated = [...equipments, res.data]
      setEquipments(updated)
      onUpdated?.(updated)
      setShowForm(false)
      setGlobalSuccess('Équipement ajouté avec succès.')
      clearSuccess()
    } catch (err) {
      handleFormError(err)
    } finally {
      setFormLoading(false)
    }
  }

  // ── Modification ─────────────────────────────────────────────────────────

  const handleEdit = async (data) => {
    setFormLoading(true)
    setFormErrors({})
    setGlobalError('')
    try {
      const res = await equipmentAPI.update(roomId, editTarget.id, data)
      const updated = equipments.map(e => e.id === editTarget.id ? res.data : e)
      setEquipments(updated)
      onUpdated?.(updated)
      setEditTarget(null)
      setGlobalSuccess('Équipement mis à jour avec succès.')
      clearSuccess()
    } catch (err) {
      handleFormError(err)
    } finally {
      setFormLoading(false)
    }
  }

  // ── Suppression ──────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setDeleteLoading(true)
    setGlobalError('')
    try {
      await equipmentAPI.delete(roomId, deleteTarget.id)
      const updated = equipments.filter(e => e.id !== deleteTarget.id)
      setEquipments(updated)
      onUpdated?.(updated)
      setDeleteTarget(null)
      setGlobalSuccess('Équipement supprimé avec succès.')
      clearSuccess()
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Impossible de supprimer l\'équipement.')
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  const handleFormError = (err) => {
    const status = err.response?.status
    const data   = err.response?.data
    if (status === 400 && typeof data === 'object' && !data?.message) {
      setFormErrors(data)
    } else {
      setGlobalError(data?.message || 'Une erreur est survenue.')
    }
  }

  const clearSuccess = () => setTimeout(() => setGlobalSuccess(''), 3500)

  const openEdit = (eq) => {
    setShowForm(false)
    setFormErrors({})
    setEditTarget(eq)
  }

  const openCreate = () => {
    setEditTarget(null)
    setFormErrors({})
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditTarget(null)
    setFormErrors({})
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Modal suppression */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Supprimer l'équipement"
        message={
          <>
            Voulez-vous vraiment supprimer <strong>{deleteTarget?.name}</strong> ?
            <br /><br />
            <span style={{ fontSize: 13, color: '#dc2626' }}>
              ⚠️ Cette action est irréversible.
            </span>
          </>
        }
        confirmLabel="Supprimer"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Feedback global */}
      {globalSuccess && (
        <div className="alert alert-success" role="status" style={{ marginBottom: 16 }}>
          ✅ {globalSuccess}
        </div>
      )}
      {globalError && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
          ⚠️ {globalError}
        </div>
      )}

      {/* ─ Barre d'outils ─ */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Recherche */}
        <input
          type="text"
          placeholder="🔍 Nom, type, notes…"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          aria-label="Filtrer les équipements"
          style={{
            flex: 1, minWidth: 180,
            padding: '8px 14px',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
          }}
        />

        {/* Filtre état */}
        <select
          value={filterState}
          onChange={e => setFilterState(e.target.value)}
          aria-label="Filtrer par état"
          style={{
            padding: '8px 14px',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 14,
            background: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="">Tous les états</option>
          <option value="true">✓ Fonctionnels</option>
          <option value="false">✗ Hors service</option>
        </select>

        {/* Compteur */}
        <span style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
          {filtered.length} / {equipments.length}
        </span>

        {/* Bouton ajouter */}
        {canMutate && !showForm && !editTarget && (
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '8px 18px', fontSize: 14 }}
            onClick={openCreate}
            aria-label="Ajouter un équipement"
          >
            + Ajouter
          </button>
        )}
      </div>

      {/* ─ Formulaire création ─ */}
      {showForm && canMutate && (
        <EquipmentForm
          initial={null}
          loading={formLoading}
          serverErrors={formErrors}
          onSubmit={handleCreate}
          onCancel={cancelForm}
        />
      )}

      {/* ─ Liste ─ */}
      {filtered.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
          <p style={{ fontSize: 14 }}>
            {equipments.length === 0
              ? 'Aucun équipement enregistré pour cette salle.'
              : 'Aucun équipement ne correspond aux filtres.'}
          </p>
          {filterText || filterState ? (
            <button
              style={{ marginTop: 10, fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => { setFilterText(''); setFilterState('') }}
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>
      ) : (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          role="list"
          aria-label="Liste des équipements"
        >
          {filtered.map(eq => (
            <div key={eq.id} role="listitem">
              {/* Formulaire d'édition inline */}
              {editTarget?.id === eq.id && canMutate ? (
                <EquipmentForm
                  initial={editTarget}
                  loading={formLoading}
                  serverErrors={formErrors}
                  onSubmit={handleEdit}
                  onCancel={cancelForm}
                />
              ) : (
                <EquipmentRow
                  equipment={eq}
                  canMutate={canMutate}
                  onEdit={() => openEdit(eq)}
                  onDelete={() => setDeleteTarget(eq)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── EquipmentRow — ligne d'affichage d'un équipement ────────────────────────

function EquipmentRow({ equipment: eq, canMutate, onEdit, onDelete }) {
  const [hover, setHover] = useState(false)

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: hover ? '#f8fafc' : 'white',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        transition: 'background 0.12s',
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      {/* Icône type */}
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: eq.functional ? '#dbeafe' : '#fee2e2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {typeIcon(eq.type)}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{eq.name}</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            background: '#f3f4f6', borderRadius: 6, padding: '1px 7px',
            fontSize: 11, fontWeight: 500, color: '#374151',
          }}>
            {eq.type}
          </span>
          {eq.notes && (
            <span style={{ color: '#9ca3af' }} title={eq.notes}>
              {eq.notes.length > 40 ? eq.notes.slice(0, 40) + '…' : eq.notes}
            </span>
          )}
        </div>
      </div>

      {/* Quantité + État */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: '#374151',
          background: '#f3f4f6', borderRadius: 8, padding: '3px 10px',
        }}>
          ×{eq.quantity}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: eq.functional ? '#d1fae5' : '#fee2e2',
          color:      eq.functional ? '#065f46' : '#991b1b',
          whiteSpace: 'nowrap',
        }}>
          {eq.functional ? '✓ OK' : '✗ HS'}
        </span>
      </div>

      {/* Actions ADMIN/PERSONNEL */}
      {canMutate && (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <ActionBtn
            label="Modifier"
            title="Modifier l'équipement"
            color="#2563eb"
            bg="#eff6ff"
            onClick={onEdit}
          >
            ✏️
          </ActionBtn>
          <ActionBtn
            label="Supprimer"
            title="Supprimer l'équipement"
            color="#dc2626"
            bg="#fef2f2"
            onClick={onDelete}
          >
            🗑️
          </ActionBtn>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ children, label, title, color, bg, onClick }) {
  return (
    <button
      aria-label={label}
      title={title}
      onClick={onClick}
      style={{
        width: 34, height: 34,
        border: `1.5px solid ${color}22`,
        borderRadius: 8,
        background: bg,
        color,
        cursor: 'pointer',
        fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.12s',
      }}
      onMouseOver={e => e.currentTarget.style.opacity = '0.75'}
      onMouseOut={e  => e.currentTarget.style.opacity = '1'}
    >
      {children}
    </button>
  )
}

/** Icône selon la catégorie de l'équipement */
function typeIcon(type) {
  const map = {
    MULTIMEDIA: '📽️', MOBILIER: '🪑', INFORMATIQUE: '💻',
    CLIMATISATION: '❄️', SECURITE: '🔒', AUDIOVISUEL: '🔊',
    RESEAU: '🌐', AUTRE: '📦',
  }
  return map[type?.toUpperCase()] ?? '📦'
}
