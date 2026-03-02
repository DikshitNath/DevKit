import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { sendRequest } from '../../utils/apiTester'
import { saveToHistory } from '../../utils/historyManager'
import DevKitLogo from '../ui/DevKitLogo'
import ResponseViewer from './ResponseViewer'
import HeadersEditor from './HeadersEditor'
import BodyEditor from './BodyEditor'
import HistoryPanel from './HistoryPanel'
import AIPanel from './AIPanel'

const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#6366f1',
  PUT: '#f59e0b',
  PATCH: '#f97316',
  DELETE: '#ef4444',
}

export default function ApiTester() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeTaken, setTimeTaken] = useState(null)
  const [historyKey, setHistoryKey] = useState(0)
  const [activeTab, setActiveTab] = useState('headers')
  const { isDark, theme: t, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const refresh = () => setHistoryKey(k => k + 1)

  const handleSend = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const result = await sendRequest({ url, method, headers, body })
      setResponse(result)
      setTimeTaken(result.timeTaken)
      saveToHistory({ url, method, headers, body }, result)
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFromHistory = (entry) => {
    setUrl(entry.request.url)
    setMethod(entry.request.method)
    setHeaders(entry.request.headers)
    setBody(entry.request.body || '')
    setResponse(entry.response)
    setTimeTaken(entry.response.timeTaken)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: t.page, color: t.text, fontFamily: "'Syne', sans-serif", overflow: 'hidden', position: 'relative', transition: 'background 0.3s ease, color 0.3s ease' }}>

      {/* Dot grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `radial-gradient(circle, ${t.dot} 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: 0.55, pointerEvents: 'none', zIndex: 0 }} />

      {/* Glow orbs — dark only */}
      {isDark && (
        <>
          <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 8s ease-in-out infinite', zIndex: 0 }} />
          <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 10s ease-in-out infinite 2s', zIndex: 0 }} />
        </>
      )}

      {/* LEFT SIDEBAR */}
      <aside style={{ width: '240px', minWidth: '240px', background: t.sidebar, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10, transition: 'background 0.3s ease, border-color 0.3s ease' }}>

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 16px 14px', borderBottom: `1px solid ${t.border}`, cursor: 'pointer' }}>
          <DevKitLogo size={28} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: t.text, letterSpacing: '0.4px' }}>DevKit</span>
        </div>

        {/* Tool badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', margin: '12px 16px 4px', background: '#4f46e511', border: '1px solid #4f46e533', borderRadius: '20px', color: '#a78bfa', fontSize: '11px', padding: '4px 12px', fontFamily: "'IBM Plex Mono', monospace", width: 'fit-content' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366f1', animation: 'blink 2s ease-in-out infinite', flexShrink: 0 }} />
          API Tester
        </div>

        {/* History */}
        <div style={{ padding: '14px 16px 6px', fontSize: '10px', letterSpacing: '2px', color: t.textFaint, fontWeight: '600', fontFamily: "'IBM Plex Mono', monospace" }}>HISTORY</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <HistoryPanel t={t} key={historyKey} onSelect={loadFromHistory} refresh={refresh} />
        </div>

        {/* User area */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${t.border}` }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div onClick={() => navigate('/profile')} style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '12px', color: t.textMuted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</span>
              <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '5px', color: t.textMuted, fontSize: '10px', padding: '3px 8px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</button>
          )}
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

        {/* TOP BAR */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}`, background: t.topbarBg, backdropFilter: 'blur(12px)', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: t.card, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
            {/* Method selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0 14px', borderRight: `1px solid ${t.border}`, height: '42px', flexShrink: 0 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: METHOD_COLORS[method], flexShrink: 0 }} />
              <select value={method} onChange={e => setMethod(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", color: METHOD_COLORS[method] }}>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {/* URL input */}
            <input type="text" placeholder="Enter request URL  (Ctrl+Enter to send)" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={handleKeyDown} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontSize: '13px', padding: '0 14px', height: '42px', fontFamily: "'IBM Plex Mono', monospace" }} />
            {/* Send button */}
            <button onClick={handleSend} disabled={loading || !url} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: '0 8px 8px 0', padding: '0 22px', height: '42px', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap', boxShadow: '0 0 20px rgba(99,102,241,0.25)', flexShrink: 0, opacity: loading || !url ? 0.45 : 1, cursor: loading || !url ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}>
              {loading ? <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span> : <>Send <span style={{ fontSize: '14px' }}>→</span></>}
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', padding: '0 20px', borderBottom: `1px solid ${t.border}`, background: t.tabsBg, gap: '2px', transition: 'background 0.3s ease' }}>
          {['headers', 'body'].map(tab => {
            if (tab === 'body' && method === 'GET') return null
            const isActive = activeTab === tab
            const count = tab === 'headers' ? headers.filter(h => h.key).length : 0
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: isActive ? t.tabActiveBg : 'transparent', border: 'none', borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent', color: isActive ? '#a78bfa' : t.textMuted, fontSize: '12px', fontWeight: '600', padding: '11px 16px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s, background 0.2s' }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {count > 0 && <span style={{ background: '#6366f122', color: '#a78bfa', border: '1px solid #6366f133', borderRadius: '10px', padding: '1px 6px', fontSize: '10px' }}>{count}</span>}
              </button>
            )
          })}
        </div>

        {/* TAB CONTENT */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, maxHeight: '200px', overflowY: 'auto', background: t.tabContentBg, transition: 'background 0.3s ease' }}>
          {activeTab === 'headers' && <HeadersEditor t={t} headers={headers} setHeaders={setHeaders} />}
          {activeTab === 'body' && method !== 'GET' && <BodyEditor t={t} body={body} setBody={setBody} />}
        </div>

        {/* RESPONSE */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', borderBottom: `1px solid ${t.border}`, background: t.responseHeaderBg, transition: 'background 0.3s ease' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, fontFamily: "'IBM Plex Mono', monospace", display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', animation: 'blink 2s ease-in-out infinite' }} />
              Response
            </div>
            {response && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', fontFamily: "'IBM Plex Mono', monospace", background: response.status >= 200 && response.status < 300 ? '#22c55e15' : '#ef444415', color: response.status >= 200 && response.status < 300 ? '#4ade80' : '#f87171', border: `1px solid ${response.status >= 200 && response.status < 300 ? '#22c55e33' : '#ef444433'}` }}>
                  {response.status} {response.statusText}
                </span>
                <span style={{ fontSize: '11px', color: t.textMuted, background: t.card, border: `1px solid ${t.border}`, padding: '3px 10px', borderRadius: '20px', fontFamily: "'IBM Plex Mono', monospace" }}>{timeTaken}ms</span>
              </div>
            )}
          </div>

          {error && (
            <div style={{ margin: '16px 20px', padding: '12px 16px', background: '#ef444411', border: '1px solid #ef444433', borderRadius: '8px', color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'IBM Plex Mono', monospace" }}>
              <span>⚠</span> {error}
            </div>
          )}

          {!response && !error && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '8px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.15 }}>⚡</div>
              <p style={{ color: t.textMuted, fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace" }}>Send a request to see the response</p>
              <p style={{ color: t.textFaint, fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace" }}>Press Ctrl+Enter or click Send</p>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '8px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.15, animation: 'spin 1s linear infinite' }}>◌</div>
              <p style={{ color: t.textMuted, fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace" }}>Sending request...</p>
            </div>
          )}

          {response && !loading && <ResponseViewer t={t} response={response} timeTaken={timeTaken} />}
        </div>

        <AIPanel t={t} isDark={isDark} request={{ url, method, headers, body }} response={response} onBodyGenerated={(generatedBody) => { setBody(generatedBody); setActiveTab('body') }} />
      </main>

      {/* Theme toggle */}
      <button onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} style={{ position: 'fixed', bottom: '28px', right: '28px', width: '44px', height: '44px', borderRadius: '50%', background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, boxShadow: t.toggleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 999, fontSize: '19px', transition: 'all 0.3s ease', backdropFilter: 'blur(8px)' }}>
        {isDark ? '☀️' : '🌙'}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select option { background: ${isDark ? '#0c0c18' : '#ffffff'}; color: ${isDark ? '#e2e2f0' : '#1a1a2e'}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#1e1e30' : '#d0d0e8'}; border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.05)} }
        input::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
        textarea::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
      `}</style>
    </div>
  )
}