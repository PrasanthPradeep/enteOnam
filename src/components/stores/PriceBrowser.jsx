import { useState, useEffect } from 'react'
import { Loader2, Tag } from 'lucide-react'
import { getPriceListTypes, getAllPrices } from '../../shared/api.js'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

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
    getAllPrices(activeType)
      .then(data => setPrices(data))
      .finally(() => setLoading(false))
  }, [activeType])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[5, 1, 2, 3, 4].map(id => (
          <Button
            key={id}
            variant={activeType === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveType(id)}
            className={cn('rounded-full', activeType !== id && 'text-foreground')}
          >
            {TYPE_NAMES[id]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading prices...</span>
        </div>
      ) : prices.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {prices.map((p, i) => (
            <Card key={p.product_id + '-' + i}>
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <span className="text-sm">{p.product_name}</span>
                <span className="text-sm font-semibold text-green whitespace-nowrap">
                  {p.rate != null ? `₹${p.rate}` : 'N/A'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <Tag className="h-5 w-5" />
          <p className="text-sm">No prices found for this month.</p>
        </div>
      )}
    </div>
  )
}
