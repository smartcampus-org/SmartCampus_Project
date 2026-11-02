import { useState, useEffect } from 'react'

/**
 * SC-111 — Formulaire de création / modification d'un équipement.
 * Affiché en modal inline dans la page équipements d'une salle.
 *
 * Props :
 *   initial    : EquipmentResponse | null  (null = mode création)
 *   loading    : boolean
 *   serverErrors : { [field]: string }
 *   onSubmit   : (data) => void
 *   onCancel   : () => void
 */

const EQUIPMENT_TYPES = [
  'MULTIMEDIA',
  'MOBILIER',
  'INFORMATIQUE',
  'CLIMATISATION',
  'SECURITE',
  'AUDIOVISUEL',
  'RESEAU',
  'AUTRE',
]

const EMPTY = {
  name:       '',
  type:       'MULTIMEDIA',
  typeCustom: '',         // saisi libre si type = AUTRE
  quantity:   '1',
  functional: true,
  notes:      '',
}

function validate(form) {
  const errors = {}
  const name = form.name.trim()
  if (!name)                   errors.name = 'Le nom de l\'équipement est obligatoire.'
  else if (name.length > 150)  errors.name = 'Le nom ne peut pas dépasser 150 caractères.'

  const type = form.type === 'AUTRE' ? form.typeCustom.trim() : form.type
  if (!type)                   errors.type = 'Le type est obligatoire.'
  else if (type.length > 50)   errors.type = 'Le type ne peut pas dépasser 50 caractères.'

  const qty = Number(form.quantity)
  if (!form.quantity || isNaN(qty) || qty < 1)
    errors.quantity = 'La quantité doit être d\'au moins 1.'

  if (form.notes && form.notes.length > 300)
    errors.notes = 'Les notes ne peuvent pas dépasser 300 caractères.'

  return errors
}

export default function EquipmentForm({ initial = null, loading = false, serverErrors = {}, onSubmit, onCancel }) {
  const isEdit = Boolean(initial)

  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})

  // Pré-remplit en mode édition
  useEffect(() => {
    if (initial) {
      const knownType = EQUIPMENT_TYPES.includes(initial.type) ? initial.type : 'AUTRE'
      setForm({
        name:       initial.name       ?? '',
        type:       knownType,
        typeCustom: knownType === 'AUTRE' ? (initial.type ?? '') : '',
        quantity:   String(initial.quantity ?? 1),
        functional: initial.functional ?? true,
        notes:      initial.notes      ?? '',
      })
    }
  }, [initial])

  // Fusionne les erreurs serveur
  const allErrors = { ...errors, ...serverErrors }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (allErrors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    const clientErrors = validate(form)
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return }
    setErrors({})
    const finalType = form.type === 'AUTRE' ? form.typeCustom.trim() : form.type
    onSubmit({
      name:       form.name.trim(),
      type:       finalType,
      quantity:   Number(form.quantity),
      functional: form.functional,
      notes:      form.notes.trim() || null,
    })
  }

  return (
    <div style={{
      background: '#f8fafc',
      border: '1.5px solid #e2e8f0',
      borderRadius: 12,
      padding: '24px',
      marginBottom: 16,
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
        {isEdit ? '✏️ Modifier l\'équipement' : '➕ Ajouter un équipement'}
      </h3>

      <form onSubmit={handleSubmit} noValidate>

        {/* Ligne 1 : Nom + Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 14 }}>
          {/* Nom */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nom *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex : Projecteur BenQ"
              maxLength={150}
              required
              aria-required="true"
              aria-invalid={!!allErrors.name}
              className={allErrors.name ? 'error' : ''}
            />
            {allErrors.name && <span className="error-text">{allErrors.name}</span>}
          </div>

          {/* Type */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Catégorie *</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              aria-invalid={!!allErrors.type}
              className={allErrors.type ? 'error' : ''}
            >
              {EQUIPMENT_TYPES.map(t => (
                <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
              ))}
            </select>
            {allErrors.type && <span className="error-text">{allErrors.type}</span>}
          </div>
        </div>

        {/* Type personnalisé si AUTRE */}
        {form.type === 'AUTRE' && (
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Précisez la catégorie *</label>
            <input
              name="typeCustom"
              value={form.typeCustom}
              onChange={handleChange}
              placeholder="Ex : MOBILIER, RESEAU…"
              maxLength={50}
              aria-invalid={!!allErrors.type}
              className={allErrors.type ? 'error' : ''}
            />
            {allErrors.type && <span className="error-text">{allErrors.type}</span>}
          </div>
        )}

        {/* Ligne 2 : Quantité + État fonctionnel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Quantité *</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min={1}
              required
              aria-invalid={!!allErrors.quantity}
              className={allErrors.quantity ? 'error' : ''}
            />
            {allErrors.quantity && <span className="error-text">{allErrors.quantity}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>État</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              border: '1.5px solid #e5e7eb',
              borderRadius: 8,
              cursor: 'pointer',
              background: form.functional ? '#f0fdf4' : '#fef2f2',
              transition: 'background 0.15s',
            }}
              onClick={() => setForm(prev => ({ ...prev, functional: !prev.functional }))}
              role="checkbox"
              aria-checked={form.functional}
              tabIndex={0}
              onKeyDown={e => e.key === ' ' && setForm(prev => ({ ...prev, functional: !prev.functional }))}
            >
              <input
                type="checkbox"
                name="functional"
                checked={form.functional}
                onChange={handleChange}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
                aria-label="Équipement fonctionnel"
              />
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: form.functional ? '#065f46' : '#991b1b',
              }}>
                {form.functional ? '✓ Fonctionnel' : '✗ Hors service'}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="form-group" style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Notes</span>
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>
              {form.notes.length}/300
            </span>
          </label>
          <input
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Modèle, numéro de série, remarques…"
            maxLength={300}
            aria-invalid={!!allErrors.notes}
            className={allErrors.notes ? 'error' : ''}
          />
          {allErrors.notes && <span className="error-text">{allErrors.notes}</span>}
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: 'auto', padding: '9px 20px', fontSize: 14 }}
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: 'auto', padding: '9px 22px', fontSize: 14 }}
            disabled={loading}
          >
            {loading && (
              <span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
            )}
            {loading ? 'Enregistrement…' : (isEdit ? '💾 Enregistrer' : '➕ Ajouter')}
          </button>
        </div>
      </form>
    </div>
  )
}
