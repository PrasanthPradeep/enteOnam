import { useState, useEffect } from 'react'
import { Search, IndianRupee, Loader2, ShoppingCart, Package } from 'lucide-react'
import { getPriceListTypes, getAllPrices } from '../../shared/api.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'

const TYPE_NAMES = {
  1: 'Subsidy',
  2: 'Free Sale',
  3: 'Bulk',
  4: 'K Store',
  5: 'Maveli',
}

const TYPE_DESCRIPTIONS = {
  1: 'Government subsidized essential commodities',
  2: 'Open market retail sales',
  3: 'Wholesale bulk purchases',
  4: 'Kerala Store branded products',
  5: 'Special Onam Maveli stores pricing',
}

const TYPE_COLORS = {
  1: 'success',
  2: 'default',
  3: 'secondary',
  4: 'outline',
  5: 'secondary',
}

export default function PricesView() {
  const [types, setTypes] = useState([])
  const [activeType, setActiveType] = useState(5)
  const [prices, setPrices] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [typesLoading, setTypesLoading] = useState(true)

  useEffect(() => {
    getPriceListTypes()
      .then(r => setTypes(r.data || []))
      .finally(() => setTypesLoading(false))
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

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="festival-card">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
            <IndianRupee className="h-8 w-8 text-gold" />
            Supplyco Prices
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading prices...' : `${prices.length} items in current list`}
          </p>
        </div>

        {/* Price Type Tabs */}
        <Card className="festival-card">
          <CardContent className="p-4">
            {typesLoading ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-20 flex-shrink-0" />
                ))}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[5, 1, 2, 3, 4].map(id => (
                  <Button
                    key={id}
                    variant={activeType === id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveType(id)}
                    className="flex-shrink-0 whitespace-nowrap"
                  >
                    {TYPE_NAMES[id]}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Active Type Description */}
            {activeType && !typesLoading && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={TYPE_COLORS[activeType]}>
                    {TYPE_NAMES[activeType]}
                  </Badge>
                  {activeType === 5 && (
                    <Badge variant="secondary" className="text-xs">
                      Onam Special
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {TYPE_DESCRIPTIONS[activeType]}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <Card className="festival-card">
            <CardContent className="text-center py-12">
              {query ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    No products match "{query}" in the current price list
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setQuery('')}
                    className="flex items-center gap-2"
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">No prices available</h3>
                  <p className="text-muted-foreground">
                    Price data for {TYPE_NAMES[activeType]} is not available at the moment
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {query ? `${filtered.length} of ${prices.length} products` : `${prices.length} products`}
              </p>
              <Badge variant="outline" className="text-gold border-gold">
                {TYPE_NAMES[activeType]}
              </Badge>
            </div>

            {/* Product Grid */}
            <div className="grid gap-3">
              {filtered.map((product, index) => (
                <Card key={`${product.product_id}-${index}`} className="festival-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <ShoppingCart className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-green-800 leading-tight">
                              {product.product_name}
                            </h3>
                            {product.unit && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Per {product.unit}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-green-600 flex items-center gap-1">
                          <IndianRupee className="h-4 w-4" />
                          {parseFloat(product.rate).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Show more message if results are limited */}
            {prices.length >= 100 && (
              <Card className="festival-card border-dashed">
                <CardContent className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Showing first 100 items. Use search to find specific products.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
