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
    <div style={{ ...styles.page, background: t.page, color: t.text }}>

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
      <main style={{
        ...styles.main,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
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
              <label style={{ ...styles.label, color: t.textMuted }}>Password</label>
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

          {/* Terminal — same as homepage */}
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
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Syne', sans-serif",
    transition: 'background 0.3s ease, color 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  dotGrid: {
    position: 'fixed',
    inset: 0,
    backgroundSize: '28px 28px',
    opacity: 0.6,
    pointerEvents: 'none',
    transition: 'background-image 0.3s ease',
  },
  orb1: {
    position: 'fixed',
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
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    position: 'relative',
    zIndex: 10,
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    border: '1px solid',
    borderRadius: '14px',
    padding: '40px',
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
    marginBottom: '24px',
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
    fontSize: '36px',
    fontWeight: '800',
    lineHeight: '1.15',
    marginBottom: '10px',
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
    marginBottom: '28px',
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
    marginTop: '24px',
    fontSize: '13px',
    textAlign: 'center',
  },
  footLink: {
    color: '#a78bfa',
    textDecoration: 'none',
    fontWeight: '600',
  },
  terminal: {
    marginTop: '28px',
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
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
}