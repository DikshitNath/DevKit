import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const darkTheme = {
  page: '#080810', sidebar: '#0a0a16', panel: '#0c0c18',
  border: '#1e1e30', borderSubtle: '#13131e',
  text: '#e2e2f0', textMuted: '#4a4a7a', textFaint: '#2a2a45', textDim: '#3a3a5c',
  dot: '#1e1e35', input: '#0c0c18', sectionBg: 'rgba(8,8,16,0.6)',
  cardHover: 'rgba(255,255,255,0.02)',
  toggleBg: '#16162a', toggleBorder: '#2a2a45', toggleShadow: '0 4px 20px rgba(0,0,0,0.4)',
}
const lightTheme = {
  page: '#f0f0f8', sidebar: '#f8f8fc', panel: '#ffffff',
  border: '#e0e0ee', borderSubtle: '#eaeaf4',
  text: '#1a1a2e', textMuted: '#666688', textFaint: '#aaaacc', textDim: '#888899',
  dot: '#d8d8ee', input: '#ffffff', sectionBg: 'rgba(240,240,248,0.7)',
  cardHover: 'rgba(0,0,0,0.015)',
  toggleBg: '#ffffff', toggleBorder: '#e0e0ee', toggleShadow: '0 4px 20px rgba(0,0,0,0.1)',
}

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NzhjZDEyMzQ1NiIsInVzZXJuYW1lIjoiZGlrc2hpdG5hdGgiLCJpYXQiOjE3MTk4MzIwMDAsImV4cCI6MTcyMDQzNjgwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const PART_COLORS = ['#f59e0b', '#06b6d4', '#f87171']
const PART_NAMES = ['Header', 'Payload', 'Signature']

const CLAIM_DESCRIPTIONS = {
  iss: 'Issuer', sub: 'Subject', aud: 'Audience', exp: 'Expiration Time',
  nbf: 'Not Before', iat: 'Issued At', jti: 'JWT ID', alg: 'Algorithm', typ: 'Token Type'
}

function decodeJwt(token) {
  try {
    const parts = token.trim().split('.')
    if (parts.length !== 3) return { error: 'Invalid JWT format — must have 3 parts separated by dots' }
    const decode = (str) => {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
      return JSON.parse(atob(padded))
    }
    const header = decode(parts[0])
    const payload = decode(parts[1])
    const signature = parts[2]
    let status = 'valid', expiryInfo = null
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000)
      const now = new Date()
      if (expDate < now) {
        status = 'expired'
        expiryInfo = { date: expDate, expired: true, diff: Math.floor((now - expDate) / 1000 / 60) }
      } else {
        expiryInfo = { date: expDate, expired: false, diff: Math.floor((expDate - now) / 1000 / 60) }
      }
    }
    return { header, payload, signature, status, expiryInfo, parts, error: null }
  } catch (e) {
    return { error: 'Failed to decode: ' + e.message }
  }
}

const DevKitLogo = ({ id }) => (
  <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id={`${id}g`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4f46e5"/><stop offset="100%" stopColor="#7c3aed"/>
      </linearGradient>
      <radialGradient id={`${id}h`} cx="30%" cy="25%" r="60%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18"/><stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect width="120" height="120" rx="28" fill={`url(#${id}g)`}/>
    <rect width="120" height="120" rx="28" fill={`url(#${id}h)`}/>
    <rect x="1" y="1" width="118" height="118" rx="27.5" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5"/>
    <path d="M42 36 L22 60 L42 84" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95"/>
    <path d="M78 36 L98 60 L78 84" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95"/>
    <line x1="66" y1="30" x2="54" y2="90" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.6"/>
  </svg>
)

const LogoutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function JwtDecoder() {
  const [token, setToken] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [copied, setCopied] = useState(null)
  const [activeTab, setActiveTab] = useState('payload')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const t = isDark ? darkTheme : lightTheme

  const decoded = useMemo(() => token.trim() ? decodeJwt(token) : null, [token])

  const copyVal = (val, key) => {
    navigator.clipboard.writeText(typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val))
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const mono = "'IBM Plex Mono', monospace"
  const syne = "'Syne', sans-serif"

  return (
    <div style={{ height: '100vh', display: 'flex', background: t.page, color: t.text, fontFamily: syne, overflow: 'hidden', position: 'relative', transition: 'background 0.3s ease, color 0.3s ease' }}>

      <div style={{ position: 'fixed', inset: 0, backgroundImage: `radial-gradient(circle, ${t.dot} 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: 0.55, pointerEvents: 'none', zIndex: 0 }} />
      {isDark && <>
        <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 8s ease-in-out infinite', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-20%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 10s ease-in-out infinite 2s', zIndex: 0 }} />
      </>}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', minWidth: '220px', background: t.sidebar, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10, transition: 'background 0.3s ease, border-color 0.3s ease' }}>

        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 16px 14px', borderBottom: `1px solid ${t.border}`, cursor: 'pointer' }}>
          <DevKitLogo id="jwt" />
          <span style={{ fontSize: '15px', fontWeight: '700', color: t.text, letterSpacing: '0.4px' }}>DevKit</span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', margin: '12px 16px 14px', background: '#f59e0b11', border: '1px solid #f59e0b33', borderRadius: '20px', color: '#f59e0b', fontSize: '11px', padding: '4px 12px', fontFamily: mono, width: 'fit-content' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', animation: 'blink 2s ease-in-out infinite', flexShrink: 0 }} />
          JWT Decoder
        </div>

        {/* About section */}
        <div style={{ padding: '0 16px', flex: 1 }}>
          <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, marginBottom: '10px', textTransform: 'uppercase', fontFamily: mono }}>ABOUT JWT</div>
          {[
            { part: 'Header', color: PART_COLORS[0], desc: 'Algorithm & token type' },
            { part: 'Payload', color: PART_COLORS[1], desc: 'Claims & user data' },
            { part: 'Signature', color: PART_COLORS[2], desc: 'Verification hash' },
          ].map(({ part, color, desc }) => (
            <div key={part} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '3px', height: '32px', borderRadius: '2px', background: color, flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: color, fontFamily: mono }}>{part}</div>
                <div style={{ fontSize: '11px', color: t.textMuted, marginTop: '1px' }}>{desc}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '16px', padding: '10px', background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)', border: '1px solid #f59e0b22', borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '600', marginBottom: '4px', fontFamily: mono }}>FORMAT</div>
            <div style={{ fontSize: '10px', color: t.textMuted, fontFamily: mono, lineHeight: '1.5' }}>
              <span style={{ color: PART_COLORS[0] }}>xxxxx</span>
              <span style={{ color: t.textFaint }}>.</span>
              <span style={{ color: PART_COLORS[1] }}>yyyyy</span>
              <span style={{ color: t.textFaint }}>.</span>
              <span style={{ color: PART_COLORS[2] }}>zzzzz</span>
            </div>
          </div>
        </div>

        {/* User area */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${t.border}` }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div onClick={() => navigate('/profile')} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                <div style={{ fontSize: '10px', color: t.textFaint, fontFamily: mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || ''}</div>
              </div>
              <button onClick={logout} title="Logout" style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '5px', color: t.textMuted, cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 0.15s' }}><LogoutIcon /></button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${t.border}`, background: t.sectionBg, backdropFilter: 'blur(12px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>JWT Decoder</span>
            <span style={{ fontSize: '11px', color: t.textMuted }}>— decode and inspect JSON Web Tokens</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => setToken(SAMPLE_JWT)} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: t.textMuted, fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>Load Sample</button>
            <button onClick={() => setToken('')} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: t.textMuted, fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>✕ Clear</button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* Token input panel */}
          <div style={{ width: '380px', flexShrink: 0, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 16px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,16,0.5)' : 'rgba(248,248,252,0.8)', fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, textTransform: 'uppercase', flexShrink: 0, fontFamily: mono }}>Encoded Token</div>

            {/* Colorized token preview */}
            {token && !decoded?.error && decoded && (
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,16,0.4)' : 'rgba(248,248,252,0.6)', wordBreak: 'break-all', fontSize: '11px', fontFamily: mono, lineHeight: '1.8' }}>
                {decoded.parts.map((part, i) => (
                  <span key={i}>
                    <span style={{ color: PART_COLORS[i] }}>{part}</span>
                    {i < 2 && <span style={{ color: t.textFaint }}>.</span>}
                  </span>
                ))}
              </div>
            )}

            <textarea value={token} onChange={e => setToken(e.target.value)} placeholder={'Paste your JWT token here...\n\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\n  .eyJ1c2VyIjoiam9obiJ9\n  .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQ'} spellCheck={false} style={{ flex: 1, background: t.page, border: 'none', outline: 'none', color: t.textMuted, fontSize: '12px', fontFamily: mono, lineHeight: '1.7', padding: '16px', resize: 'none', transition: 'background 0.3s' }} />

            {decoded && (
              <div style={{ padding: '10px 16px', borderTop: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,16,0.5)' : 'rgba(248,248,252,0.8)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {decoded.error ? (
                  <span style={{ fontSize: '11px', color: '#f87171', fontFamily: mono }}>✕ {decoded.error}</span>
                ) : decoded.status === 'expired' ? (
                  <>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#f87171', fontFamily: mono }}>Expired {decoded.expiryInfo.diff}m ago</span>
                  </>
                ) : (
                  <>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#4ade80', fontFamily: mono }}>
                      {decoded.expiryInfo ? `Valid — expires in ${decoded.expiryInfo.diff}m` : 'Valid JWT (no expiry)'}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Decoded panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {!token && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px' }}>
                <div style={{ fontSize: '44px', opacity: 0.2 }}>🔐</div>
                <p style={{ color: t.textMuted, fontSize: '14px', fontWeight: '500' }}>Paste a JWT token to decode it</p>
                <p style={{ color: t.textFaint, fontSize: '12px', fontFamily: mono }}>Header · Payload · Signature</p>
                <button onClick={() => setToken(SAMPLE_JWT)} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(245,158,11,0.25)', marginTop: '4px' }}>
                  Load Sample Token
                </button>
              </div>
            )}

            {decoded?.error && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: '10px', padding: '20px 28px', color: '#f87171', fontSize: '13px', fontFamily: mono, maxWidth: '400px', textAlign: 'center' }}>
                  ✕ {decoded.error}
                </div>
              </div>
            )}

            {decoded && !decoded.error && (
              <>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, background: t.sectionBg, backdropFilter: 'blur(8px)', flexShrink: 0 }}>
                  {['header', 'payload', 'signature'].map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      padding: '11px 20px', background: 'transparent', border: 'none',
                      borderBottom: activeTab === tab ? `2px solid ${PART_COLORS[i]}` : '2px solid transparent',
                      color: activeTab === tab ? PART_COLORS[i] : t.textMuted,
                      fontSize: '12px', fontWeight: activeTab === tab ? '600' : '400',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      background: activeTab === tab ? `${PART_COLORS[i]}08` : 'transparent',
                    }}>{PART_NAMES[i]}</button>
                  ))}
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>

                  {activeTab === 'header' && (
                    <ClaimTable data={decoded.header} t={t} copied={copied} onCopy={copyVal} color={PART_COLORS[0]} isDark={isDark} />
                  )}

                  {activeTab === 'payload' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {decoded.expiryInfo && (
                        <div style={{ background: decoded.expiryInfo.expired ? '#ef444411' : '#22c55e11', border: `1px solid ${decoded.expiryInfo.expired ? '#ef444433' : '#22c55e33'}`, borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '22px' }}>{decoded.expiryInfo.expired ? '⏰' : '✅'}</div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: decoded.expiryInfo.expired ? '#f87171' : '#4ade80' }}>
                              {decoded.expiryInfo.expired ? 'Token Expired' : 'Token Valid'}
                            </div>
                            <div style={{ fontSize: '11px', color: t.textMuted, fontFamily: mono, marginTop: '2px' }}>
                              {decoded.expiryInfo.expired
                                ? `Expired ${decoded.expiryInfo.diff} minutes ago (${decoded.expiryInfo.date.toLocaleString()})`
                                : `Expires in ${decoded.expiryInfo.diff} minutes (${decoded.expiryInfo.date.toLocaleString()})`}
                            </div>
                          </div>
                        </div>
                      )}
                      <ClaimTable data={decoded.payload} t={t} copied={copied} onCopy={copyVal} color={PART_COLORS[1]} isDark={isDark} showTimestamps />
                    </div>
                  )}

                  {activeTab === 'signature' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ background: isDark ? '#0a0a12' : '#f4f4fc', border: `1px solid ${t.border}`, borderRadius: '10px', padding: '16px' }}>
                        <div style={{ fontSize: '9px', color: t.textFaint, marginBottom: '8px', fontFamily: mono, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Signature (Base64URL)</div>
                        <div style={{ fontSize: '12px', fontFamily: mono, color: PART_COLORS[2], wordBreak: 'break-all', lineHeight: '1.6' }}>{decoded.signature}</div>
                        <button onClick={() => copyVal(decoded.signature, 'sig')} style={{ marginTop: '12px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: copied === 'sig' ? '#4ade80' : t.textMuted, fontSize: '11px', padding: '5px 12px', cursor: 'pointer', fontFamily: mono, transition: 'all 0.15s' }}>
                          {copied === 'sig' ? '✓ Copied' : '⎘ Copy'}
                        </button>
                      </div>
                      <div style={{ background: '#f59e0b0a', border: '1px solid #f59e0b33', borderRadius: '10px', padding: '14px 16px' }}>
                        <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600', marginBottom: '6px' }}>⚠ Signature Verification</div>
                        <div style={{ fontSize: '12px', color: t.textMuted, lineHeight: '1.6' }}>
                          Signature verification requires your secret key. Use your backend: <code style={{ background: isDark ? '#1e1e30' : '#ebebf8', padding: '1px 6px', borderRadius: '4px', fontFamily: mono, fontSize: '11px', color: '#fb923c' }}>jwt.verify(token, secret)</code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <button onClick={() => setIsDark(d => !d)} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} style={{ position: 'fixed', bottom: '28px', right: '28px', width: '44px', height: '44px', borderRadius: '50%', background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, boxShadow: `${t.toggleShadow}, 0 0 0 1px ${t.toggleBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 999, fontSize: '19px', transition: 'all 0.3s ease', backdropFilter: 'blur(8px)' }}>
        {isDark ? '☀️' : '🌙'}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#1e1e30' : '#d0d0e8'}; border-radius: 4px; }
        textarea::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.05)} }
      `}</style>
    </div>
  )
}

function ClaimTable({ data, t, copied, onCopy, color, isDark, showTimestamps }) {
  const mono = "'IBM Plex Mono', monospace"
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {Object.entries(data).map(([key, val]) => {
        const isTimestamp = showTimestamps && typeof val === 'number' && String(val).length === 10
        const display = isTimestamp ? new Date(val * 1000).toLocaleString() : (typeof val === 'object' ? JSON.stringify(val) : String(val))
        return (
          <div key={key} onClick={() => onCopy(val, key)} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${t.border}`, borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = color + '66'}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
            <div style={{ width: '90px', flexShrink: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', fontFamily: mono, color }}>{key}</div>
              {CLAIM_DESCRIPTIONS[key] && <div style={{ fontSize: '10px', color: t.textFaint, marginTop: '2px' }}>{CLAIM_DESCRIPTIONS[key]}</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontFamily: mono, color: t.text, wordBreak: 'break-all' }}>{display}</div>
              {isTimestamp && <div style={{ fontSize: '10px', color: t.textMuted, marginTop: '2px', fontFamily: mono }}>unix: {val}</div>}
            </div>
            <div style={{ fontSize: '11px', color: copied === key ? '#4ade80' : t.textFaint, flexShrink: 0, alignSelf: 'center', fontFamily: mono }}>
              {copied === key ? '✓' : '⎘'}
            </div>
          </div>
        )
      })}
    </div>
  )
}