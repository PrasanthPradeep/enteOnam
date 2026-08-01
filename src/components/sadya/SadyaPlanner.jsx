import { useState, useMemo } from 'react'
import { Users, UtensilsCrossed, IndianRupee, CheckCircle2, BookOpen, X, Clock, ChefHat } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import recipesData from './sadya_recipes_full.json'
import priceData from './sadya_home_cost_estimate.json'

const SADYA_DISHES = [
  { id: 'pappadam', name: 'Pappadam', category: 'Chips & Sides' },
  { id: 'sharkara_upperi', name: 'Sharkara Upperi', category: 'Chips & Sides' },
  { id: 'kaya_varuthathu', name: 'Kaya Varuthathu', category: 'Chips & Sides' },
  { id: 'chena_varuthathu', name: 'Chena Varuthathu', category: 'Chips & Sides' },
  { id: 'sarkara_upperi', name: 'Sarkara Upperi', category: 'Chips & Sides' },
  { id: 'banana_chips', name: 'Banana Chips', category: 'Chips & Sides' },
  { id: 'pulinji', name: 'Pulinji', category: 'Curries' },
  { id: 'kaalan', name: 'Kaalan (Mathanga)', category: 'Curries' },
  { id: 'olans', name: 'Olan', category: 'Curries' },
  { id: 'avial', name: 'Avial', category: 'Curries' },
  { id: 'thoran', name: 'Thoran (Cabbage)', category: 'Curries' },
  { id: 'pachadi', name: 'Pachadi (Pineapple)', category: 'Curries' },
  { id: 'kichadi', name: 'Kichadi (Vellarikka)', category: 'Curries' },
  { id: 'erisheri', name: 'Erisheri (Chena)', category: 'Curries' },
  { id: 'sambar', name: 'Sambar', category: 'Main Curries' },
  { id: 'rasam', name: 'Rasam', category: 'Main Curries' },
  { id: 'pulisheri', name: 'Pulisheri', category: 'Main Curries' },
  { id: 'moru', name: 'Moru (Buttermilk)', category: 'Main Curries' },
  { id: 'injipuli', name: 'Injipuli', category: 'Main Curries' },
  { id: 'nellikka', name: 'Nellikka Curry', category: 'Main Curries' },
  { id: 'koottukari', name: 'Koottukari', category: 'Main Curries' },
  { id: 'mathanga_erisheri', name: 'Mathanga Erisheri', category: 'Main Curries' },
  { id: 'rice', name: 'Steamed Rice (Matta)', category: 'Rice' },
  { id: 'payasam_ada', name: 'Ada Payasam', category: 'Payasam' },
  { id: 'payasam_palada', name: 'Palada Payasam', category: 'Payasam' },
  { id: 'payasam_nyp', name: 'Neyyappam', category: 'Payasam' },
  { id: 'payasam_kozhukkatta', name: 'Kozhukkatta', category: 'Payasam' },
  { id: 'buttermilk', name: 'Buttermilk (finale)', category: 'Finishers' },
  { id: 'vada', name: 'Vada', category: 'Finishers' },
]

// Helper function to get price for a dish
const getDishPrice = (dishId) => priceData[dishId] || 0

const CATEGORIES = ['Chips & Sides', 'Curries', 'Main Curries', 'Rice', 'Payasam', 'Finishers']

export default function SadyaPlanner() {
  const [guestsInput, setGuestsInput] = useState('5')
  const guests = Math.max(1, parseInt(guestsInput, 10) || 1)
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

  // Calculate scaled ingredients based on guest count
  const getScaledIngredients = (dishId, guestCount) => {
    const recipe = recipesData[dishId]
    if (!recipe || !recipe.ingredients) return []
    
    return recipe.ingredients.map(ing => ({
      ...ing,
      scaledQty: (ing.qty * guestCount).toFixed(1)
    }))
  }

  const currentRecipe = recipeDialog.dish ? recipesData[recipeDialog.dish.id] : null
  const scaledIngredients = recipeDialog.dish ? getScaledIngredients(recipeDialog.dish.id, guests) : []

  const total = useMemo(() => {
    return SADYA_DISHES.reduce((sum, d) => {
      if (selected.get(d.id)) sum += getDishPrice(d.id) * guests
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
                value={guestsInput}
                onChange={e => setGuestsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-green-50">
            <div className="p-2 rounded-full bg-white">
              <IndianRupee className="h-5 w-5 text-green" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-green">
                ₹{total.toLocaleString('en-IN')} ~approx
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
                        ₹{getDishPrice(d.id)}/person
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-green-800">
              <ChefHat className="h-6 w-6 text-gold" />
              {recipeDialog.dish?.name}
            </DialogTitle>
          </DialogHeader>
          
          {currentRecipe && (
            <div className="space-y-6 pt-4">
              {/* Recipe Meta Info */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{recipeDialog.dish?.category}</Badge>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Prep: {currentRecipe.prepTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Cook: {currentRecipe.cookTime}</span>
                </div>
                <Badge 
                  variant={currentRecipe.difficulty === 'Easy' ? 'default' : 'outline'}
                  className={currentRecipe.difficulty === 'Medium' ? 'border-gold text-gold' : ''}
                >
                  {currentRecipe.difficulty}
                </Badge>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green" />
                  <span className="font-semibold text-green-800">
                    Recipe scaled for {guests} {guests === 1 ? 'person' : 'people'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total cost: ₹{(getDishPrice(recipeDialog.dish?.id) * guests).toFixed(2)}
                </p>
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-gold">📦</span>
                  Ingredients
                </h3>
                <div className="bg-white border border-border rounded-lg divide-y">
                  {scaledIngredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-green-50/50 transition-colors">
                      <span className="text-sm font-medium text-foreground capitalize">
                        {ing.item}
                      </span>
                      <span className="text-sm font-semibold text-green">
                        {ing.scaledQty} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking Steps */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-gold">👨‍🍳</span>
                  Instructions
                </h3>
                <div className="space-y-3">
                  {currentRecipe.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
