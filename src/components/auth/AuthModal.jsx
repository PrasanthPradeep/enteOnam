import { useState, useEffect } from 'react'

export default function AuthModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'otp' | 'done'
  const [user, setUser] = useState(null)

  const LOGIN_KEY = 'enteonam_user'

  const requestOtp = () => {
    if (!email) return
    // Simulate OTP sent (real implementation needs a backend)
    setStep('otp')
  }

  const verifyOtp = () => {
    if (!otp) return
    // Any 4-digit OTP works for now (demo only)
    const user = { email, name: email.split('@')[0], loginTime: new Date().toISOString() }
    localStorage.setItem(LOGIN_KEY, JSON.stringify(user))
    setUser(user)
    setStep('done')
  }

  const logout = () => {
    localStorage.removeItem(LOGIN_KEY)
    setUser(null)
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

  return (
    <>
      <button className="btn btn-secondary" style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setOpen(true)}>
        {user ? 'Hi, ' + user.name : 'Sign In'}
      </button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card" style={{ width: 360, maxWidth: '90vw' }}>
            <h3 style={{ marginBottom: 16 }}>Sign In</h3>
            {step === 'email' && (
              <div>
                <div className="form-group">
                  <label>Email address</label>
                  <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <button className="btn btn-primary" onClick={requestOtp} disabled={!email}>Send OTP</button>
              </div>
            )}
            {step === 'otp' && (
              <div>
                <p>OTP sent to <strong>{email}</strong></p>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input className="form-input" value={otp} onChange={e => setOtp(e.target.value)} placeholder="4-digit code" />
                </div>
                <button className="btn btn-primary" onClick={verifyOtp} disabled={!otp}>Verify</button>
              </div>
            )}
            {step === 'done' && (
              <div>
                <p>Signed in as <strong>{user.email}</strong></p>
                <button className="btn btn-outline" onClick={logout}>Sign Out</button>
              </div>
            )}
            <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}