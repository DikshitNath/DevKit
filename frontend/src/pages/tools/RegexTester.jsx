import { useState, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import DevKitLogo from '../../components/ui/DevKitLogo'
import ReactMarkdown from 'react-markdown'

const PRESETS = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { label: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_+.~#?&/=]*)', flags: 'gi' },
  { label: 'Phone', pattern: '[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}', flags: 'g' },
  { label: 'IP Address', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b', flags: 'g' },
  { label: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b', flags: 'g' },
  { label: 'Date', pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}', flags: 'g' },
]

const MATCH_COLORS = ['#06b6d4', '#a78bfa', '#fb923c', '#4ade80']
const ACCENT = '#06b6d4'
const mono = "'IBM Plex Mono', monospace"

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('(\\w+)@(\\w+)\\.com')
  const [flags, setFlags] = useState('g')
  const [testText, setTestText] = useState('Contact us at hello@devkit.com or support@example.com for help.\nOur team is available at team@company.org')
  const [aiMode, setAiMode] = useState(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiOutput, setAiOutput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { isDark, theme: t, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const result = useMemo(() => {
    if (!pattern) return { valid: true, matches: [], highlighted: escHtml(testText), count: 0 }
    try {
      const regex = new RegExp(pattern, flags)
      const matches = []
      let m
      if (flags.includes('g')) {
        while ((m = regex.exec(testText)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) })
          if (m[0].length === 0) regex.lastIndex++
        }
      } else {
        m = regex.exec(testText)
        if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) })
      }
      let highlighted = '', last = 0
      const allMatches = [...testText.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))]
      allMatches.forEach((m, i) => {
        highlighted += escHtml(testText.slice(last, m.index))
        highlighted += `<mark class="match match-${i % 4}">${escHtml(m[0])}</mark>`
        last = m.index + m[0].length
      })
      highlighted += escHtml(testText.slice(last))
      return { valid: true, matches, highlighted, count: matches.length, error: null }
    } catch (e) {
      return { valid: false, matches: [], highlighted: escHtml(testText), count: 0, error: e.message }
    }
  }, [pattern, flags, testText])

  const handleAI = async (mode) => {
    setAiLoading(true); setAiOutput('')
    try {
      if (mode === 'explain') {
        const res = await axios.post('/api/ai/explain-regex', { pattern, flags }, { withCredentials: true })
        setAiOutput(res.data.explanation); setAiMode('explain')
      } else {
        const res = await axios.post('/api/ai/generate-regex', { description: aiPrompt }, { withCredentials: true })
        setPattern(res.data.pattern); setFlags(res.data.flags || 'g')
        setAiOutput(res.data.explanation); setAiMode('explain'); setAiPrompt('')
      }
    } catch (err) {
      setAiOutput('Error: ' + (err.response?.data?.error || err.message))
    } finally { setAiLoading(false) }
  }

  const toggleFlag = (f) => setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)
  const copyPattern = () => { navigator.clipboard.writeText(`/${pattern}/${flags}`); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div style={{ height: '100vh', display: 'flex', background: t.page, color: t.text, fontFamily: "'Syne', sans-serif", overflow: 'hidden', position: 'relative', transition: 'background 0.3s ease, color 0.3s ease' }}>

      <div style={{ position: 'fixed', inset: 0, backgroundImage: `radial-gradient(circle, ${t.dot} 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: 0.55, pointerEvents: 'none', zIndex: 0 }} />
      {isDark && <>
        <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 8s ease-in-out infinite', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-20%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 10s ease-in-out infinite 2s', zIndex: 0 }} />
      </>}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', minWidth: '220px', background: t.sidebar, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10, transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 16px 14px', borderBottom: `1px solid ${t.border}`, cursor: 'pointer' }}>
          <DevKitLogo size={28} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: t.text, letterSpacing: '0.4px' }}>DevKit</span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', margin: '12px 16px 14px', background: `${ACCENT}11`, border: `1px solid ${ACCENT}33`, borderRadius: '20px', color: ACCENT, fontSize: '11px', padding: '4px 12px', fontFamily: mono, width: 'fit-content' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: ACCENT, animation: 'blink 2s ease-in-out infinite', flexShrink: 0 }} />
          Regex Tester
        </div>

        <div style={{ padding: '0 8px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, padding: '4px 8px 8px', textTransform: 'uppercase', fontFamily: mono }}>PRESETS</div>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => { setPattern(p.pattern); setFlags(p.flags); setAiOutput('') }} style={{ display: 'flex', alignItems: 'center', width: '100%', background: pattern === p.pattern ? t.navItemActive : 'transparent', border: 'none', borderLeft: pattern === p.pattern ? `2px solid ${ACCENT}` : '2px solid transparent', borderRadius: '6px', color: pattern === p.pattern ? ACCENT : t.textMuted, fontSize: '13px', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>{p.label}</button>
          ))}
        </div>

        <div style={{ margin: '12px 16px', padding: '12px', background: isDark ? `${ACCENT}08` : `${ACCENT}05`, border: `1px solid ${ACCENT}22`, borderRadius: '10px' }}>
          <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, marginBottom: '6px', fontFamily: mono }}>MATCHES</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: result.count > 0 ? ACCENT : t.textDim, fontFamily: mono, lineHeight: 1 }}>{result.count}</div>
          {result.count > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '110px', overflowY: 'auto' }}>
              {result.matches.slice(0, 8).map((m, i) => (
                <div key={i} style={{ fontSize: '10px', color: MATCH_COLORS[i % 4], fontFamily: mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '2px 0', borderBottom: `1px solid ${t.borderSubtle}` }}>"{m.match}"</div>
              ))}
              {result.count > 8 && <div style={{ fontSize: '10px', color: t.textFaint, fontFamily: mono }}>+{result.count - 8} more</div>}
            </div>
          )}
        </div>

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
              <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '5px', color: t.textMuted, cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${t.border}`, background: t.sectionBg, backdropFilter: 'blur(12px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>Regex Tester</span>
            <span style={{ fontSize: '11px', color: t.textMuted }}>— test, match, explain</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => { setAiMode(m => m === 'generate' ? null : 'generate'); setAiOutput('') }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: aiMode === 'generate' ? '#a78bfa18' : 'transparent', border: `1px solid ${aiMode === 'generate' ? '#a78bfa44' : t.border}`, borderRadius: '7px', color: aiMode === 'generate' ? '#a78bfa' : t.textMuted, fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ color: '#a78bfa', fontSize: '10px' }}>✦</span> Generate
            </button>
            <button onClick={() => handleAI('explain')} disabled={!pattern || aiLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: t.textMuted, fontSize: '12px', padding: '6px 12px', cursor: !pattern ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: !pattern ? 0.4 : 1 }}>
              <span style={{ color: '#a78bfa', fontSize: '10px' }}>✦</span> Explain
            </button>
            <div style={{ width: '1px', height: '20px', background: t.border }} />
            <button onClick={copyPattern} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: copied ? '#4ade80' : t.textMuted, fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>{copied ? '✓ Copied' : '⎘ Copy'}</button>
          </div>
        </div>

        {aiMode === 'generate' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,22,0.85)' : 'rgba(244,244,252,0.9)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#a78bfa', whiteSpace: 'nowrap', fontFamily: mono }}>✦ DESCRIBE PATTERN:</span>
            <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && aiPrompt && handleAI('generate')} placeholder='"match all phone numbers with country code"' style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: '7px', color: t.text, fontSize: '12px', padding: '8px 12px', outline: 'none', fontFamily: mono }} />
            <button onClick={() => handleAI('generate')} disabled={aiLoading || !aiPrompt} style={{ background: 'linear-gradient(135deg, #a78bfa, #6366f1)', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 18px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', opacity: !aiPrompt ? 0.5 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{aiLoading ? 'Generating...' : 'Generate'}</button>
            <button onClick={() => setAiMode(null)} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: t.textMuted, fontSize: '12px', padding: '6px 10px', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(12,12,24,0.5)' : 'rgba(248,248,252,0.6)', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: t.input, border: `1px solid ${result.error ? '#ef444466' : result.count > 0 ? `${ACCENT}44` : t.border}`, borderRadius: '10px', padding: '10px 14px', transition: 'border-color 0.2s' }}>
            <span style={{ color: t.textFaint, fontSize: '20px', fontFamily: mono, userSelect: 'none', lineHeight: 1 }}>/</span>
            <input value={pattern} onChange={e => { setPattern(e.target.value); setAiOutput('') }} placeholder="Enter regex pattern..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: ACCENT, fontSize: '15px', fontFamily: mono }} />
            <span style={{ color: t.textFaint, fontSize: '20px', fontFamily: mono, userSelect: 'none', lineHeight: 1 }}>/</span>
            {['g', 'i', 'm', 's'].map(f => (
              <button key={f} onClick={() => toggleFlag(f)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: flags.includes(f) ? '#6366f118' : 'transparent', border: `1px solid ${flags.includes(f) ? '#6366f144' : t.border}`, color: flags.includes(f) ? '#a78bfa' : t.textFaint, fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: mono }}>{f}</button>
            ))}
          </div>
          {result.error && <div style={{ marginTop: '7px', color: '#f87171', fontSize: '11px', fontFamily: mono }}>✕ {result.error}</div>}
          {!result.error && result.count > 0 && <div style={{ marginTop: '7px', color: ACCENT, fontSize: '11px', fontFamily: mono }}>✓ {result.count} match{result.count !== 1 ? 'es' : ''} found</div>}
          {!result.error && pattern && result.count === 0 && <div style={{ marginTop: '7px', color: t.textMuted, fontSize: '11px', fontFamily: mono }}>○ No matches</div>}
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${t.border}`, minWidth: 0 }}>
            <div style={{ padding: '8px 16px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,16,0.5)' : 'rgba(248,248,252,0.8)', fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, textTransform: 'uppercase', flexShrink: 0, fontFamily: mono }}>Test String</div>
            <textarea value={testText} onChange={e => setTestText(e.target.value)} spellCheck={false} style={{ flex: 1, background: t.page, border: 'none', outline: 'none', color: t.text, fontSize: '13px', fontFamily: mono, lineHeight: '1.8', padding: '16px', resize: 'none' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '8px 16px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,16,0.5)' : 'rgba(248,248,252,0.8)', fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, textTransform: 'uppercase', flexShrink: 0, fontFamily: mono }}>Highlighted Matches</div>
            <div style={{ flex: 1, padding: '16px', fontSize: '13px', fontFamily: mono, lineHeight: '1.8', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: t.text, overflowY: 'auto', background: t.page }} dangerouslySetInnerHTML={{ __html: result.highlighted }} />
          </div>
        </div>

        {(aiOutput || (aiLoading && aiMode !== 'generate')) && (
          <div style={{ borderTop: `1px solid ${t.border}`, maxHeight: '220px', overflow: 'auto', flexShrink: 0, background: t.sidebar }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,16,0.7)' : 'rgba(248,248,252,0.9)' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#a78bfa', letterSpacing: '1px', fontFamily: mono }}>✦ AI EXPLANATION</span>
              <button onClick={() => setAiOutput('')} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <div style={{ padding: '14px 20px', fontSize: '13px', lineHeight: '1.7', color: t.text }}>
              {aiLoading ? <span style={{ color: t.textMuted, fontFamily: mono }}>✦ AI is thinking...</span> : (
                <ReactMarkdown components={{
                  h1: ({ children }) => <h1 style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '700', marginBottom: '8px', paddingBottom: '6px', borderBottom: `1px solid ${t.border}` }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700', margin: '12px 0 6px' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '600', margin: '10px 0 4px' }}>{children}</h3>,
                  h4: ({ children }) => <h4 style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '600', margin: '8px 0 4px' }}>{children}</h4>,
                  p: ({ children }) => <p style={{ margin: '6px 0', color: t.textMuted }}>{children}</p>,
                  code: ({ className, children }) => {
                    const isInline = !className && !String(children).includes('\n')
                    return isInline
                      ? <code style={{ background: isDark ? '#1e1e30' : '#ebebf8', color: '#fb923c', padding: '1px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace" }}>{children}</code>
                      : <pre style={{ background: isDark ? '#0a0a12' : '#f0f0f8', border: `1px solid ${t.border}`, borderRadius: '6px', padding: '10px 12px', margin: '8px 0', fontSize: '12px', color: isDark ? '#a78bfa' : '#6366f1', overflowX: 'auto', fontFamily: "'IBM Plex Mono', monospace" }}><code>{children}</code></pre>
                  },
                  ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '6px 0' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: '4px 0', color: t.textMuted }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ color: t.text, fontWeight: '600' }}>{children}</strong>,
                  hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${t.border}`, margin: '10px 0' }} />,
                }}>
                  {aiOutput}
                </ReactMarkdown>
              )}
            </div>
          </div>
        )}

        {result.matches.some(m => m.groups.length > 0) && (
          <div style={{ borderTop: `1px solid ${t.border}`, background: t.panel, padding: '10px 20px', flexShrink: 0, display: 'flex', gap: '8px', overflowX: 'auto' }}>
            <span style={{ fontSize: '9px', fontWeight: '700', color: t.textFaint, letterSpacing: '1.5px', whiteSpace: 'nowrap', alignSelf: 'center', fontFamily: mono }}>GROUPS:</span>
            {result.matches.map((m, i) => m.groups.map((g, gi) => (
              <div key={`${i}-${gi}`} style={{ background: `${MATCH_COLORS[gi % 4]}18`, border: `1px solid ${MATCH_COLORS[gi % 4]}33`, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontFamily: mono, color: MATCH_COLORS[gi % 4], whiteSpace: 'nowrap' }}>
                [{i}] ${gi + 1}: "{g}"
              </div>
            )))}
          </div>
        )}
      </div>

      <button onClick={toggleTheme} style={{ position: 'fixed', bottom: '28px', right: '28px', width: '44px', height: '44px', borderRadius: '50%', background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, boxShadow: t.toggleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 999, fontSize: '19px', transition: 'all 0.3s ease', backdropFilter: 'blur(8px)' }}>
        {isDark ? '☀️' : '🌙'}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#1e1e30' : '#d0d0e8'}; border-radius: 4px; }
        input::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
        textarea::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
        mark { border-radius: 3px; padding: 1px 0; }
        .match-0 { background: rgba(6,182,212,0.22); color: #06b6d4; }
        .match-1 { background: rgba(167,139,250,0.22); color: #a78bfa; }
        .match-2 { background: rgba(251,146,60,0.22); color: #fb923c; }
        .match-3 { background: rgba(74,222,128,0.22); color: #4ade80; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.05)} }
      `}</style>
    </div>
  )
}