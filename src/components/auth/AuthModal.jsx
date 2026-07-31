import { useState, useEffect } from 'react'
import { User, Mail, Shield, CheckCircle, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog'
import { Badge } from '../ui/badge'

export default function AuthModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'otp' | 'done'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const LOGIN_KEY = 'enteonam_user'

  const requestOtp = async () => {
    if (!email) return
    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate OTP sent (real implementation needs a backend)
    setStep('otp')
    setLoading(false)
  }

  const verifyOtp = async () => {
    if (!otp) return
    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Any 4-digit OTP works for now (demo only)
    if (otp.length === 4) {
      const user = { 
        email, 
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1), 
        loginTime: new Date().toISOString() 
      }
      localStorage.setItem(LOGIN_KEY, JSON.stringify(user))
      setUser(user)
      setStep('done')
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem(LOGIN_KEY)
    setUser(null)
    setStep('email')
    setEmail('')
    setOtp('')
    setOpen(false)
  }

  const resetFlow = () => {
    setStep('email')
    setEmail('')
    setOtp('')
  }

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(LOGIN_KEY))
      if (parsed) setUser(parsed)
    } catch {}
  }, [])

  const formatLoginTime = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={user ? "outline" : "secondary"} 
          size="sm" 
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          {user ? `Hi, ${user.name}` : 'Sign In'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green" />
            {step === 'done' ? 'Account' : 'Sign In to EnteOnam'}
          </DialogTitle>
          <DialogDescription>
            {step === 'email' && 'Enter your email to receive a verification code'}
            {step === 'otp' && 'We sent a 4-digit code to your email'}
            {step === 'done' && 'You are signed in and can access all features'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'email' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                    disabled={loading}
                    onKeyDown={e => e.key === 'Enter' && requestOtp()}
                  />
                </div>
              </div>
              
              <Button 
                onClick={requestOtp} 
                disabled={!email || loading} 
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                For demo purposes, any 4-digit code will work after sending OTP
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Code sent to <strong>{email}</strong></span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter 4-digit code"
                  className="text-center text-lg tracking-widest"
                  disabled={loading}
                  onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={verifyOtp} 
                  disabled={otp.length !== 4 || loading} 
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetFlow}
                  disabled={loading}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {step === 'done' && user && (
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Welcome back!</h3>
                  <p className="text-sm text-muted-foreground">
                    Signed in as <strong>{user.email}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Status</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last signed in</span>
                  <span className="text-sm">{formatLoginTime(user.loginTime)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={logout} 
                  className="flex-1 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
                <Button 
                  onClick={() => setOpen(false)} 
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}