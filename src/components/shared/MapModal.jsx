import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { ExternalLink } from 'lucide-react'

export default function MapModal({ open, onOpenChange, name, query, lat, lng }) {
  const embedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(query) + '&output=embed'
  const isCoords = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(query || '')
  const fullUrl = isCoords
    // Exact location view - avoids the Maps app resolving to a place name
    ? 'https://www.google.com/maps/@' + query + ',16z'
    : query
      ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query)
      : 'https://www.google.com/maps?q=' + lat + ',' + lng

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-green-800">
            {name}
          </DialogTitle>
          <DialogDescription>
            Viewing location on Google Maps
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-4 space-y-2">
          <iframe
            title="Google Maps location"
            src={embedUrl}
            className="w-full h-[50vh] min-h-[320px] rounded-lg border border-border"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-green-700 hover:underline w-fit"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Google Maps
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}