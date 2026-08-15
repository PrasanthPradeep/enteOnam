import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Flower2, MapPin, Loader2, ExternalLink, Link2, Store, Plus, X,
  CheckCircle2, Navigation
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { haversine } from '../../shared/utils.js'
import { fetchLocations, insertLocation } from '../../shared/locations.js'

const FLOWER_TYPES = ['Thumba', 'Arali', 'Jamanthi', 'Marigold', 'Chembarathi', 'Mukutti', 'Krishna kireedam']

export default function FlowerView() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [prices, setPrices] = useState({})
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [nearMe, setNearMe] = useState(null)
  const [locating, setLocating] = useState(false)
  const [mapLink, setMapLink] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const LRef = useRef(null)

  const refresh = async () => {
    const data = await fetchLocations('flower_shop')
    setShops(data.map(row => {
      const details = row.flower_shop_details
      const detail = Array.isArray(details) ? details[0] : details
      return {
        id: row.id,
        name: row.name,
        area: row.description || '',
        lat: row.lat,
        lng: row.lng,
        prices: (detail && detail.prices) || {},
        createdAt: row.created_at,
      }
    }))
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const sortedShops = useMemo(() => {
    if (!nearMe) return shops
    const dist = (s) => s.lat != null && s.lng != null
      ? haversine(nearMe.lat, nearMe.lng, s.lat, s.lng)
      : Infinity
    return [...shops].sort((a, b) => dist(a) - dist(b))
  }, [shops, nearMe])

  useEffect(() => {
    if (mapInstance.current) return
    import('leaflet').then(L => {
      LRef.current = L
      const map = L.map(mapRef.current, {
        center: [10.5276, 76.2144],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map)
      map.on('click', e => {
        setLat(e.latlng.lat)
        setLng(e.latlng.lng)
      })
      mapInstance.current = map
    })
  }, [])

  useEffect(() => {
    const map = mapInstance.current
    const L = LRef.current
    if (!map || !L) return
    map.eachLayer(l => { if (l._isShopMarker || l._isPickMarker) map.removeLayer(l) })
    shops.filter(s => s.lat != null && s.lng != null).forEach(s => {
      const m = L.marker([s.lat, s.lng])
      m._isShopMarker = true
      m.bindTooltip(s.name + ' - ' + s.area)
      m.addTo(map)
    })
    if (lat != null && lng != null) {
      const m = L.marker([lat, lng])
      m._isPickMarker = true
      m.addTo(map)
      map.setView([lat, lng], 14)
    }
  }, [shops, lat, lng])

  const parseMapLink = (url) => {
    let m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m) { setLat(parseFloat(m[1])); setLng(parseFloat(m[2])) }
    m = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m) { setLat(parseFloat(m[1])); setLng(parseFloat(m[2])) }
    m = url.match(/(?:place|maps)\/([^/]+?)@/)
    if (!m) m = url.match(/[?&](?:q|query)=([^&]+)/)
    if (m) {
      const raw = decodeURIComponent(m[1].replace(/\+/g, ' '))
      const parsedName = raw.split(',')[0].trim()
      if (parsedName && !name.trim()) setName(parsedName)
    }
  }

  const locateMe = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setNearMe({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  const submit = async () => {
    if (!name || !area || lat == null || lng == null) return
    setError(null)
    try {
      const location = await insertLocation({
        category: 'flower_shop',
        name,
        description: area,
        lat,
        lng,
        prices,
      })
      setName(''); setArea(''); setLat(null); setLng(null); setPrices({}); setShowForm(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
      refresh()
    } catch (err) {
      console.error('Error saving shop:', err)
      setError('Failed to save shop. Please try again.')
    }
  }

  const canSubmit = name && area && lat != null && lng != null

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-green-800 ml">പൂക്കട</h1>
        <p className="text-sm text-muted-foreground">
          Find and report shops selling pookalam flowers near you
        </p>
      </header>

      <Card className="overflow-hidden">
        <div ref={mapRef} className="w-full h-72 z-0" />
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showForm ? 'outline' : 'default'}
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {showForm ? 'Cancel' : 'Report a Flower Shop'}
            </Button>
            <Button
              variant="outline"
              onClick={locateMe}
              disabled={locating}
              className="flex items-center gap-2"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {locating ? 'Locating...' : 'Use my location'}
            </Button>
            {lat != null && (
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" />
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </Badge>
            )}
            {lat != null && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                asChild
              >
                <a
                  href={'https://www.google.com/maps?q=' + lat + ',' + lng}
                  target="_blank" rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                  Google Maps
                </a>
              </Button>
            )}
            {lat == null && (
              <span className="text-sm text-muted-foreground">Click the map to place a marker</span>
            )}
          </div>

          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Or paste a Google Maps link (shop name auto-filled)..."
              value={mapLink}
              onChange={e => { setMapLink(e.target.value); parseMapLink(e.target.value) }}
            />
          </div>

          {showForm && (
            <div className="space-y-4 pt-3 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop name *</Label>
                <Input id="shop-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aluva Flower Market" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-area">Area / Location *</Label>
                <Input id="shop-area" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Mattancherry, Kochi" />
              </div>

              <div>
                <Label>Current prices (₹ per bunch)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {FLOWER_TYPES.map(ft => (
                    <div key={ft} className="flex items-center gap-2">
                      <span className="text-sm flex-1">{ft}</span>
                      <Input
                        className="max-w-[90px]"
                        placeholder="₹"
                        value={prices[ft] || ''}
                        onChange={e => setPrices({ ...prices, [ft]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-md text-sm text-red-800">
                  <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={submit}
                disabled={!canSubmit}
                className="w-full flex items-center gap-2"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Store className="h-4 w-4" />
                    Save Shop
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {sortedShops.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-foreground">Reported Shops</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{loading ? 'Loading...' : `${sortedShops.length} shops`}</Badge>
              {nearMe && (
                <Button variant="outline" size="sm" onClick={() => setNearMe(null)} className="gap-1">
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          {nearMe && (
            <p className="text-sm text-muted-foreground">Sorted by distance from your location</p>
          )}
          <div className="grid grid-cols-1 gap-3">
            {sortedShops.map(s => {
              const dist = nearMe && s.lat != null && s.lng != null
                ? haversine(nearMe.lat, nearMe.lng, s.lat, s.lng)
                : null
              return (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Flower2 className="h-4 w-4 text-gold flex-shrink-0" />
                        <span className="font-semibold text-foreground truncate">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {dist != null && (
                          <Badge variant="outline" className="text-gold border-gold text-xs">
                            {dist < 1 ? `${Math.round(dist * 1000)}m away` : `${dist.toFixed(1)}km away`}
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <a
                            href={'https://www.google.com/maps?q=' + s.lat + ',' + s.lng}
                            target="_blank" rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Maps
                          </a>
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.area}</p>
                    {Object.keys(s.prices || {}).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {Object.entries(s.prices || {}).map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-xs">
                            {k}: ₹{v}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
