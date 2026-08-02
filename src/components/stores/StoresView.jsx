import { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Store, 
  MapPin, 
  Phone, 
  Navigation, 
  Search, 
  ChevronDown, 
  Loader2,
  ExternalLink,
  X,
  Package,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { getAllOutlets } from '../../shared/api.js'
import { haversine } from '../../shared/utils.js'
import { supabase } from '../../shared/supabase.js'
import StockReportForm from './StockReportForm.jsx'
import ReportDialog from '../shared/ReportDialog.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'

const ESSENTIAL_ITEMS = [
  'Matta Rice Unda',
  'Jaya Rice',
  'Raw Rice',
  'Toordhal (Thuvara Parippu)',
  'Green Gram Dhall (Cherupayar Parippu)',
  'Bengal Gram Bold (Kadala)',
  'Black Gram (Uzhunnu)',
  'Coconut Oil',
  'Chilli Powder',
  'Turmeric Powder',
  'Coriander Powder',
  'Mustard Seeds',
  'Cumin Seeds',
  'Sugar',
  'Salt',
  'Sambar Powder',
  'Rasam Powder',
  'Tea (Sabari varieties)',
  'Wheat Atta',
  'Puttupodi',
]

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
    return (
      <div className="h-44 bg-muted rounded-md flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No coordinates available</p>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-44 rounded-md mt-4" />
}

function EssentialItemsStock({ outletId, stockReports }) {
  const getStockIcon = (status) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'low_stock':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'out_of_stock':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-600" /> // Default to in stock
    }
  }

  const getStockBadge = (status) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-700 border-green-300">In Stock</Badge>
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Low Stock</Badge>
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Out of Stock</Badge>
      default:
        return <Badge className="bg-green-100 text-green-700 border-green-300">In Stock</Badge> // Default to in stock
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
          <Package className="h-4 w-4 text-gold" />
          Essential Items Availability
        </h4>
        <Badge variant="outline" className="text-xs">
          {ESSENTIAL_ITEMS.length} items
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {ESSENTIAL_ITEMS.map((item, idx) => {
          // Get reported status or default to 'in_stock'
          const status = stockReports?.[item]?.status || 'in_stock'
          return (
            <div 
              key={idx}
              className="flex items-center justify-between p-2 rounded-md border border-border hover:bg-green-50/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getStockIcon(status)}
                <span className="text-sm text-foreground truncate">{item}</span>
              </div>
              <div className="ml-2">
                {getStockBadge(status)}
              </div>
            </div>
          )
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Stock information is crowdsourced - help keep it updated by reporting availability below.
      </p>
    </div>
  )
}

export default function StoresView() {
  const [outlets, setOutlets] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [depot, setDepot] = useState('')
  const [userLoc, setUserLoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [stockReports, setStockReports] = useState({}) // Store latest stock reports for selected outlet
  const [stockReportDialog, setStockReportDialog] = useState({ open: false, outlet: null })

  useEffect(() => {
    getAllOutlets()
      .then(data => setOutlets(data))
      .finally(() => setLoading(false))
  }, [])

  // Fetch stock reports when outlet is selected
  useEffect(() => {
    if (!selected?.outlet_id) {
      setStockReports({})
      return
    }
    
    const fetchStockReports = async () => {
      try {
        const { data, error } = await supabase
          .from('stock_reports')
          .select('item_name, status, reported_at')
          .eq('outlet_id', selected.outlet_id)
          .order('reported_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching stock reports:', error)
          return
        }
        
        // Get most recent report for each item
        const latestReports = {}
        if (data) {
          data.forEach(report => {
            if (!latestReports[report.item_name]) {
              latestReports[report.item_name] = report
            }
          })
        }
        
        setStockReports(latestReports)
      } catch (err) {
        console.error('Error fetching stock reports:', err)
      }
    }
    
    fetchStockReports()
  }, [selected?.outlet_id])

  // Callback to refresh stock reports after submission
  const handleStockReportSubmitted = () => {
    if (selected?.outlet_id) {
      // Trigger a refresh by setting selected again
      setSelected({ ...selected })
    }
  }

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
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setUserLoc(null)
        setLocating(false)
      }
    )
  }

  const clearFilters = () => {
    setDistrict('')
    setDepot('')
    setQuery('')
    setUserLoc(null)
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

  const activeFiltersCount = [district, depot, query, userLoc].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
              <Store className="h-8 w-8 text-gold" />
              Supplyco Stores
            </h1>
            <p className="text-muted-foreground mt-1">
              {loading ? 'Loading stores...' : `${outlets.length} outlets across Kerala`}
            </p>
          </div>
          <Button asChild variant="secondary" className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <a
              href="https://www.google.com/maps/search/supermarkets+near+me/"
              target="_blank"
              rel="noopener noreferrer"
              className="button-link flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Other Local Stores Near You
            </a>
          </Button>
        </div>

        {/* Filters */}
        <Card className="festival-card">
          <CardContent className="p-6">
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or address..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* District and Depot Selects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={district} onValueChange={value => {
                    setDistrict(value)
                    setDepot('')
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Districts</SelectItem>
                      {districts.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={depot} onValueChange={setDepot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Depot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Depots</SelectItem>
                      {depots.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={locate}
                    disabled={locating}
                    className="flex items-center gap-2"
                  >
                    {locating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Locating...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4" />
                        {userLoc ? `Nearby (${Math.round(filtered[0]?._dist || 0)}km away)` : 'Find Nearby'}
                      </>
                    )}
                  </Button>
                  
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <Card className="festival-card">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-green" />
                <span className="text-lg">Loading stores...</span>
              </div>
            </CardContent>
          </Card>
        ) : !district && !userLoc && !query ? (
          <Card className="festival-card">
            <CardContent className="text-center py-12">
              <Store className="h-12 w-12 text-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Find Supplyco Stores</h3>
              <p className="text-muted-foreground mb-4">
                Select a district, search by name, or find nearby stores to get started
              </p>
              <Button asChild variant="secondary" className="flex items-center gap-2">
                <a
                  href="https://www.google.com/maps/search/supermarkets+near+me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-link flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Find Other Local Stores Near You
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="festival-card">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">No stores found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} {filtered.length === 1 ? 'store' : 'stores'}
              {userLoc && ', sorted by distance'}
            </p>
            
            {filtered.map(outlet => (
              <Card key={outlet.outlet_id} className="festival-card hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Store className="h-5 w-5 text-green" />
                        {outlet.name}
                        <Badge variant={outlet.status ? "success" : "error"}>
                          {outlet.status ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {outlet.address1}, {outlet.district_name}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {outlet._dist != null && (
                        <Badge variant="outline" className="text-gold border-gold">
                          {Math.round(outlet._dist)}km away
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(selected?.outlet_id === outlet.outlet_id ? null : outlet)}
                        className="flex items-center gap-1"
                      >
                        {selected?.outlet_id === outlet.outlet_id ? 'Less' : 'More'}
                        <ChevronDown className={`h-4 w-4 transition-transform ${
                          selected?.outlet_id === outlet.outlet_id ? 'rotate-180' : ''
                        }`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {selected?.outlet_id === outlet.outlet_id && (
                  <CardContent className="pt-0 border-t">
                    <div className="space-y-4">
                      {/* Detailed Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{selected.address1}</span>
                          </div>
                          {selected.address2 && (
                            <div className="text-sm text-muted-foreground ml-6">
                              {selected.address2}
                            </div>
                          )}
                          {selected.address3 && (
                            <div className="text-sm text-muted-foreground ml-6">
                              {selected.address3}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {selected.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{selected.phone}</span>
                            </div>
                          )}
                          {selected.depot && (
                            <div className="text-sm">
                              <span className="font-medium">Depot:</span> {selected.depot}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Map */}
                      <OutletMap outlet={selected} />

                      {/* Get Directions Button - Below Map */}
                      {selected.latitude && selected.longitude && (
                        <Button asChild variant="default" className="w-full">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <Navigation className="h-4 w-4" />
                            Get Directions
                          </a>
                        </Button>
                      )}

                      {/* Essential Items Stock Status */}
                      <div className="pt-4">
                        <EssentialItemsStock 
                          outletId={selected.outlet_id}
                          stockReports={stockReports}
                        />
                      </div>

                      {/* Other Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="secondary"
                          onClick={() => setStockReportDialog({ open: true, outlet: selected })}
                          className="flex items-center gap-2"
                        >
                          <Package className="h-4 w-4" />
                          Report Stock
                        </Button>
                        <ReportDialog
                          type="outlet"
                          outletId={selected.outlet_id}
                          outletName={selected.name}
                          triggerVariant="outline"
                          triggerText="Report Issue"
                        />
                        <Button 
                          variant="ghost" 
                          onClick={() => setSelected(null)}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Close
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Stock Report Dialog */}
      {stockReportDialog.outlet && (
        <StockReportForm 
          outletId={stockReportDialog.outlet.outlet_id}
          outletName={stockReportDialog.outlet.name}
          open={stockReportDialog.open}
          onOpenChange={(open) => setStockReportDialog({ open, outlet: open ? stockReportDialog.outlet : null })}
          onReportSubmitted={handleStockReportSubmitted}
        />
      )}
    </div>
  )
}
