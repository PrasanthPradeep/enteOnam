import { useState, useEffect, useMemo, useRef } from 'react'
import { getAllOutlets } from '../../shared/api.js'
import { haversine } from '../../shared/utils.js'
import StockReportForm from './StockReportForm.jsx'

function OutletMap({ outlet }) {
  const mapRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !outlet.latitude || !outlet.longitude) return
    initialized.current = true
    import('leaflet').then(L => {
      const map = L.map(mapRef.current, {
        center: [outlet.latitude, outlet.longitude],
        zoom: 15,
        zoomControl: false,
        scrollWheelZoom: false,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)
      L.marker([outlet.latitude, outlet.longitude]).addTo(map)
    })
  }, [outlet])

  if (!outlet.latitude || !outlet.longitude) {
    return <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No coordinates</p>
  }

  return <div ref={mapRef} style={{ width: '100%', height: 180, borderRadius: 'var(--radius)', marginTop: 8 }} />
}

export default function StoresView() {
  const [outlets, setOutlets] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [depot, setDepot] = useState('')
  const [userLoc, setUserLoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllOutlets()
      .then(data => setOutlets(data))
      .finally(() => setLoading(false))
  }, [])

  const districts = useMemo(() => {
    const s = new Set(outlets.map(o => o.district_name).filter(Boolean))
    return [...s].sort()
  }, [outlets])

  const depots = useMemo(() => {
    let list = outlets.filter(o => o.depot)
    if (district) list = list.filter(o => o.district_name === district)
    return [...new Set(list.map(o => o.depot))].sort()
  }, [outlets, district])

  const locate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLoc(null)
    )
  }

  const filtered = useMemo(() => {
    let list = outlets
    if (district) list = list.filter(o => o.district_name === district)
    if (depot) list = list.filter(o => o.depot === depot)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(o =>
        o.name?.toLowerCase().includes(q) ||
        o.address1?.toLowerCase().includes(q) ||
        o.address2?.toLowerCase().includes(q)
      )
    }
    if (userLoc) {
      list = list.map(o => ({
        ...o,
        _dist: o.latitude && o.longitude
          ? haversine(userLoc.lat, userLoc.lng, o.latitude, o.longitude)
          : Infinity
      })).filter(o => o._dist < Infinity)
        .sort((a, b) => a._dist - b._dist)
    }
    return list.slice(0, 50)
  }, [outlets, district, depot, query, userLoc])

  return (
    <section>
      <h2>Supplyco Stores</h2>
      <p style={{ marginBottom: 16 }}>{outlets.length} outlets across Kerala</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <select className="form-input" style={{ flex: 1, minWidth: 140 }} value={district} onChange={e => { setDistrict(e.target.value); setDepot('') }}>
            <option value="">All districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-input" style={{ flex: 1, minWidth: 140 }} value={depot} onChange={e => setDepot(e.target.value)}>
            <option value="">All depots</option>
            {depots.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input className="form-input" style={{ flex: 2, minWidth: 180 }} placeholder="Search name or address..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={locate}>
          {userLoc ? 'Nearby: ' + Math.round(filtered[0]?._dist || 0) + 'km' : 'Nearby'}
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        {!district && !userLoc ? null : loading ? <p>Loading outlets...</p> : filtered.length === 0 ? <p>No outlets match.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(o => (
              <div key={o.outlet_id}>
                <div
                  className="card"
                  style={{
                    cursor: 'pointer', padding: '12px 16px',
                    borderColor: selected?.outlet_id === o.outlet_id ? 'var(--gold)' : undefined,
                  }}
                  onClick={() => setSelected(selected?.outlet_id === o.outlet_id ? null : o)}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold)', transition: 'transform 0.2s', display: 'inline-block', transform: selected?.outlet_id === o.outlet_id ? 'rotate(90deg)' : 'none' }}>▶</span>
                      {o.name}
                    </span>
                    {o._dist != null && <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>{Math.round(o._dist)}km</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.address1}, {o.district_name} — {o.depot}</div>
                </div>
                {selected?.outlet_id === o.outlet_id && (
                  <div className="card" style={{ marginTop: 2, borderColor: 'var(--gold)' }}>
                    <h3>{selected.name}</h3>
                    <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>{selected.address1}, {selected.address2}, {selected.address3}</p>
                    <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>{selected.district_name} — {selected.depot}</p>
                    <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>{selected.phone}</p>
                    <span className={'badge ' + (selected.status ? 'badge-green' : 'badge-red')}>{selected.status ? 'Active' : 'Inactive'}</span>
                    <OutletMap outlet={selected} />
                    <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
                      {selected.latitude && selected.longitude && (
                        <a
                          className="btn btn-primary"
                          href={'https://www.google.com/maps/dir/?api=1&destination=' + selected.latitude + ',' + selected.longitude}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          Directions
                        </a>
                      )}
                      <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
                    </div>
                    <StockReportForm outletId={selected.outlet_id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
