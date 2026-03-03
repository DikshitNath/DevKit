import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import DevKitLogo from '../../components/ui/DevKitLogo'
import axios from 'axios'

// ─── Backend endpoints needed ────────────────────────────────────────
//
// POST /api/auth/forgot-password
//   body: { email }
//   action: generate 6-digit OTP, save hashed OTP + expiry (10min) to user
//           send email with OTP code
//   response: { message: "OTP sent" }
//
// POST /api/auth/verify-otp
//   body: { email, otp }
//   action: hash OTP, find user where hash matches + expiry > now
//           generate short-lived resetToken (e.g. jwt, 10min), clear OTP fields
//   response: { resetToken }
//
// POST /api/auth/reset-password
//   body: { resetToken, newPassword }
//   action: verify resetToken, bcrypt hash newPassword, save, invalidate token
//   response: { message: "Password updated" }
// ─────────────────────────────────────────────────────────────────────

const STEPS = ['email', 'otp', 'password', 'done']

export default function ForgotPassword() {
  const { isDark, theme: t, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const mono = "'IBM Plex Mono', monospace"

  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  const otpRefs = useRef([])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer(v => v - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  // ── Step 1: Send OTP ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email.trim()) return setError('Please enter your email address')
    setError(''); setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { email }, { withCredentials: true })
      setStep('otp')
      setResendTimer(60)
    } catch (err) {
      // Show generic message to prevent enumeration
      setStep('otp')
      setResendTimer(60)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) return setError('Please enter the full 6-digit code')
    setError(''); setLoading(true)
    try {
      const res = await axios.post('/api/auth/verify-otp', { email, otp: code }, { withCredentials: true })
      setResetToken(res.data.resetToken)
      setStep('password')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code. Try again.')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setError(''); setOtp(['', '', '', '', '', ''])
    try {
      await axios.post('/api/auth/forgot-password', { email }, { withCredentials: true })
    } catch {}
    setResendTimer(60)
    otpRefs.current[0]?.focus()
  }

  // ── OTP input handling ────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    setError('')
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
    if (e.key === 'Enter' && otp.join('').length === 6) handleVerifyOtp()
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = [...otp]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // ── Step 3: Reset password ────────────────────────────────────────
  const strength = (() => {
    if (!newPassword) return null
    if (newPassword.length < 6) return { label: 'Too short', color: '#f87171', w: '20%' }
    if (newPassword.length < 8) return { label: 'Weak', color: '#fb923c', w: '40%' }
    const score = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(newPassword)).length
    if (score === 0) return { label: 'Fair', color: '#facc15', w: '55%' }
    if (score === 1) return { label: 'Good', color: '#4ade80', w: '75%' }
    return { label: 'Strong', color: '#4ade80', w: '100%' }
  })()

  const handleResetPassword = async () => {
    if (!newPassword) return setError('Please enter a new password')
    if (newPassword.length < 6) return setError('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return setError('Passwords do not match')
    setError(''); setLoading(true)
    try {
      await axios.post('/api/auth/reset-password', { resetToken, newPassword }, { withCredentials: true })
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please start over.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step indicator ────────────────────────────────────────────────
  const stepIndex = STEPS.indexOf(step)
  const stepLabels = ['Email', 'Verify', 'Password']

  return (
    <div style={{ minHeight: '100vh', background: t.page, color: t.text, fontFamily: "'Syne', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', transition: 'background 0.3s, color 0.3s' }}>

      {/* Dot grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `radial-gradient(circle, ${t.dot} 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: 0.55, pointerEvents: 'none', zIndex: 0 }} />
      {isDark && <>
        <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-20%', left: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', cursor: 'pointer', width: 'fit-content' }}>
          <DevKitLogo size={32} />
          <span style={{ fontSize: '17px', fontWeight: '700', color: t.text }}>DevKit</span>
        </div>

        {/* Step indicator — hidden on done */}
        {step !== 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '28px' }}>
            {stepLabels.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < stepLabels.length - 1 ? 1 : 'unset' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700', fontFamily: mono,
                    background: i < stepIndex ? '#4f46e5' : i === stepIndex ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : t.input,
                    border: `1px solid ${i <= stepIndex ? '#4f46e5' : t.border}`,
                    color: i <= stepIndex ? '#fff' : t.textFaint,
                    transition: 'all 0.3s',
                    boxShadow: i === stepIndex ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                  }}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '10px', color: i === stepIndex ? '#a78bfa' : t.textFaint, fontFamily: mono, whiteSpace: 'nowrap' }}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div style={{ flex: 1, height: '1px', background: i < stepIndex ? '#4f46e5' : t.border, margin: '0 6px', marginBottom: '18px', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '36px 32px', transition: 'background 0.3s, border-color 0.3s' }}>

          {/* ── STEP 1: Email ── */}
          {step === 'email' && (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isDark ? '#4f46e511' : '#4f46e508', border: '1px solid #4f46e533', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '20px' }}>🔑</div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: t.text, margin: '0 0 8px' }}>Forgot your password?</h1>
              <p style={{ fontSize: '13px', color: t.textMuted, margin: '0 0 28px', lineHeight: '1.6' }}>
                Enter your email and we'll send you a 6-digit code to reset your password.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: t.textMuted, letterSpacing: '0.3px' }}>Email address</label>
                <input
                  type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  placeholder="you@example.com" autoFocus
                  style={{ background: t.input, border: `1px solid ${error ? '#ef444466' : t.border}`, borderRadius: '9px', color: t.text, fontSize: '13px', padding: '11px 14px', outline: 'none', fontFamily: 'inherit' }}
                />
                {error && <span style={{ fontSize: '11px', color: '#f87171', fontFamily: mono }}>{error}</span>}
              </div>

              <button onClick={handleSendOtp} disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: '9px', padding: '12px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.8 : 1, boxShadow: '0 0 24px rgba(99,102,241,0.25)', marginBottom: '16px' }}>
                {loading ? 'Sending code...' : 'Send Code'}
              </button>
              <button onClick={() => navigate('/login')} style={{ width: '100%', background: 'transparent', border: 'none', color: t.textMuted, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', padding: '4px' }}>
                ← Back to login
              </button>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isDark ? '#06b6d411' : '#06b6d408', border: '1px solid #06b6d433', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '20px' }}>✉️</div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: t.text, margin: '0 0 8px' }}>Check your email</h1>
              <p style={{ fontSize: '13px', color: t.textMuted, margin: '0 0 4px', lineHeight: '1.6' }}>
                We sent a 6-digit code to
              </p>
              <p style={{ fontSize: '13px', color: t.text, fontFamily: mono, margin: '0 0 28px' }}>{email}</p>

              {/* OTP boxes */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    style={{
                      width: '46px', height: '54px', borderRadius: '10px', textAlign: 'center',
                      background: t.input,
                      border: `1px solid ${error ? '#ef444466' : digit ? '#4f46e566' : t.border}`,
                      color: t.text, fontSize: '20px', fontWeight: '700', fontFamily: mono,
                      outline: 'none', transition: 'border-color 0.2s',
                      boxShadow: digit ? '0 0 8px rgba(99,102,241,0.15)' : 'none',
                    }}
                  />
                ))}
              </div>

              {error && (
                <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: '8px', padding: '9px 14px', fontSize: '12px', color: '#f87171', fontFamily: mono, marginBottom: '16px', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <button onClick={handleVerifyOtp} disabled={loading || otp.join('').length < 6} style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: '9px', padding: '12px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: (loading || otp.join('').length < 6) ? 0.6 : 1, boxShadow: '0 0 24px rgba(99,102,241,0.25)', marginBottom: '16px' }}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => { setStep('email'); setOtp(['','','','','','']); setError('') }} style={{ background: 'transparent', border: 'none', color: t.textMuted, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  ← Change email
                </button>
                <button onClick={handleResend} disabled={resendTimer > 0} style={{ background: 'transparent', border: 'none', color: resendTimer > 0 ? t.textFaint : '#a78bfa', fontSize: '12px', cursor: resendTimer > 0 ? 'default' : 'pointer', fontFamily: mono, padding: 0 }}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: New password ── */}
          {step === 'password' && (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isDark ? '#22c55e11' : '#22c55e08', border: '1px solid #22c55e33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '20px' }}>🔒</div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: t.text, margin: '0 0 8px' }}>Set new password</h1>
              <p style={{ fontSize: '13px', color: t.textMuted, margin: '0 0 28px', lineHeight: '1.6' }}>
                Choose a strong password for your account.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>

                {/* New password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: t.textMuted, letterSpacing: '0.3px' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'} value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setError('') }}
                      placeholder="••••••••" autoFocus
                      style={{ width: '100%', background: t.input, border: `1px solid ${t.border}`, borderRadius: '9px', color: t.text, fontSize: '13px', padding: '11px 40px 11px 14px', outline: 'none', fontFamily: 'inherit' }}
                    />
                    <button onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, fontSize: '14px', padding: 0, lineHeight: 1 }}>
                      {showNew ? '🙈' : '👁'}
                    </button>
                  </div>
                  {strength && (
                    <div>
                      <div style={{ height: '3px', background: t.border, borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: strength.w, background: strength.color, borderRadius: '2px', transition: 'width 0.3s, background 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '10px', color: strength.color, fontFamily: mono, display: 'block', marginTop: '3px' }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: t.textMuted, letterSpacing: '0.3px' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                      placeholder="••••••••"
                      style={{ width: '100%', background: t.input, border: `1px solid ${confirmPassword && confirmPassword === newPassword ? '#22c55e66' : t.border}`, borderRadius: '9px', color: t.text, fontSize: '13px', padding: '11px 40px 11px 14px', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                    />
                    <button onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, fontSize: '14px', padding: 0, lineHeight: 1 }}>
                      {showConfirm ? '🙈' : '👁'}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword === newPassword && (
                    <span style={{ fontSize: '10px', color: '#4ade80', fontFamily: mono }}>✓ Passwords match</span>
                  )}
                </div>
              </div>

              {error && (
                <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#f87171', fontFamily: mono, marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <button onClick={handleResetPassword} disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: '9px', padding: '12px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.8 : 1, boxShadow: '0 0 24px rgba(99,102,241,0.25)' }}>
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#22c55e11', border: '1px solid #22c55e44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px', boxShadow: '0 0 20px rgba(34,197,94,0.15)' }}>
                ✅
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: t.text, margin: '0 0 10px' }}>Password updated!</h2>
              <p style={{ fontSize: '13px', color: t.textMuted, margin: '0 0 28px', lineHeight: '1.6' }}>
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: '600', padding: '12px 32px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 24px rgba(99,102,241,0.25)' }}>
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>

      <button onClick={toggleTheme} style={{ position: 'fixed', bottom: '28px', right: '28px', width: '44px', height: '44px', borderRadius: '50%', background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, boxShadow: t.toggleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 999, fontSize: '19px', backdropFilter: 'blur(8px)' }}>
        {isDark ? '☀️' : '🌙'}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: ${t.textFaint}; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.05)} }
      `}</style>
    </div>
  )
}