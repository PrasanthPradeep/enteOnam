import { useState, useEffect } from 'react'
import { getPriceListTypes, getAllPrices } from '../../shared/api.js'

const TYPE_NAMES = {
  1: 'Subsidy',
  2: 'Free Sale',
  3: 'Bulk',
  4: 'K Store',
  5: 'Maveli',
}

export default function PricesView() {
  const [types, setTypes] = useState([])
  const [activeType, setActiveType] = useState(5)
  const [prices, setPrices] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getPriceListTypes().then(r => setTypes(r.data || []))
  }, [])

  useEffect(() => {
    if (!activeType) return
    setLoading(true)
    const now = new Date()
    getAllPrices(activeType, now.getFullYear(), now.getMonth() + 1)
      .then(data => setPrices(data))
      .finally(() => setLoading(false))
  }, [activeType])

  const filtered = query
    ? prices.filter(p => p.product_name?.toLowerCase().includes(query.toLowerCase()))
    : prices

  return (
    <section>
      <h2>Supplyco Prices</h2>
      <p style={{ marginBottom: 16 }}>{prices.length || '...'} items in current list</p>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {[5, 1, 2, 3, 4].map(id => (
          <button
            key={id}
            className={'tab' + (activeType === id ? ' active' : '')}
            onClick={() => setActiveType(id)}
          >
            {TYPE_NAMES[id]}
          </button>
        ))}
      </div>
      <input
        className="form-input"
        placeholder="Search products..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      {loading ? (
        <p>Loading prices...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map((p, i) => (
            <div key={p.product_id + '-' + i} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px' }}>
              <span style={{ fontSize: '0.9rem' }}>{p.product_name}</span>
              <span style={{ fontWeight: 600, color: 'var(--green)' }}>₹{p.rate}</span>
            </div>
          ))}
          {filtered.length === 0 && <p>No products match your search.</p>}
        </div>
      )}
    </section>
  )
}
