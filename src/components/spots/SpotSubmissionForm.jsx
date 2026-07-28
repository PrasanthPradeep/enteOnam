import { useState } from 'react'

const STORAGE_KEY = 'enteonam_spots'
const CATEGORIES = ['Pookalam', 'Cultural Event', 'Temple Festival', 'Other']

export function getSpots() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

export function addSpot(spot) {
  const spots = getSpots()
  spot.id = Date.now() + '_' + Math.random().toString(36).slice(2, 6)
  spot.createdAt = new Date().toISOString()
  spots.push(spot)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spots))
  return spot
}

export default function SpotSubmissionForm({ onSpotAdded, lat, lng, onMapPick }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [photo, setPhoto] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const submit = () => {
    if (!name || !category || lat == null || lng == null) return
    setSubmitting(true)
    const spot = { name, description, category, lat, lng }
    if (photo) spot.photo = photo
    addSpot(spot)
    setSubmitting(false)
    setName(''); setDescription(''); setCategory(''); setPhoto(null); setShowForm(false)
    if (onSpotAdded) onSpotAdded()
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Submit a Spot'}
      </button>
      {showForm && (
        <div className="card" style={{ marginTop: 8 }}>
          <div className="form-group">
            <label>Spot name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pookalam at Mattancherry" />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this spot..." />
          </div>
          <div className="form-group">
            <label>Set location on map (click the map above)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {lat != null ? 'Selected: ' + lat.toFixed(4) + ', ' + lng.toFixed(4) : 'No location set'}
            </p>
          </div>
          <div className="form-group">
            <label>Photo (optional)</label>
            <input type="file" accept="image/*" className="form-input" onChange={handlePhoto} />
            {photo && <img src={photo} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius)', marginTop: 4 }} />}
          </div>
          <button className="btn btn-primary" onClick={submit} disabled={submitting || !name || !category || lat == null || lng == null}>
            {submitting ? 'Saving...' : 'Save Spot'}
          </button>
        </div>
      )}
    </div>
  )
}
