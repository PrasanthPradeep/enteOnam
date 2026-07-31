import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, Navigation, Maximize2, Eye, EyeOff } from 'lucide-react'
import { getAllOutlets } from '../../shared/api.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'

export default function MapView() {
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapLoading, setMapLoading] = useState(true)
  const [showClusters, setShowClusters] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    getAllOutlets()
      .then(data => {
        const withCoords = data.filter(o => o.latitude && o.longitude)
        setOutlets(withCoords)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || outlets.length === 0 || mapInstance.current) return
    setMapLoading(true)
    
    // Leaflet loaded dynamically to avoid SSR issues
    import('leaflet').then(L => {
      // Load markercluster CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css'
      document.head.appendChild(link)

      const map = L.map('map').setView([10.5, 76.2], 8)
      mapInstance.current = map
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map)

      const greenIcon = L.divIcon({
        html: '<div style="background:#1E6B4E;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>',
        iconSize: [14, 14],
        className: '',
      })

      const userIcon = L.divIcon({
        html: '<div style="background:#D9A441;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"><div style="width:6px;height:6px;background:#fff;border-radius:50%;margin:2px;"></div></div>',
        iconSize: [16, 16],
        className: '',
      })

      const markers = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        iconCreateFunction: cluster => {
          const count = cluster.getChildCount()
          return L.divIcon({
            html: `<div style="background:#1E6B4E;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(40, 40, true),
          })
        }
      })

      outlets.forEach(o => {
        const m = L.marker([o.latitude, o.longitude], { icon: greenIcon })
        const popupContent = `
          <div style="min-width:200px;">
            <h3 style="margin:0 0 8px 0;color:#1E6B4E;font-size:14px;">${o.name}</h3>
            <p style="margin:0 0 4px 0;font-size:12px;color:#666;">${o.address1}</p>
            <p style="margin:0 0 8px 0;font-size:12px;color:#666;">${o.district_name}</p>
            <div style="display:flex;gap:8px;align-items:center;">
              <span style="background:${o.status ? '#1E6B4E' : '#C1502E'};color:white;padding:2px 8px;border-radius:12px;font-size:10px;">${o.status ? 'Active' : 'Inactive'}</span>
              ${o.depot ? `<span style="font-size:11px;color:#666;">${o.depot}</span>` : ''}
            </div>
          </div>
        `
        m.bindPopup(popupContent)
        markers.addLayer(m)
      })

      map.addLayer(markers)
      window.markersLayer = markers

      if (outlets.length > 0) {
        const bounds = L.latLngBounds(outlets.map(o => [o.latitude, o.longitude]))
        map.fitBounds(bounds, { padding: [30, 30] })
      }

      map.on('load', () => setMapLoading(false))
      setTimeout(() => setMapLoading(false), 1000) // Fallback
    })
  }, [loading, outlets])

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }
    
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        
        if (mapInstance.current) {
          const L = window.L
          if (L) {
            // Remove existing user marker
            if (window.userMarker) {
              mapInstance.current.removeLayer(window.userMarker)
            }
            
            // Add new user marker
            const userIcon = L.divIcon({
              html: '<div style="background:#D9A441;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"><div style="width:6px;height:6px;background:#fff;border-radius:50%;margin:2px;"></div></div>',
              iconSize: [16, 16],
              className: '',
            })
            
            window.userMarker = L.marker([latitude, longitude], { icon: userIcon })
              .bindPopup('<div style="text-align:center;"><strong>Your Location</strong></div>')
              .addTo(mapInstance.current)
            
            mapInstance.current.setView([latitude, longitude], 12)
          }
        }
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

  const toggleClusters = () => {
    if (mapInstance.current && window.markersLayer) {
      const map = mapInstance.current
      const markers = window.markersLayer
      
      if (showClusters) {
        // Disable clustering
        map.removeLayer(markers)
        markers.eachLayer(layer => map.addLayer(layer))
      } else {
        // Enable clustering
        markers.eachLayer(layer => map.removeLayer(layer))
        map.addLayer(markers)
      }
      setShowClusters(!showClusters)
    }
  }

  const LoadingSkeleton = () => (
    <Card className="festival-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
          <MapPin className="h-8 w-8 text-gold" />
          Store Locations
        </h1>
        <p className="text-muted-foreground">
          {loading ? 'Loading stores...' : `${outlets.length} stores mapped across Kerala`}
        </p>
      </div>

      {/* Map Controls */}
      <Card className="festival-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Interactive Map</CardTitle>
              <CardDescription>
                Click on markers to see store details
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green border-green">
                {outlets.length} stores
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Map Controls */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={locateUser}
              disabled={locating}
              className="flex items-center gap-2"
            >
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {locating ? 'Locating...' : 'Find Me'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleClusters}
              className="flex items-center gap-2"
            >
              {showClusters ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showClusters ? 'Disable Clusters' : 'Enable Clusters'}
            </Button>

            {userLocation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gold rounded-full"></div>
                Your Location
              </Badge>
            )}
          </div>

          {/* Map Container */}
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="relative">
              <div 
                id="map" 
                className="w-full h-96 md:h-[500px] rounded-lg border shadow-sm"
              >
                {mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-green" />
                      <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Legend */}
      <Card className="festival-card">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-800 mb-3">Map Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green rounded-full border-2 border-white shadow-sm"></div>
              <span>Active Stores</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gold rounded-full border-2 border-white shadow-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full m-0.5"></div>
              </div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
                5
              </div>
              <span>Clustered Markers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
