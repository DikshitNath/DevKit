import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../utils/authService'

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

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const navigate = useNavigate()
  const t = isDark ? darkTheme : lightTheme

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await register(username, email, password)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Password strength
  const strength = (() => {
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const isDisabled = loading || !username || !email || !password

  const inputStyle = {
    ...styles.input,
    background: isDark ? 'rgba(255,255,255,0.03)' : '#f4f4fc',
    borderColor: t.border,
    color: t.text,
  }

  const handleFocus = e => {
    e.target.style.borderColor = '#6366f1'
    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
  }
  const handleBlur = (e, borderColor) => {
    e.target.style.borderColor = borderColor
    e.target.style.boxShadow = 'none'
  }

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
          <button onClick={() => navigate('/login')} style={{ ...styles.navBtn, color: t.textMuted }}>
            Sign in
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
            Developer Toolkit — Create Account
          </div>

          {/* Heading */}
          <h1 style={{ ...styles.heading, color: t.text }}>
            Start building<br />
            <span style={styles.headingAccent}>faster today.</span>
          </h1>
          <p style={{ ...styles.sub, color: t.textMuted }}>
            Join DevKit and access all developer tools.
          </p>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>{error}</div>
          )}

          {/* Fields */}
          <div style={styles.form}>
            <div style={styles.field}>
              <label style={{ ...styles.label, color: t.textMuted }}>Username</label>
              <div style={styles.inputWrap}>
                <svg style={{ ...styles.inputIcon, color: t.textFaint }} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="10" cy="7" r="3.5" />
                  <path d="M2.5 17c0-3.314 3.358-6 7.5-6s7.5 2.686 7.5 6" strokeLinecap="round" />
                </svg>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="johndoe"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={e => handleBlur(e, t.border)}
                />
              </div>
            </div>

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
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={e => handleBlur(e, t.border)}
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
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={e => handleBlur(e, t.border)}
                />
              </div>
              {/* Password strength — same style as tool tags */}
              {password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        height: '3px', flex: 1, borderRadius: '2px',
                        background: i <= strength ? strengthColors[strength] : t.border,
                        transition: 'background 0.3s ease',
                      }} />
                    ))}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: strengthColors[strength],
                    minWidth: '32px',
                  }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
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
              {loading ? 'Creating account...' : <>Create Account <span>→</span></>}
            </button>
          </div>

          {/* Footer */}
          <p style={{ ...styles.foot, color: t.textFaint }}>
            Already have an account?{' '}
            <Link to="/login" style={styles.footLink}>Sign in</Link>
          </p>

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
        input::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'} !important; }
      `}</style>
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
    left: '-10%',
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
    right: '-10%',
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
    transition: 'opacity 0.2s ease',
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
}