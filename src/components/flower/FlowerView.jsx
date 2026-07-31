import { useState, useEffect, useRef } from 'react'
import {
  Flower2, MapPin, Loader2, ExternalLink, Link2, Store, Plus, X,
  CheckCircle2, Navigation
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'

const STORAGE_KEY = 'enteonam_flower_shops'
const FLOWER_TYPES = ['Thumba', 'Arali', 'Jamanthi', 'Marigold', 'Chembarathi', 'Mukutti', 'Krishna kireedam']

function getShops() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

export default function FlowerView() {
  const [shops, setShops] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [prices, setPrices] = useState({})
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [locating, setLocating] = useState(false)
  const [mapLink, setMapLink] = useState('')
  const [saved, setSaved] = useState(false)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const LRef = useRef(null)

  const refresh = () => setShops([...getShops()])

  useEffect(() => { refresh() }, [])

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
    if (m) { setLat(parseFloat(m[1])); setLng(parseFloat(m[2])); return }
    m = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m) { setLat(parseFloat(m[1])); setLng(parseFloat(m[2])); return }
    m = url.match(/\/place\/.*@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m) { setLat(parseFloat(m[1])); setLng(parseFloat(m[2])); return }
  }

  const locateMe = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  const submit = () => {
    if (!name || !area || lat == null || lng == null) return
    const shops = getShops()
    const shop = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name, area, lat, lng,
      prices: Object.fromEntries(Object.entries(prices).filter(([_, v]) => v)),
      createdAt: new Date().toISOString(),
    }
    shops.push(shop)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shops))
    setName(''); setArea(''); setLat(null); setLng(null); setPrices({}); setShowForm(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
    refresh()
  }

  const canSubmit = name && area && lat != null && lng != null

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Flower Shops</h1>
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
              placeholder="Or paste a Google Maps link..."
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

      {shops.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Reported Shops</h2>
            <Badge variant="secondary">{shops.length} shops</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {shops.map(s => (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Flower2 className="h-4 w-4 text-gold" />
                      <span className="font-semibold text-foreground">{s.name}</span>
                    </div>
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
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
