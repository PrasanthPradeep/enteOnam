import { useState, useEffect } from 'react'
import { getPriceListTypes, getAllPrices } from '../../shared/api.js'

const TYPE_NAMES = {
  1: 'Subsidy',
  2: 'Free Sale',
  3: 'Bulk',
  4: 'K Store',
  5: 'Maveli',
}

export default function PriceBrowser() {
  const [types, setTypes] = useState([])
  const [activeType, setActiveType] = useState(5)
  const [prices, setPrices] = useState([])
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

  return (
    <div>
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
      {loading ? (
        <p>Loading prices...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {prices.map((p, i) => (
            <div key={p.product_id + '-' + i} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px' }}>
              <span style={{ fontSize: '0.9rem' }}>{p.product_name}</span>
              <span style={{ fontWeight: 600, color: 'var(--green)' }}>₹{p.rate}</span>
            </div>
          ))}
          {prices.length === 0 && <p>No prices found for this month.</p>}
        </div>
      )}
    </div>
  )
}
