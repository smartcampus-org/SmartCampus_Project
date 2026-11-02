import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { roomAPI, buildingAPI } from '../services/api'

/**
 * SC-110 — Formulaire de création et de modification d'une salle.
 *
 * Mode création  : route /rooms/new
 * Mode édition   : route /rooms/:id/edit  (charge les données existantes)
 *
 * Fonctionnalités :
 *  - Champs : numéro, nom, bâtiment, étage, capacité, type, statut, description
 *  - Validation côté client avant envoi
 *  - Gestion des erreurs retournées par le serveur (400 par champ, 409 doublon)
 *  - État de chargement pendant la soumission
 *  - Accès restreint à ADMIN et PERSONNEL (redirection sinon)
 */

const ROOM_TYPES = [
  { value: 'AMPHITHEATRE',  label: 'Amphithéâtre' },
  { value: 'SALLE_TP',      label: 'Salle TP' },
  { value: 'SALLE_COURS',   label: 'Salle de cours' },
  { value: 'LABORATOIRE',   label: 'Laboratoire' },
  { value: 'SALLE_REUNION', label: 'Salle de réunion' },
  { value: 'BUREAU',        label: 'Bureau' },
  { value: 'AUTRE',         label: 'Autre' },
]

const ROOM_STATUSES = [
  { value: 'DISPONIBLE',     label: 'Disponible' },
  { value: 'OCCUPEE',        label: 'Occupée' },
  { value: 'EN_MAINTENANCE', label: 'En maintenance' },
  { value: 'FERMEE',         label: 'Fermée' },
]

const EMPTY_FORM = {
  roomNumber:  '',
  name:        '',
  buildingId:  '',
  floor:       '0',
  capacity:    '',
  type:        'SALLE_COURS',
  status:      'DISPONIBLE',
  description: '',
}

/** Validation côté client — retourne un objet { champ: message } */
function validate(form) {
  const errors = {}
  if (!form.roomNumber.trim())
    errors.roomNumber = 'Le numéro de salle est obligatoire.'
  else if (form.roomNumber.trim().length > 20)
    errors.roomNumber = 'Le numéro ne peut pas dépasser 20 caractères.'
  if (!form.buildingId)
    errors.buildingId = 'Veuillez sélectionner un bâtiment.'
  if (form.floor === '' || isNaN(Number(form.floor)) || Number(form.floor) < 0)
    errors.floor = 'L\'étage doit être un nombre positif ou nul.'
  if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1)
    errors.capacity = 'La capacité doit être d\'au moins 1 place.'
  else if (Number(form.capacity) > 5000)
    errors.capacity = 'La capacité ne peut pas dépasser 5000.'
  if (!form.type)
    errors.type = 'Le type de salle est obligatoire.'
  if (form.description && form.description.length > 500)
    errors.description = 'La description ne peut pas dépasser 500 caractères.'
  return errors
}

export default function RoomForm() {
  const { id }   = useParams()           // undefined = création
  const isEdit   = Boolean(id)
  const navigate = useNavigate()

  // Contrôle d'accès
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()
  const canMutate = ['ADMIN', 'PERSONNEL'].includes(user?.role)

  const [form,       setForm]       = useState(EMPTY_FORM)
  const [buildings,  setBuildings]  = useState([])
  const [errors,     setErrors]     = useState({})     // erreurs par champ
  const [serverError, setServerError] = useState('')   // erreur globale serveur
  const [loading,    setLoading]    = useState(false)
  const [initLoading, setInitLoading] = useState(isEdit) // chargement initial en mode édit

  // --- Vérification d'accès ---
  useEffect(() => {
    if (!canMutate) {
      navigate('/rooms', { replace: true })
    }
  }, [canMutate, navigate])

  // --- Chargement des bâtiments ---
  useEffect(() => {
    buildingAPI.getAll()
      .then(res => setBuildings(res.data))
      .catch(() => setServerError('Impossible de charger la liste des bâtiments.'))
  }, [])

  // --- Chargement de la salle en mode édition ---
  useEffect(() => {
    if (!isEdit) return
    roomAPI.getById(id)
      .then(res => {
        const r = res.data
        setForm({
          roomNumber:  r.roomNumber  ?? '',
          name:        r.name        ?? '',
          buildingId:  r.building?.id ? String(r.building.id) : '',
          floor:       String(r.floor ?? 0),
          capacity:    String(r.capacity ?? ''),
          type:        r.type        ?? 'SALLE_COURS',
          status:      r.status      ?? 'DISPONIBLE',
          description: r.description ?? '',
        })
      })
      .catch(err => {
        if (err.response?.status === 404)
          setServerError('Salle introuvable.')
        else
          setServerError('Impossible de charger les données de la salle.')
      })
      .finally(() => setInitLoading(false))
  }, [id, isEdit])

  // --- Gestion des champs ---
  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Effacer l'erreur du champ modifié
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  // --- Soumission ---
  const handleSubmit = async e => {
    e.preventDefault()
    setServerError('')

    // Validation côté client
    const clientErrors = validate(form)
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setLoading(true)
    setErrors({})

    const payload = {
      roomNumber:  form.roomNumber.trim(),
      name:        form.name.trim() || null,
      buildingId:  Number(form.buildingId),
      floor:       Number(form.floor),
      capacity:    Number(form.capacity),
      type:        form.type,
      status:      form.status || undefined,
      description: form.description.trim() || null,
    }

    try {
      if (isEdit) {
        await roomAPI.update(id, payload)
        navigate(`/rooms/${id}`, { state: { success: 'Salle mise à jour avec succès.' } })
      } else {
        const res = await roomAPI.create(payload)
        navigate(`/rooms/${res.data.id}`, { state: { success: 'Salle créée avec succès.' } })
      }
    } catch (err) {
      const status = err.response?.status
      const data   = err.response?.data

      if (status === 409) {
        // Doublon numéro de salle dans ce bâtiment
        setErrors({ roomNumber: data?.message || 'Ce numéro de salle existe déjà dans ce bâtiment.' })
      } else if (status === 400 && typeof data === 'object' && !data?.message) {
        // Erreurs de validation par champ retournées par Spring @Valid
        setErrors(data)
      } else if (status === 404) {
        setErrors({ buildingId: data?.message || 'Bâtiment introuvable.' })
      } else {
        setServerError(data?.message || 'Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  // --- Rendu chargement initial (mode édition) ---
  if (initLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          <div
            className="spinner"
            style={{ borderTopColor: '#2563eb', borderColor: '#e5e7eb', width: 40, height: 40, margin: '0 auto' }}
            role="status"
            aria-label="Chargement"
          />
          <p style={{ marginTop: 16 }}>Chargement des données…</p>
        </div>
      </div>
    )
  }

  // --- Rendu principal ---
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      <main className="dashboard" style={{ maxWidth: 720 }}>

        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" style={{ marginBottom: 20, fontSize: 14, color: '#6b7280' }}>
          <Link to="/rooms" style={{ color: '#2563eb', textDecoration: 'none' }}>Salles</Link>
          {isEdit && id && (
            <>
              <span style={{ margin: '0 8px' }}>›</span>
              <Link to={`/rooms/${id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>Détail</Link>
            </>
          )}
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#1f2937', fontWeight: 500 }}>
            {isEdit ? 'Modifier' : 'Nouvelle salle'}
          </span>
        </nav>

        <div className="profile-card">
          {/* En-tête */}
          <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0 }}>
              {isEdit ? '✏️ Modifier la salle' : '➕ Nouvelle salle'}
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6 }}>
              {isEdit
                ? 'Modifiez les informations de la salle ci-dessous.'
                : 'Remplissez les informations pour créer une nouvelle salle.'}
            </p>
          </div>

          {/* Erreur globale serveur */}
          {serverError && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: 20 }}>
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Ligne 1 : Numéro + Nom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 0 }}>
              <Field
                label="Numéro de salle *"
                error={errors.roomNumber}
                hint="Ex : A101, Lab3"
              >
                <input
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={handleChange}
                  placeholder="A101"
                  maxLength={20}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.roomNumber}
                  aria-describedby={errors.roomNumber ? 'err-roomNumber' : undefined}
                  className={errors.roomNumber ? 'error' : ''}
                />
                {errors.roomNumber && (
                  <span id="err-roomNumber" className="error-text">{errors.roomNumber}</span>
                )}
              </Field>

              <Field label="Nom descriptif" error={errors.name} hint="Optionnel — Ex : Amphithéâtre 1">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Amphithéâtre 1"
                  maxLength={150}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </Field>
            </div>

            {/* Bâtiment */}
            <Field label="Bâtiment *" error={errors.buildingId}>
              <select
                name="buildingId"
                value={form.buildingId}
                onChange={handleChange}
                required
                aria-required="true"
                aria-invalid={!!errors.buildingId}
                className={errors.buildingId ? 'error' : ''}
              >
                <option value="">— Sélectionner un bâtiment —</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.buildingId && <span className="error-text">{errors.buildingId}</span>}
            </Field>

            {/* Ligne 2 : Étage + Capacité */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Étage *" error={errors.floor} hint="0 = rez-de-chaussée">
                <input
                  type="number"
                  name="floor"
                  value={form.floor}
                  onChange={handleChange}
                  min={0}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.floor}
                  className={errors.floor ? 'error' : ''}
                />
                {errors.floor && <span className="error-text">{errors.floor}</span>}
              </Field>

              <Field label="Capacité (places) *" error={errors.capacity} hint="Entre 1 et 5000">
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  min={1}
                  max={5000}
                  placeholder="30"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.capacity}
                  className={errors.capacity ? 'error' : ''}
                />
                {errors.capacity && <span className="error-text">{errors.capacity}</span>}
              </Field>
            </div>

            {/* Ligne 3 : Type + Statut */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Type de salle *" error={errors.type}>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.type}
                >
                  {ROOM_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.type && <span className="error-text">{errors.type}</span>}
              </Field>

              <Field label="Statut" error={errors.status}>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  aria-invalid={!!errors.status}
                >
                  {ROOM_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {errors.status && <span className="error-text">{errors.status}</span>}
              </Field>
            </div>

            {/* Description */}
            <Field label="Description" error={errors.description} hint={`${form.description.length}/500 caractères`}>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                placeholder="Informations complémentaires sur la salle…"
                aria-invalid={!!errors.description}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1.5px solid ${errors.description ? '#dc2626' : '#e5e7eb'}`,
                  borderRadius: 8,
                  fontSize: 15,
                  color: '#1f2937',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { if (!errors.description) e.target.style.borderColor = '#2563eb' }}
                onBlur={e  => { if (!errors.description) e.target.style.borderColor = '#e5e7eb' }}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </Field>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: 'auto', padding: '11px 24px' }}
                onClick={() => navigate(isEdit ? `/rooms/${id}` : '/rooms')}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: 'auto', padding: '11px 28px' }}
                disabled={loading}
              >
                {loading && (
                  <span
                    className="spinner"
                    style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                )}
                {loading
                  ? (isEdit ? 'Enregistrement…' : 'Création…')
                  : (isEdit ? '💾 Enregistrer' : '➕ Créer la salle')}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}

// --- Composant Field wrapper ---
function Field({ label, error, hint, children }) {
  return (
    <div className="form-group">
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span>{label}</span>
        {hint && !error && (
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>{hint}</span>
        )}
      </label>
      {children}
    </div>
  )
}
