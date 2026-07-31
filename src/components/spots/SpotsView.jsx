import { useState, useEffect, useRef } from 'react'
import { MapPin, Camera, Navigation, Loader2, ExternalLink, X, Clock } from 'lucide-react'
import SpotSubmissionForm from './SpotSubmissionForm.jsx'
import { getSpots } from './SpotSubmissionForm.jsx'
import { timeAgo } from '../../shared/utils.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'

export default function SpotsView() {
  const [spots, setSpots] = useState([])
  const [selected, setSelected] = useState(null)
  const [pickLat, setPickLat] = useState(null)
  const [pickLng, setPickLng] = useState(null)
  const [locating, setLocating] = useState(false)
  const [mapLink, setMapLink] = useState('')
  const [mapLoading, setMapLoading] = useState(true)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const LRef = useRef(null)
  const layer = useRef(null)

  const refresh = () => setSpots([...getSpots()])

  useEffect(() => { 
    refresh() 
  }, [])

  useEffect(() => {
    if (mapInstance.current) return
    setMapLoading(true)
    
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
        maxZoom: 18,
      }).addTo(map)
      
      map.on('click', e => {
        setPickLat(e.latlng.lat)
        setPickLng(e.latlng.lng)
      })
      
      mapInstance.current = map
      setTimeout(() => setMapLoading(false), 1000) // Fallback
      map.on('load', () => setMapLoading(false))
    })
  }, [])

  useEffect(() => {
    const map = mapInstance.current
    const L = LRef.current
    if (!map || !L) return
    
    if (layer.current) { 
      map.removeLayer(layer.current)
      layer.current = null 
    }
    
    const markers = spots.filter(s => s.lat != null && s.lng != null).map(s => {
      const icon = L.divIcon({
        html: `<div style="background:#C1502E;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;background:#fff;border-radius:50%;"></div></div>`,
        iconSize: [20, 20],
        className: '',
      })
      
      const m = L.marker([s.lat, s.lng], { icon })
      m.bindTooltip(s.name, { 
        permanent: false, 
        direction: 'top',
        offset: L.point(0, -10),
        className: 'custom-tooltip'
      })
      m.on('click', () => setSelected(s))
      return m
    })
    
    if (markers.length === 0) return
    const group = L.featureGroup(markers)
    group.addTo(map)
    layer.current = group
  }, [spots])

  useEffect(() => {
    const map = mapInstance.current
    const L = LRef.current
    if (!map || !L) return
    
    // Remove existing pick marker
    map.eachLayer(l => { 
      if (l._isPickMarker) map.removeLayer(l) 
    })
    
    if (pickLat != null && pickLng != null) {
      const pickIcon = L.divIcon({
        html: `<div style="background:#D9A441;width:24px;height:24px;border-radius:50%;border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;background:#fff;border-radius:50%;"></div></div>`,
        iconSize: [24, 24],
        className: '',
      })
      
      const m = L.marker([pickLat, pickLng], { icon: pickIcon })
      m._isPickMarker = true
      m.bindPopup('<div style="text-align:center;"><strong>Selected Location</strong><br/>Click here to add a celebration spot</div>')
      m.addTo(map)
      map.setView([pickLat, pickLng], 14)
    }
  }, [pickLat, pickLng])

  const parseMapLink = (url) => {
    // google.com/maps/@lat,lng,zoom
    let m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m) { setPickLat(parseFloat(m[1])); setPickLng(parseFloat(m[2])); return }
    // google.com/maps?q=lat,lng
    m = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m) { setPickLat(parseFloat(m[1])); setPickLng(parseFloat(m[2])); return }
    // google.com/maps/place/.../@lat,lng,zoom
    m = url.match(/\/place\/.*@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m) { setPickLat(parseFloat(m[1])); setPickLng(parseFloat(m[2])); return }
  }

  const locateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }
    
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPickLat(pos.coords.latitude)
        setPickLng(pos.coords.longitude)
        setLocating(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please check your browser permissions.')
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const clearSelection = () => {
    setPickLat(null)
    setPickLng(null)
    setMapLink('')
  }

  const MapLoadingSkeleton = () => (
    <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-green" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
          <Camera className="h-8 w-8 text-gold" />
          Celebration Spots
        </h1>
        <p className="text-muted-foreground">
          {spots.length} celebration spots shared by the community
        </p>
      </div>

      {/* Interactive Map */}
      <Card className="festival-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Add Your Celebration Spot</CardTitle>
              <CardDescription>
                Click on the map or use your location to mark a spot
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-terracotta border-terracotta">
              {spots.length} spots
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Map Container */}
          <div className="relative">
            {mapLoading ? (
              <MapLoadingSkeleton />
            ) : (
              <div 
                ref={mapRef} 
                className="w-full h-80 md:h-96 rounded-lg border shadow-sm cursor-crosshair"
              />
            )}
          </div>

          {/* Location Controls */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={locateMe}
                disabled={locating}
                className="flex items-center gap-2"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {locating ? 'Locating...' : 'Use My Location'}
              </Button>

              {pickLat != null && (
                <>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {pickLat.toFixed(4)}, {pickLng.toFixed(4)}
                  </Badge>
                  
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://www.google.com/maps?q=${pickLat},${pickLng}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Google Maps
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </>
              )}
            </div>

            {/* Map Link Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Or paste a Google Maps link
              </label>
              <Input
                placeholder="https://www.google.com/maps/@10.0000,76.0000..."
                value={mapLink}
                onChange={e => { 
                  setMapLink(e.target.value)
                  parseMapLink(e.target.value)
                }}
              />
            </div>

            {pickLat == null && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  👆 Click anywhere on the map to select a location for your celebration spot
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <SpotSubmissionForm 
        onSpotAdded={refresh} 
        lat={pickLat} 
        lng={pickLng} 
      />

      {/* Selected Spot Details */}
      {selected && (
        <Card className="festival-card border-terracotta">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-terracotta" />
                  {selected.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {selected.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {timeAgo(selected.createdAt)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected.description && (
              <p className="text-sm text-muted-foreground">
                {selected.description}
              </p>
            )}
            
            {selected.photo && (
              <div className="relative">
                <img 
                  src={selected.photo} 
                  alt={selected.name}
                  className="w-full max-h-80 object-cover rounded-lg shadow-sm"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Added {timeAgo(selected.createdAt)}
              </p>
              {selected.lat && selected.lng && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    View Location
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Legend */}
      <Card className="festival-card">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-800 mb-3">Map Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-terracotta rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Celebration Spots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gold rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
              <span>Selected Location</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}