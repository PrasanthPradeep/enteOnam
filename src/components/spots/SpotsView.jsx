import { useState, useEffect, useRef } from 'react'
import SpotSubmissionForm from './SpotSubmissionForm.jsx'
import { getSpots } from './SpotSubmissionForm.jsx'
import { timeAgo } from '../../shared/utils.js'

export default function SpotsView() {
  const [spots, setSpots] = useState([])
  const [selected, setSelected] = useState(null)
  const [pickLat, setPickLat] = useState(null)
  const [pickLng, setPickLng] = useState(null)
  const [locating, setLocating] = useState(false)
  const [mapLink, setMapLink] = useState('')
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const LRef = useRef(null)
  const layer = useRef(null)

  const refresh = () => setSpots([...getSpots()])

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
        setPickLat(e.latlng.lat)
        setPickLng(e.latlng.lng)
      })
      mapInstance.current = map
    })
  }, [])

  useEffect(() => {
    const map = mapInstance.current
    const L = LRef.current
    if (!map || !L) return
    if (layer.current) { map.removeLayer(layer.current); layer.current = null }
    const markers = spots.filter(s => s.lat != null && s.lng != null).map(s => {
      const m = L.marker([s.lat, s.lng])
      m.bindTooltip(s.name)
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
    map.eachLayer(l => { if (l._isPickMarker) map.removeLayer(l) })
    if (pickLat != null && pickLng != null) {
      const m = L.marker([pickLat, pickLng])
      m._isPickMarker = true
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
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPickLat(pos.coords.latitude)
        setPickLng(pos.coords.longitude)
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  return (
    <section>
      <h2>Onam Celebration Spots</h2>
      <p style={{ marginBottom: 8 }}>{spots.length} spots submitted</p>
      <div ref={mapRef} style={{ width: '100%', height: 350, borderRadius: 'var(--radius)', marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button className="btn btn-outline" onClick={locateMe} disabled={locating}>
          {locating ? 'Locating...' : 'Use my location'}
        </button>
        {pickLat != null && (
          <span style={{ fontSize: '0.85rem', alignSelf: 'center', color: 'var(--green)' }}>
            {pickLat.toFixed(4)}, {pickLng.toFixed(4)}
          </span>
        )}
        {pickLat != null && (
          <a
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '4px 10px', textDecoration: 'none' }}
            href={'https://www.google.com/maps?q=' + pickLat + ',' + pickLng}
            target="_blank" rel="noopener noreferrer"
          >
            Google Maps
          </a>
        )}
        {pickLat == null && <span style={{ fontSize: '0.85rem', alignSelf: 'center', color: 'var(--text-muted)' }}>Click the map to place a marker</span>}
      </div>
      <input
        className="form-input"
        style={{ marginBottom: 12 }}
        placeholder="Or paste a Google Maps link..."
        value={mapLink}
        onChange={e => { setMapLink(e.target.value); parseMapLink(e.target.value) }}
      />
      <SpotSubmissionForm onSpotAdded={refresh} lat={pickLat} lng={pickLng} />
      {selected && (
        <div className="card" style={{ marginTop: 12, borderColor: 'var(--gold)' }}>
          <h3>{selected.name}</h3>
          <span className="badge badge-green">{selected.category}</span>
          {selected.description && <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>{selected.description}</p>}
          {selected.photo && <img src={selected.photo} alt={selected.name} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 'var(--radius)' }} />}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0' }}>{timeAgo(selected.createdAt)}</p>
          <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </section>
  )
}