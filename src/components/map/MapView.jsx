import { useState, useEffect, useRef } from 'react'
import { getAllOutlets } from '../../shared/api.js'

export default function MapView() {
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)

  useEffect(() => {
    getAllOutlets()
      .then(data => {
        const withCoords = data.filter(o => o.latitude && o.longitude)
        setOutlets(withCoords)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || outlets.length === 0 || mapRef.current) return
    // Leaflet loaded dynamically to avoid SSR issues
    import('leaflet').then(L => {
      // Load markercluster CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css'
      document.head.appendChild(link)

      const map = L.map('map').setView([10.5, 76.2], 8)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map)

      const greenIcon = L.divIcon({
        html: '<div style="background:#2F5D3A;width:14px;height:14px;border-radius:50%;border:2px solid #fff;"></div>',
        iconSize: [14, 14],
        className: '',
      })

      const markers = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
      })

      outlets.forEach(o => {
        const m = L.marker([o.latitude, o.longitude], { icon: greenIcon })
        m.bindPopup('<b>' + o.name + '</b><br>' + o.address1 + ', ' + o.district_name)
        markers.addLayer(m)
      })

      map.addLayer(markers)

      if (outlets.length > 0) {
        const bounds = L.latLngBounds(outlets.map(o => [o.latitude, o.longitude]))
        map.fitBounds(bounds, { padding: [30, 30] })
      }
    })
  }, [loading, outlets])

  return (
    <section>
      <h2>Onam Map</h2>
      <p>{outlets.length} outlets with coordinates mapped</p>
      <div id="map" className="map-container" style={{ height: 500 }}>
        {loading ? 'Loading outlets...' : 'Loading map...'}
      </div>
    </section>
  )
}
