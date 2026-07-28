import { useState, useEffect, useRef } from 'react'

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
    refresh()
  }

  return (
    <section>
      <h2>Flower Shops</h2>
      <p style={{ marginBottom: 8 }}>{shops.length} shops reported</p>
      <div ref={mapRef} style={{ width: '100%', height: 300, borderRadius: 'var(--radius)', marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button className={'btn ' + (showForm ? 'btn-primary' : 'btn-outline')} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Report a Flower Shop'}
        </button>
        <button className='btn btn-outline' onClick={locateMe} disabled={locating}>
          {locating ? 'Locating...' : 'Use my location'}
        </button>
        {lat != null && (
          <span style={{ fontSize: '0.85rem', alignSelf: 'center', color: 'var(--green)' }}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        )}
        {lat != null && (
          <a
            className='btn btn-outline'
            style={{ fontSize: '0.8rem', padding: '4px 10px', textDecoration: 'none' }}
            href={'https://www.google.com/maps?q=' + lat + ',' + lng}
            target='_blank' rel='noopener noreferrer'
          >
            Google Maps
          </a>
        )}
        {lat == null && <span style={{ fontSize: '0.85rem', alignSelf: 'center', color: 'var(--text-muted)' }}>Click the map to place a marker</span>}
      </div>
      <input
        className='form-input'
        style={{ marginBottom: 12 }}
        placeholder='Or paste a Google Maps link...'
        value={mapLink}
        onChange={e => { setMapLink(e.target.value); parseMapLink(e.target.value) }}
      />
      {showForm && (
        <div className='card' style={{ marginTop: 8 }}>
          <div className='form-group'><label>Shop name</label><input className='form-input' value={name} onChange={e => setName(e.target.value)} /></div>
          <div className='form-group'><label>Area / Location</label><input className='form-input' value={area} onChange={e => setArea(e.target.value)} /></div>
          <div className='form-group'>
            <label>Location set from map click</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lat != null ? lat.toFixed(4) + ', ' + lng.toFixed(4) : 'Not set'}</p>
          </div>
          <p style={{ fontWeight: 500, margin: '8px 0 4px' }}>Current prices:</p>
          {FLOWER_TYPES.map(ft => (
            <div key={ft} className='form-group' style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <label style={{ minWidth: 140, margin: 0 }}>{ft}</label>
              <input className='form-input' style={{ maxWidth: 100 }} placeholder='₹' value={prices[ft] || ''} onChange={e => setPrices({ ...prices, [ft]: e.target.value })} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ bunch</span>
            </div>
          ))}
          <button className='btn btn-primary' onClick={submit} disabled={!name || !area || lat == null || lng == null}>Save Shop</button>
        </div>
      )}
      {shops.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Reported Shops</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {shops.map(s => (
              <div key={s.id} className='card' style={{ padding: '10px 14px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.area}</div>
                {Object.keys(s.prices || {}).length > 0 && (
                  <div style={{ fontSize: '0.85rem', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                    {Object.entries(s.prices || {}).map(([k, v]) => (
                      <span key={k}><strong>{k}:</strong> ₹{v}/bunch</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
