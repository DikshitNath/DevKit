import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

const TOOLS = [
  {
    id: 'api',
    path: '/test-api',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M8 6L3 12L8 18M16 6L21 12L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    name: 'API Tester',
    desc: 'Test REST APIs with headers, auth, cookies and AI-powered response explanations.',
    tags: ['REST', 'Headers', 'Auth', 'AI'],
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    id: 'snippets',
    path: '/snippets',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    name: 'Snippet Manager',
    desc: 'Save, organize and share code snippets with Monaco editor and AI code generation.',
    tags: ['Monaco', 'Tags', 'Share', 'AI'],
    color: '#10b981',
    glow: 'rgba(16,185,129,0.15)',
  },
  {
    id: 'json',
    path: '/json',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 6C4 4.89543 4.89543 4 6 4H8C8 4 9 4 9 5V7C9 7.55228 8.55228 8 8 8H6C4.89543 8 4 8.89543 4 10V14C4 15.1046 4.89543 16 6 16H8C8.55228 16 9 16.4477 9 17V19C9 20 8 20 8 20H6C4.89543 20 4 19.1046 4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 6C20 4.89543 19.1046 4 18 4H16C16 4 15 4 15 5V7C15 7.55228 15.4477 8 16 8H18C19.1046 8 20 8.89543 20 10V14C20 15.1046 19.1046 16 18 16H16C15.4477 16 15 16.4477 15 17V19C15 20 16 20 16 20H18C19.1046 20 20 19.1046 20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    name: 'JSON Formatter',
    desc: 'Format, validate and visualize JSON data with tree view and syntax highlighting.',
    tags: ['Format', 'Validate', 'Tree', 'Diff'],
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    id: 'regex',
    path: '/regex',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 11H14M11 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    name: 'Regex Tester',
    desc: 'Write and test regular expressions with real-time match highlighting.',
    tags: ['Match', 'Groups', 'Flags', 'Live'],
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.15)',
  },
  {
    id: 'jwt',
    path: '/jwt',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    name: 'JWT Decoder',
    desc: 'Decode and inspect JWT tokens — header, payload and signature at a glance.',
    tags: ['Decode', 'Header', 'Payload', 'Verify'],
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.15)',
  },
  {
    id: 'color',
    path: '/color-palette',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 2C12 2 7 7 7 12C7 14.6522 8.05357 17.1957 9.92893 19.0711C11.8043 20.9464 14.3478 22 17 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    name: 'Color Palette',
    desc: 'Generate beautiful color palettes and convert between color formats instantly.',
    tags: ['HEX', 'RGB', 'HSL', 'Generate'],
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.15)'
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [visible, setVisible] = useState(false)
  const [hoveredTool, setHoveredTool] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const t = isDark ? darkTheme : lightTheme

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

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
        <div style={styles.navLogo}>

          <div style={styles.navLogoIcon}>
            <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <radialGradient id="innerGlow" cx="30%" cy="25%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background */}
              <rect x="0" y="0" width="120" height="120" rx="28" ry="28" fill="url(#bgGrad)" />

              {/* Inner highlight */}
              <rect x="0" y="0" width="120" height="120" rx="28" ry="28" fill="url(#innerGlow)" />

              {/* Border */}
              <rect x="1" y="1" width="118" height="118" rx="27.5" ry="27.5"
                fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5" />

              {/* Left bracket < */}
              <path d="M42 36 L22 60 L42 84"
                fill="none" stroke="#ffffff" strokeWidth="8"
                strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" />

              {/* Right bracket > */}
              <path d="M78 36 L98 60 L78 84"
                fill="none" stroke="#ffffff" strokeWidth="8"
                strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" />

              {/* Center slash */}
              <line x1="66" y1="30" x2="54" y2="90"
                stroke="#ffffff" strokeWidth="6"
                strokeLinecap="round" strokeOpacity="0.6" />
            </svg>
          </div>
          <span style={{ ...styles.navLogoText, color: t.text }}>DevKit</span>
        </div>

        <div style={styles.navLinks}>
          {['API Tester', 'Snippets', 'Color Palettes'].map(link => (
            <button key={link} style={{ ...styles.navLink, color: t.textMuted }}>{link}</button>
          ))}
        </div>

        <div style={styles.navRight}>
          {user ? (
            <>
              <div style={styles.navUser}>
                <div onClick={() => navigate('/profile')} style={styles.navAvatar}>
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span style={{ ...styles.navUsername, color: t.textMuted }} onClick={'/profile'}>{user.username}</span>
              </div>
              <button onClick={logout} style={{ ...styles.navLogout, color: t.textMuted, borderColor: t.border }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{ ...styles.navBtn, color: t.textMuted }}>
                Sign in
              </button>
              <button onClick={() => navigate('/register')} style={styles.navBtnPrimary}>
                Get started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        ...styles.hero,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        <div style={styles.heroBadge}>
          <span style={styles.heroBadgeDot} />
          Developer Toolkit — All tools in one place
        </div>

        <h1 style={{ ...styles.heroTitle, color: t.text }}>
          Build faster with<br />
          <span style={styles.heroTitleAccent}>the right tools</span>
        </h1>

        <p style={{ ...styles.heroSubtitle, color: t.textMuted }}>
          A suite of developer utilities — API testing, snippet management,<br />
          JSON formatting, regex testing and more. Powered by AI.
        </p>

        <div style={styles.heroActions}>
          <button onClick={() => navigate(user ? '/test-api' : '/register')} style={styles.heroCTA}>
            {user ? 'Open API Tester' : 'Get started free'}
            <span>→</span>
          </button>
          <button
            onClick={() => navigate('/snippets')}
            style={{ ...styles.heroSecondary, borderColor: t.border, color: t.textMuted }}>
            Browse Snippets
          </button>
        </div>

        {/* Terminal */}
        <div style={{ ...styles.terminal, background: t.terminal, borderColor: t.border }}>
          <div style={{ ...styles.terminalHeader, background: t.terminalHeader, borderColor: t.border }}>
            <span style={{ ...styles.terminalDot, background: '#ef4444' }} />
            <span style={{ ...styles.terminalDot, background: '#f59e0b' }} />
            <span style={{ ...styles.terminalDot, background: '#22c55e' }} />
            <span style={{ ...styles.terminalTitle, color: t.textFaint }}>devkit ~ api-tester</span>
          </div>
          <div style={styles.terminalBody}>
            <TerminalLine delay={0} color="#6366f1">GET</TerminalLine>
            <TerminalLine delay={200} color={t.textMuted}>https://api.github.com/users/octocat</TerminalLine>
            <TerminalLine delay={600} color="#22c55e">✓ 200 OK — 142ms</TerminalLine>
            <TerminalLine delay={900} color="#f59e0b">✦ AI: This response contains GitHub user profile data...</TerminalLine>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section style={{
        ...styles.toolsSection,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.3s',
      }}>
        <div style={styles.sectionHeader}>
          <h2 style={{ ...styles.sectionTitle, color: t.text }}>Everything you need</h2>
          <p style={{ ...styles.sectionSubtitle, color: t.textFaint }}>Six powerful tools built for modern developers</p>
        </div>

        <div style={styles.toolsGrid}>
          {TOOLS.map((tool, i) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={i}
              t={t}
              isDark={isDark}
              isHovered={hoveredTool === tool.id}
              onHover={() => setHoveredTool(tool.id)}
              onLeave={() => setHoveredTool(null)}
              onClick={() => !tool.soon && navigate(tool.path)}
              visible={visible}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ ...styles.footer, borderColor: t.border }}>
        <div style={styles.navLogo}>
          <div style={styles.navLogoIcon}>
            <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <radialGradient id="innerGlow" cx="30%" cy="25%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background */}
              <rect x="0" y="0" width="120" height="120" rx="28" ry="28" fill="url(#bgGrad)" />

              {/* Inner highlight */}
              <rect x="0" y="0" width="120" height="120" rx="28" ry="28" fill="url(#innerGlow)" />

              {/* Border */}
              <rect x="1" y="1" width="118" height="118" rx="27.5" ry="27.5"
                fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5" />

              {/* Left bracket < */}
              <path d="M42 36 L22 60 L42 84"
                fill="none" stroke="#ffffff" strokeWidth="8"
                strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" />

              {/* Right bracket > */}
              <path d="M78 36 L98 60 L78 84"
                fill="none" stroke="#ffffff" strokeWidth="8"
                strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" />

              {/* Center slash */}
              <line x1="66" y1="30" x2="54" y2="90"
                stroke="#ffffff" strokeWidth="6"
                strokeLinecap="round" strokeOpacity="0.6" />
            </svg>
          </div>
          <span style={{ ...styles.navLogoText, color: t.text }}>DevKit</span>
        </div>
        <p style={{ ...styles.footerText, color: t.textFaint }}>Built for developers, by developers.</p>
      </footer>

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
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e1e30; border-radius: 4px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
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

function ToolCard({ tool, index, t, isDark, isHovered, onHover, onLeave, onClick, visible }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        ...styles.toolCard,
        background: isHovered ? t.cardHover : t.card,
        borderColor: isHovered ? `${tool.color}44` : t.border,
        boxShadow: isHovered
          ? `0 0 40px ${isDark ? tool.glow : 'rgba(0,0,0,0.06)'}, 0 8px 32px rgba(0,0,0,${isDark ? '0.4' : '0.08'})`
          : `0 2px 12px rgba(0,0,0,${isDark ? '0.2' : '0.04'})`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: tool.soon ? 'default' : 'pointer',
        opacity: visible ? 1 : 0,
        animation: visible ? `fadeUp 0.5s ease ${index * 0.08}s both` : 'none',
      }}>

      <div style={{
        ...styles.toolIcon,
        background: `${tool.color}18`,
        color: tool.color,
        border: `1px solid ${tool.color}28`,
      }}>
        {tool.icon}
      </div>

      <div style={styles.toolContent}>
        <div style={styles.toolNameRow}>
          <span style={{ ...styles.toolName, color: t.text }}>{tool.name}</span>
          {tool.soon && <span style={styles.soonBadge}>Soon</span>}
        </div>
        <p style={{ ...styles.toolDesc, color: t.textMuted }}>{tool.desc}</p>
      </div>

      <div style={styles.toolTags}>
        {tool.tags.map(tag => (
          <span key={tag} style={{
            ...styles.toolTag,
            color: isHovered ? tool.color : t.textFaint,
            borderColor: isHovered ? `${tool.color}33` : t.border,
            background: isHovered ? `${tool.color}0d` : 'transparent',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {!tool.soon && (
        <div style={{
          ...styles.toolArrow,
          color: tool.color,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateX(0)' : 'translateX(-8px)',
          transition: 'all 0.2s ease',
        }}>
          →
        </div>
      )}
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
    background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'pulse 10s ease-in-out infinite 2s',
  },
  nav: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 48px',
    borderBottom: '1px solid',
    backdropFilter: 'blur(12px)',
    position: 'fixed',  
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
  navLinks: {
    display: 'flex',
    gap: '4px',
  },
  navLink: {
    background: 'transparent',
    border: 'none',
    fontSize: '13px',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '6px',
    fontFamily: 'inherit',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
  },
  navUsername: {
    fontSize: '13px',
  },
  navLogout: {
    background: 'transparent',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '12px',
    padding: '5px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '13px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  navBtnPrimary: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    padding: '7px 16px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '130px 48px 60px',
    position: 'relative',
  },
  heroBadge: {
    display: 'flex',
    alignItems: 'center', 
    gap: '8px',
    background: '#4f46e511',
    border: '1px solid #4f46e533',
    borderRadius: '20px',
    color: '#a78bfa',
    fontSize: '12px',
    padding: '5px 14px',
    marginBottom: '28px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  heroBadgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#a78bfa',
    animation: 'blink 2s ease-in-out infinite',
    flexShrink: 0,
  },
  heroTitle: {
    fontSize: '64px',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '20px',
    letterSpacing: '-1px',
  },
  heroTitleAccent: {
    background: 'linear-gradient(135deg, #6366f1, #a78bfa, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '16px',
    lineHeight: '1.7',
    marginBottom: '36px',
    maxWidth: '500px',
  },
  heroActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '56px',
  },
  heroCTA: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '13px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 0 30px rgba(79,70,229,0.3)',
  },
  heroSecondary: {
    background: 'transparent',
    border: '1px solid',
    borderRadius: '10px',
    padding: '13px 24px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  terminal: {
    width: '100%',
    maxWidth: '560px',
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
  toolsSection: {
    padding: '20px 48px 80px',
    position: 'relative',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '10px',
    letterSpacing: '-0.5px',
  },
  sectionSubtitle: {
    fontSize: '14px',
  },
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  toolCard: {
    border: '1px solid',
    borderRadius: '14px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    transition: 'all 0.25s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  toolIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  toolNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toolName: {
    fontSize: '16px',
    fontWeight: '600',
  },
  soonBadge: {
    background: '#f59e0b18',
    border: '1px solid #f59e0b33',
    borderRadius: '20px',
    color: '#f59e0b',
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 7px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  toolDesc: {
    fontSize: '13px',
    lineHeight: '1.6',
  },
  toolTags: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap',
  },
  toolTag: {
    fontSize: '10px',
    fontFamily: "'IBM Plex Mono', monospace",
    border: '1px solid',
    borderRadius: '4px',
    padding: '2px 7px',
    transition: 'all 0.2s ease',
  },
  toolArrow: {
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    fontSize: '18px',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '32px 48px',
    borderTop: '1px solid',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerText: {
    fontSize: '12px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
}