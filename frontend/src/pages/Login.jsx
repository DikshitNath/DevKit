import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../utils/authService'
import { useAuth } from '../context/AuthContext'

const darkTheme = {
  page: '#080810',
  nav: 'rgba(8,8,16,0.8)',
  card: '#0c0c18',
  cardHover: '#10101e',
  border: '#1e1e30',
  text: '#e2e2f0',
  textMuted: '#4a4a7a',
  textFaint: '#2a2a45',
  dot: '#1e1e35',
  terminal: '#0c0c18',
  terminalHeader: '#0a0a14',
  toggleBg: '#16162a',
  toggleBorder: '#2a2a45',
  toggleShadow: '0 4px 20px rgba(0,0,0,0.4)',
}

const lightTheme = {
  page: '#f0f0f8',
  nav: 'rgba(240,240,248,0.9)',
  card: '#ffffff',
  cardHover: '#f8f8fc',
  border: '#e0e0ee',
  text: '#1a1a2e',
  textMuted: '#666688',
  textFaint: '#aaaacc',
  dot: '#d8d8ee',
  terminal: '#ffffff',
  terminalHeader: '#f4f4fc',
  toggleBg: '#ffffff',
  toggleBorder: '#e0e0ee',
  toggleShadow: '0 4px 20px rgba(0,0,0,0.1)',
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const t = isDark ? darkTheme : lightTheme

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await login(email, password)
      setUser(data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || !email || !password

  return (
    <div style={{ ...styles.page, background: t.page, color: t.text, height: '100vh', overflow: 'hidden' }}>

      {/* Dot grid */}
      <div style={{
        ...styles.dotGrid,
        backgroundImage: `radial-gradient(circle, ${t.dot} 1px, transparent 1px)`,
      }} />

      {/* Glow orbs - dark only */}
      {isDark && (
        <>
          <div style={styles.orb1} />
          <div style={styles.orb2} />
        </>
      )}

      {/* Navbar */}
      <nav style={{ ...styles.nav, background: t.nav, borderColor: t.border }}>
        <Link to="/" style={{ ...styles.navLogo, textDecoration: 'none' }}>
          <div style={styles.navLogoIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8 6L3 12L8 18M16 6L21 12L16 18" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ ...styles.navLogoText, color: t.text }}>DevKit</span>
        </Link>

        <div style={styles.navRight}>
          <button onClick={() => navigate('/register')} style={{ ...styles.navBtn, color: t.textMuted }}>
            Register
          </button>
        </div>
      </nav>

      {/* Auth Card */}
      <main
        style={{
          ...styles.main,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div style={{ ...styles.card, background: t.card, borderColor: t.border }}>

          {/* Badge */}
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            Developer Toolkit — Sign In
          </div>

          {/* Heading */}
          <h1 style={{ ...styles.heading, color: t.text }}>
            Welcome back,<br />
            <span style={styles.headingAccent}>developer.</span>
          </h1>
          <p style={{ ...styles.sub, color: t.textMuted }}>
            Sign in to access your tools.
          </p>

          {/* Google OAuth Button */}
          <a
            href="/api/auth/google"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
              border: `1px solid ${t.border}`,
              borderRadius: '8px',
              color: t.text,
              fontSize: '13px',
              fontWeight: '500',
              padding: '11px 14px',
              textDecoration: 'none',
              fontFamily: "'Syne', sans-serif",
              marginBottom: '14px',
              boxSizing: 'border-box',
              transition: 'background 0.2s ease',
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', background: t.border }} />
            <span style={{ fontSize: '11px', color: t.textFaint, fontFamily: "'IBM Plex Mono', monospace" }}>or continue with email</span>
            <div style={{ flex: 1, height: '1px', background: t.border }} />
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>{error}</div>
          )}

          {/* Fields */}
          <div style={styles.form}>
            <div style={styles.field}>
              <label style={{ ...styles.label, color: t.textMuted }}>Email</label>
              <div style={styles.inputWrap}>
                <svg style={{ ...styles.inputIcon, color: t.textFaint }} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M2.5 5.5A1.5 1.5 0 014 4h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5v-9z" />
                  <path d="M2.5 6l7.5 5 7.5-5" strokeLinecap="round" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{
                    ...styles.input,
                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f4f4fc',
                    borderColor: t.border,
                    color: t.text,
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#6366f1'
                    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = t.border
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ ...styles.label, color: t.textMuted }}>Password</label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '11px',
                    color: '#6366f1',
                    textDecoration: 'none',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: '500',
                  }}>
                  Forgot password?
                </Link>
              </div>
              <div style={styles.inputWrap}>
                <svg style={{ ...styles.inputIcon, color: t.textFaint }} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="3" y="9" width="14" height="9" rx="1.5" />
                  <path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" strokeLinecap="round" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{
                    ...styles.input,
                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f4f4fc',
                    borderColor: t.border,
                    color: t.text,
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#6366f1'
                    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = t.border
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              style={{
                ...styles.btn,
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : <>Sign In <span>→</span></>}
            </button>
          </div>

          {/* Footer */}
          <p style={{ ...styles.foot, color: t.textFaint }}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.footLink}>Register</Link>
          </p>

          {/* Terminal */}
          <div style={{ ...styles.terminal, background: t.terminal, borderColor: t.border }}>
            <div style={{ ...styles.terminalHeader, background: t.terminalHeader, borderColor: t.border }}>
              <span style={{ ...styles.terminalDot, background: '#ef4444' }} />
              <span style={{ ...styles.terminalDot, background: '#f59e0b' }} />
              <span style={{ ...styles.terminalDot, background: '#22c55e' }} />
              <span style={{ ...styles.terminalTitle, color: t.textFaint }}>devkit ~ auth</span>
            </div>
            <div style={styles.terminalBody}>
              <TerminalLine delay={0} color="#6366f1">POST /api/auth/login</TerminalLine>
              <TerminalLine delay={300} color={t.textMuted}>{"{ email, password }"}</TerminalLine>
              <TerminalLine delay={700} color="#22c55e">✓ 200 OK — authenticated</TerminalLine>
              <TerminalLine delay={1000} color="#f59e0b">✦ JWT token set in cookie</TerminalLine>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Theme Toggle */}
      <button
        onClick={() => setIsDark(d => !d)}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: t.toggleBg,
          border: `1px solid ${t.toggleBorder}`,
          boxShadow: `${t.toggleShadow}, 0 0 0 1px ${t.toggleBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          fontSize: '20px',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(8px)',
        }}>
        {isDark ? '☀️' : '🌙'}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.05)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'} !important; }
      `}</style>
    </div>
  )
}

function TerminalLine({ children, delay, color }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay + 800)
    return () => clearTimeout(timer)
  }, [delay])
  return (
    <div style={{
      fontSize: '12px',
      fontFamily: "'IBM Plex Mono', monospace",
      color: color || '#888',
      padding: '2px 0',
      opacity: show ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}>
      {children}
    </div>
  )
}

const styles = {
  page: {
    height: '100vh',
    position: 'relative',
    fontFamily: "'Syne', sans-serif",
    transition: 'background 0.3s ease, color 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  dotGrid: {
    position: 'fixed',   // fixed so it covers the whole viewport without adding scroll height
    inset: 0,
    backgroundSize: '28px 28px',
    opacity: 0.6,
    pointerEvents: 'none',
    transition: 'background-image 0.3s ease',
  },
  orb1: {
    position: 'fixed',   // fixed so orbs don't add to scroll height
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'pulse 8s ease-in-out infinite',
  },
  orb2: {
    position: 'fixed',
    bottom: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'pulse 10s ease-in-out infinite 2s',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 48px',
    borderBottom: '1px solid',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    transition: 'background 0.3s ease, border-color 0.3s ease',
    flexShrink: 0,  // prevent nav from shrinking
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navLogoIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogoText: {
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '13px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  main: {
    // Use padding-based centering instead of flex centering
    // This way content scrolls naturally rather than being clipped
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '32px 24px 80px',
    position: 'relative',
    zIndex: 10,
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    border: '1px solid',
    borderRadius: '14px',
    padding: '28px 36px 32px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    transition: 'background 0.3s ease, border-color 0.3s ease',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#4f46e511',
    border: '1px solid #4f46e533',
    borderRadius: '20px',
    color: '#a78bfa',
    fontSize: '12px',
    padding: '5px 14px',
    marginBottom: '14px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#a78bfa',
    animation: 'blink 2s ease-in-out infinite',
    flexShrink: 0,
  },
  heading: {
    fontSize: '31px',
    fontWeight: '800',
    lineHeight: '1.15',
    marginBottom: '6px',
    letterSpacing: '-0.5px',
  },
  headingAccent: {
    background: 'linear-gradient(135deg, #6366f1, #a78bfa, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  sub: {
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '18px',
  },
  errorBox: {
    background: '#ef444411',
    border: '1px solid #ef444433',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f87171',
    fontSize: '13px',
    marginBottom: '16px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '15px',
    height: '15px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 40px',
    border: '1px solid',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: "'IBM Plex Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '13px 24px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'inherit',
    boxShadow: '0 0 30px rgba(79,70,229,0.3)',
    marginTop: '4px',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  },
  foot: {
    marginTop: '16px',
    fontSize: '13px',
    textAlign: 'center',
  },
  footLink: {
    color: '#a78bfa',
    textDecoration: 'none',
    fontWeight: '600',
  },
  terminal: {
    marginTop: '18px',
    border: '1px solid',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    transition: 'background 0.3s ease, border-color 0.3s ease',
  },
  terminalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    borderBottom: '1px solid',
    transition: 'background 0.3s ease',
  },
  terminalDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  terminalTitle: {
    fontSize: '11px',
    marginLeft: '8px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  terminalBody: {
    padding: '12px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
}