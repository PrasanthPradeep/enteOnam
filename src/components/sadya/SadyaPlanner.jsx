import { useState, useMemo } from 'react'
import { Users, UtensilsCrossed, IndianRupee, CheckCircle2, BookOpen, X } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

const SADYA_DISHES = [
  { 
    id: 'pappadam', 
    name: 'Pappadam', 
    category: 'Chips & Sides', 
    costPerPerson: 4.7,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'sharkara_upperi', 
    name: 'Sharkara Upperi', 
    category: 'Chips & Sides', 
    costPerPerson: 8.95,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'kaya_varuthathu', 
    name: 'Kaya Varuthathu', 
    category: 'Chips & Sides', 
    costPerPerson: 10.9,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'chena_varuthathu', 
    name: 'Chena Varuthathu', 
    category: 'Chips & Sides', 
    costPerPerson: 11.3,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'sarkara_upperi', 
    name: 'Sarkara Upperi', 
    category: 'Chips & Sides', 
    costPerPerson: 8.95,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'banana_chips', 
    name: 'Banana Chips', 
    category: 'Chips & Sides', 
    costPerPerson: 8.9,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'pulinji', 
    name: 'Pulinji', 
    category: 'Curries', 
    costPerPerson: 5.25,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'kaalan', 
    name: 'Kaalan (Mathanga)', 
    category: 'Curries', 
    costPerPerson: 9.8,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'olans', 
    name: 'Olan', 
    category: 'Curries', 
    costPerPerson: 6.9,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'avial', 
    name: 'Avial', 
    category: 'Curries', 
    costPerPerson: 16.6,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'thoran', 
    name: 'Thoran (Cabbage)', 
    category: 'Curries', 
    costPerPerson: 9.84,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'pachadi', 
    name: 'Pachadi (Pineapple)', 
    category: 'Curries', 
    costPerPerson: 9.26,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'kichadi', 
    name: 'Kichadi (Vellarikka)', 
    category: 'Curries', 
    costPerPerson: 9.2,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'erisheri', 
    name: 'Erisheri (Chena)', 
    category: 'Curries', 
    costPerPerson: 12.9,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'sambar', 
    name: 'Sambar', 
    category: 'Main Curries', 
    costPerPerson: 12.5,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'rasam', 
    name: 'Rasam', 
    category: 'Main Curries', 
    costPerPerson: 4.1,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'pulisheri', 
    name: 'Pulisheri', 
    category: 'Main Curries', 
    costPerPerson: 9.2,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'moru', 
    name: 'Moru (Buttermilk)', 
    category: 'Main Curries', 
    costPerPerson: 10.0,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'injipuli', 
    name: 'Injipuli', 
    category: 'Main Curries', 
    costPerPerson: 7.95,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'nellikka', 
    name: 'Nellikka Curry', 
    category: 'Main Curries', 
    costPerPerson: 5.9,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'koottukari', 
    name: 'Koottukari', 
    category: 'Main Curries', 
    costPerPerson: 10.6,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'mathanga_erisheri', 
    name: 'Mathanga Erisheri', 
    category: 'Main Curries', 
    costPerPerson: 9.8,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'rice', 
    name: 'Steamed Rice (Matta)', 
    category: 'Rice', 
    costPerPerson: 7.8,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'payasam_ada', 
    name: 'Ada Payasam', 
    category: 'Payasam', 
    costPerPerson: 15.3,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'payasam_palada', 
    name: 'Palada Payasam', 
    category: 'Payasam', 
    costPerPerson: 19.63,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'payasam_nyp', 
    name: 'Neyyappam', 
    category: 'Payasam', 
    costPerPerson: 13.33,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'payasam_kozhukkatta', 
    name: 'Kozhukkatta', 
    category: 'Payasam', 
    costPerPerson: 6.48,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'buttermilk', 
    name: 'Buttermilk (finale)', 
    category: 'Finishers', 
    costPerPerson: 7.0,
    recipe: 'Recipe will be added soon.'
  },
  { 
    id: 'vada', 
    name: 'Vada', 
    category: 'Finishers', 
    costPerPerson: 14.7,
    recipe: 'Recipe will be added soon.'
  },
]

const CATEGORIES = ['Chips & Sides', 'Curries', 'Main Curries', 'Rice', 'Payasam', 'Finishers']

export default function SadyaPlanner() {
  const [guests, setGuests] = useState(10)
  const [selected, setSelected] = useState(() => new Map(SADYA_DISHES.map(d => [d.id, true])))
  const [recipeDialog, setRecipeDialog] = useState({ open: false, dish: null })

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Map(prev)
      next.set(id, !prev.get(id))
      return next
    })
  }

  const openRecipe = (dish, e) => {
    e.stopPropagation()
    setRecipeDialog({ open: true, dish })
  }

  const closeRecipe = () => {
    setRecipeDialog({ open: false, dish: null })
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
                    className={`transition-colors ${included ? 'border-green bg-green-50/50' : 'opacity-50 hover:opacity-75'}`}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <CheckCircle2
                        className={`h-5 w-5 shrink-0 cursor-pointer ${included ? 'text-green' : 'text-border'}`}
                        onClick={() => toggle(d.id)}
                      />
                      <span 
                        className={`flex-1 text-sm cursor-pointer ${included ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                        onClick={() => toggle(d.id)}
                      >
                        {d.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ₹{d.costPerPerson}/person
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gold hover:text-gold-600 hover:bg-gold-50"
                        onClick={(e) => openRecipe(d, e)}
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
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

      {/* Recipe Dialog */}
      <Dialog open={recipeDialog.open} onOpenChange={closeRecipe}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-green-800">
              <BookOpen className="h-6 w-6 text-gold" />
              {recipeDialog.dish?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary">{recipeDialog.dish?.category}</Badge>
              <span className="text-muted-foreground">
                ₹{recipeDialog.dish?.costPerPerson} per person
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-foreground">
                {recipeDialog.dish?.recipe}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
