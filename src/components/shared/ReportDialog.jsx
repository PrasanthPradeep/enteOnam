import { useState } from 'react'
import { Flag, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../../shared/supabase.js'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const ISSUE_TYPES = {
  coordinates: 'Wrong Location/Coordinates',
  price: 'Incorrect Price',
  stock: 'Stock Information Wrong',
  closed: 'Store Closed/Not Found',
  contact: 'Wrong Contact Information',
  other: 'Other Issue',
}

export default function ReportDialog({ 
  type = 'outlet', // 'outlet', 'price', or 'general'
  outletId = null,
  outletName = null,
  priceId = null,
  productName = null,
  triggerVariant = 'ghost',
  triggerSize = 'sm',
  triggerText = 'Report Issue',
  showIcon = true,
}) {
  const [open, setOpen] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!issueType || !description.trim()) {
      setError('Please select an issue type and provide a description')
      return
    }

    // Check if Supabase is configured
    if (!supabase) {
      setError('Report feature is not configured. Please contact the administrator.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const reportData = {
        type,
        issue_type: issueType,
        description: description.trim(),
        contact_email: contactEmail.trim() || null,
        outlet_id: outletId,
        outlet_name: outletName,
        price_id: priceId,
        product_name: productName,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase
        .from('reports')
        .insert([reportData])

      if (insertError) throw insertError

      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setTimeout(() => {
          // Reset form after dialog closes
          setSubmitted(false)
          setIssueType('')
          setDescription('')
          setContactEmail('')
        }, 300)
      }, 2000)
    } catch (err) {
      console.error('Report submission error:', err)
      setError('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className="flex items-center gap-2"
        >
          {showIcon && <Flag className="h-4 w-4" />}
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Report Submitted
            </h3>
            <p className="text-sm text-muted-foreground">
              Thank you for helping us improve!
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-gold" />
                Report an Issue
              </DialogTitle>
              <DialogDescription>
                {outletName && (
                  <span className="block font-medium text-green-800 mt-1">
                    {outletName}
                  </span>
                )}
                {productName && (
                  <span className="block font-medium text-green-800 mt-1">
                    {productName}
                  </span>
                )}
                Help us improve by reporting incorrect information
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="issue-type">Issue Type *</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger id="issue-type">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ISSUE_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  className="w-full min-h-24 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email (Optional)</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  We'll only use this to follow up on your report
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-md text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitting || !issueType || !description.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
