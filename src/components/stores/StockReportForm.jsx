import { Info, Lock } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

export default function StockReportForm({ outletId }) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gold-100">
          <Lock className="h-4 w-4 text-gold-800" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground">Report Stock</h4>
          <p className="text-xs text-muted-foreground">
            Stock reporting requires sign-in. Coming soon.
          </p>
        </div>
        <Info className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
      </CardContent>
    </Card>
  )
}
