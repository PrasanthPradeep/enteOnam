import { useState, useEffect } from 'react'

const rituals = [
  { day: 'Atham', desc: 'Start of Onam season. Pookalam begins.' },
  { day: 'Chithira', desc: 'Second layer added to pookalam.' },
  { day: 'Chodhi', desc: 'Shopping for new clothes begins.' },
  { day: 'Vishakam', desc: 'Markets get busy. Sweets prepared.' },
  { day: 'Anizham', desc: 'Vallamkali (boat race) practice starts.' },
  { day: 'Thriketa', desc: 'Grand pookalam. Family gatherings begin.' },
  { day: 'Moolam', desc: 'Feasts in temples. Onam sadya served.' },
  { day: 'Pooradam', desc: 'Small conical clay idols (Onathappan) placed.' },
  { day: 'Uthradam', desc: 'Final shopping day. Family arrivals.' },
  { day: 'Thiruvonam', desc: 'Main Onam day. Grand sadya, festivities.' },
]

export default function CountdownView() {
  const [daysLeft, setDaysLeft] = useState(0)
  useEffect(() => {
    const target = new Date('2026-09-08')
    const diff = Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24))
    setDaysLeft(Math.max(0, diff))
  }, [])

  return (
    <section>
      <h2>Onam Countdown & Rituals</h2>
      <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--green)' }}>
        {daysLeft > 0 ? daysLeft + ' days until Thiruvonam' : 'Onam is here!'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        {rituals.map(r => (
          <div key={r.day} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px' }}>
            <span style={{ fontWeight: 700, minWidth: 100, color: 'var(--gold)' }}>{r.day}</span>
            <span>{r.desc}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
