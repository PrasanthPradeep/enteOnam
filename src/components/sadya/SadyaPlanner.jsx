import { useState, useMemo } from 'react'

const SADYA_DISHES = [
  { id: 'pappadam', name: 'Pappadam', category: 'Chips & Sides', costPerPerson: 2 },
  { id: 'sharkara_upperi', name: 'Sharkara Upperi', category: 'Chips & Sides', costPerPerson: 5 },
  { id: 'kaya_varuthathu', name: 'Kaya Varuthathu', category: 'Chips & Sides', costPerPerson: 4 },
  { id: 'chena_varuthathu', name: 'Chena Varuthathu', category: 'Chips & Sides', costPerPerson: 4 },
  { id: 'sarkara_upperi', name: 'Sarkara Upperi', category: 'Chips & Sides', costPerPerson: 5 },
  { id: 'banana_chips', name: 'Banana Chips', category: 'Chips & Sides', costPerPerson: 3 },
  { id: 'pulinji', name: 'Pulinji', category: 'Curries', costPerPerson: 6 },
  { id: 'kaalan', name: 'Kaalan (Mathanga)', category: 'Curries', costPerPerson: 8 },
  { id: 'olans', name: 'Olan', category: 'Curries', costPerPerson: 7 },
  { id: 'avial', name: 'Avial', category: 'Curries', costPerPerson: 10 },
  { id: 'thoran', name: 'Thoran (Cabbage)', category: 'Curries', costPerPerson: 6 },
  { id: 'pachadi', name: 'Pachadi (Pineapple)', category: 'Curries', costPerPerson: 8 },
  { id: 'kichadi', name: 'Kichadi (Vellarikka)', category: 'Curries', costPerPerson: 7 },
  { id: 'erisheri', name: 'Erisheri (Chena)', category: 'Curries', costPerPerson: 9 },
  { id: 'sambar', name: 'Sambar', category: 'Main Curries', costPerPerson: 8 },
  { id: 'rasam', name: 'Rasam', category: 'Main Curries', costPerPerson: 5 },
  { id: 'pulisheri', name: 'Pulisheri', category: 'Main Curries', costPerPerson: 7 },
  { id: 'moru', name: 'Moru (Buttermilk)', category: 'Main Curries', costPerPerson: 4 },
  { id: 'injipuli', name: 'Injipuli', category: 'Main Curries', costPerPerson: 6 },
  { id: 'nellikka', name: 'Nellikka Curry', category: 'Main Curries', costPerPerson: 6 },
  { id: 'koottukari', name: 'Koottukari', category: 'Main Curries', costPerPerson: 8 },
  { id: 'mathanga_erisheri', name: 'Mathanga Erisheri', category: 'Main Curries', costPerPerson: 9 },
  { id: 'rice', name: 'Steamed Rice (Mattta)', category: 'Rice', costPerPerson: 5 },
  { id: 'payasam_ada', name: 'Ada Payasam', category: 'Payasam', costPerPerson: 12 },
  { id: 'payasam_palada', name: 'Palada Payasam', category: 'Payasam', costPerPerson: 15 },
  { id: 'payasam_nyp', name: 'Neyyappam', category: 'Payasam', costPerPerson: 10 },
  { id: 'payasam_kozhukkatta', name: 'Kozhukkatta', category: 'Payasam', costPerPerson: 8 },
  { id: 'buttermilk', name: 'Buttermilk (finale)', category: 'Finishers', costPerPerson: 3 },
  { id: 'vada', name: 'Vada', category: 'Finishers', costPerPerson: 6 },
]

const CATEGORIES = ['Chips & Sides', 'Curries', 'Main Curries', 'Rice', 'Payasam', 'Finishers']

export default function SadyaPlanner() {
  const [guests, setGuests] = useState(10)
  const [selected, setSelected] = useState(() => new Map(SADYA_DISHES.map(d => [d.id, true])))

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Map(prev)
      next.set(id, !prev.get(id))
      return next
    })
  }

  const total = useMemo(() => {
    return SADYA_DISHES.reduce((sum, d) => {
      if (selected.get(d.id)) sum += d.costPerPerson * guests
      return sum
    }, 0)
  }, [guests, selected])

  const grouped = useMemo(() => {
    const map = {}
    for (const d of SADYA_DISHES) {
      if (!map[d.category]) map[d.category] = []
      map[d.category].push(d)
    }
    return map
  }, [])

  return (
    <section>
      <h2>Sadya Planner</h2>
      <p style={{ marginBottom: 16 }}>Plan your Onam feast & estimate cost</p>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label>Number of guests</label>
          <input
            type="number"
            className="form-input"
            value={guests}
            onChange={e => setGuests(Math.max(1, +e.target.value))}
            min="1"
            style={{ maxWidth: 120 }}
          />
        </div>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--green)', margin: 0 }}>
          Total: ₹{total}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          ₹{Math.round(total / guests)} per guest
        </p>
      </div>
      {CATEGORIES.map(cat => {
        const dishes = grouped[cat] || []
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1rem', color: 'var(--gold)' }}>{cat}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {dishes.map(d => {
                const included = selected.get(d.id)
                return (
                  <label
                    key={d.id}
                    className="card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer',
                      opacity: included ? 1 : 0.45,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={() => toggle(d.id)}
                      style={{ accentColor: 'var(--green)' }}
                    />
                    <span style={{ flex: 1, fontWeight: included ? 500 : 400 }}>{d.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{d.costPerPerson}/person</span>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}