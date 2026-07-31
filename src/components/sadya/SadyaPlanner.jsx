import { useState, useMemo } from 'react'
import { Users, UtensilsCrossed, IndianRupee, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'

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

  const selectedCount = useMemo(
    () => SADYA_DISHES.reduce((n, d) => n + (selected.get(d.id) ? 1 : 0), 0),
    [selected]
  )

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Sadya Planner</h1>
        <p className="text-sm text-muted-foreground">
          Plan your Onam feast and estimate the cost
        </p>
      </header>

      <Card className="festival-card">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Number of guests
              </Label>
              <Input
                id="guests"
                type="number"
                min="1"
                className="max-w-[120px]"
                value={guests}
                onChange={e => setGuests(Math.max(1, +e.target.value))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-green-50">
            <div className="p-2 rounded-full bg-white">
              <IndianRupee className="h-5 w-5 text-green" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-green">
                ₹{total.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">
                ₹{Math.round(total / guests)} per guest · {selectedCount} dishes selected
              </p>
            </div>
            <Badge variant="secondary">{guests} guests</Badge>
          </div>
        </CardContent>
      </Card>

      {CATEGORIES.map(cat => {
        const dishes = grouped[cat] || []
        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gold uppercase tracking-wide">{cat}</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {dishes.map(d => {
                const included = selected.get(d.id)
                return (
                  <Card
                    key={d.id}
                    className={`cursor-pointer transition-colors ${included ? 'border-green bg-green-50/50' : 'opacity-50 hover:opacity-75'}`}
                    onClick={() => toggle(d.id)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <CheckCircle2
                        className={`h-5 w-5 shrink-0 ${included ? 'text-green' : 'text-border'}`}
                      />
                      <span className={`flex-1 text-sm ${included ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {d.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ₹{d.costPerPerson}/person
                      </span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
        <UtensilsCrossed className="h-4 w-4 text-gold" />
        A complete traditional Onam sadya
      </div>
    </section>
  )
}
