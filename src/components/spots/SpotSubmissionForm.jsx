import { useState } from 'react'
import { Camera, MapPin, Loader2, Upload, X, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

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

export default function SpotSubmissionForm({ onSpotAdded, lat, lng }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [photo, setPhoto] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

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
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setName(''); setDescription(''); setCategory(''); setPhoto(null); setShowForm(false)
    }, 1500)
    if (onSpotAdded) onSpotAdded()
  }

  const canSubmit = name && category && lat != null && lng != null

  return (
    <Card className="festival-card">
      <CardContent className="p-6">
        {!showForm ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-50">
                <Camera className="h-6 w-6 text-green" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Share a Celebration Spot</h3>
                <p className="text-sm text-muted-foreground">
                  Add a pookalam display, cultural event or festival
                </p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)}>
              Submit a Spot
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-green-800">Submit a Celebration Spot</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spot-name">Spot name *</Label>
              <Input
                id="spot-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Pookalam at Mattancherry"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spot-category">Category *</Label>
              <select
                id="spot-category"
                className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spot-desc">Description</Label>
              <textarea
                id="spot-desc"
                rows={3}
                className="flex w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe this spot..."
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <div className={`flex items-center gap-2 p-3 rounded-lg ${lat != null ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                <MapPin className="h-4 w-4" />
                {lat != null
                  ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                  : 'Click the map above or use your location to set a point'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Photo (optional)</Label>
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-green transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload a photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
              {photo && (
                <div className="relative">
                  <img src={photo} alt="preview" className="w-full max-h-56 object-cover rounded-lg" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setPhoto(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={submit}
              disabled={submitting || !canSubmit}
              className="w-full flex items-center gap-2"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved!
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Spot'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
