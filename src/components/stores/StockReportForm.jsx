import { useState } from 'react'
import { Package, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { supabase } from '../../shared/supabase.js'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
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

export default function StockReportForm({ outletId, outletName, open, onOpenChange, onReportSubmitted }) {
  const [selectedItem, setSelectedItem] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedItem || !stockStatus) return

    setSubmitting(true)
    setMessage(null)

    try {
      // Get current user (if authenticated)
      const { data: { user } } = await supabase.auth.getUser()
      
      // Insert stock report
      const { error } = await supabase
        .from('stock_reports')
        .insert({
          outlet_id: outletId,
          item_name: selectedItem,
          status: stockStatus,
          reported_by: user?.id || null
        })
      
      if (error) throw error
      
      setMessage({ 
        type: 'success', 
        text: `Thanks for reporting! ${selectedItem} marked as ${stockStatus.replace('_', ' ')}.` 
      })
      
      // Reset form
      setSelectedItem('')
      setStockStatus('')
      
      // Notify parent component to refresh
      if (onReportSubmitted) {
        onReportSubmitted()
      }
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setMessage(null)
        onOpenChange(false)
      }, 2000)
    } catch (err) {
      console.error('Error submitting stock report:', err)
      setMessage({
        type: 'error',
        text: 'Failed to submit report. Please try again.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedItem('')
    setStockStatus('')
    setMessage(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-green-800">
            <Package className="h-6 w-6 text-gold" />
            Report Stock Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Store Name */}
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-medium text-green-800">{outletName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Help others by reporting item availability
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Item Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Item</label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an essential item" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ESSENTIAL_ITEMS.map((item, idx) => (
                    <SelectItem key={idx} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Status Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Stock Status</label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant={stockStatus === 'in_stock' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setStockStatus('in_stock')}
                  className={`w-full justify-start gap-2 h-auto py-3 ${
                    stockStatus === 'in_stock' ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">In Stock</div>
                    <div className="text-xs opacity-90">Item is available</div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={stockStatus === 'low_stock' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setStockStatus('low_stock')}
                  className={`w-full justify-start gap-2 h-auto py-3 ${
                    stockStatus === 'low_stock' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''
                  }`}
                >
                  <AlertCircle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Low Stock</div>
                    <div className="text-xs opacity-90">Limited quantity available</div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={stockStatus === 'out_of_stock' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setStockStatus('out_of_stock')}
                  className={`w-full justify-start gap-2 h-auto py-3 ${
                    stockStatus === 'out_of_stock' ? 'bg-red-600 hover:bg-red-700' : ''
                  }`}
                >
                  <XCircle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Out of Stock</div>
                    <div className="text-xs opacity-90">Item not available</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={!selectedItem || !stockStatus || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>

            {/* Success/Error Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {message.text}
              </div>
            )}

            {/* Helper Text */}
            <p className="text-xs text-center text-muted-foreground">
              Your report helps the community find available items
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
