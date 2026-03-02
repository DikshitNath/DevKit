import { useState } from 'react'
import JSONPretty from 'react-json-pretty'
import { useTheme } from '../../context/ThemeContext'

export default function ResponseViewer({ response }) {
  const { theme: t } = useTheme()
  const [view, setView] = useState('pretty')
  const [copied, setCopied] = useState(false)

  const copy = () => {
    const text = typeof response.data === 'object'
      ? JSON.stringify(response.data, null, 2)
      : String(response.data)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px', borderBottom: `1px solid ${t.border}`, background: t.toolbarBg, transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['pretty', 'raw'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? t.card : 'transparent', border: `1px solid ${view === v ? t.border : 'transparent'}`, color: view === v ? '#a78bfa' : t.textMuted, fontSize: '11px', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", transition: 'all 0.15s' }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={copy} style={{ background: 'transparent', border: `1px solid ${t.border}`, color: copied ? '#4ade80' : t.textMuted, fontSize: '11px', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", transition: 'all 0.15s' }}>
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: t.contentBg, transition: 'background 0.3s ease' }}>
        {view === 'pretty' && typeof response.data === 'object' ? (
          <JSONPretty
            data={response.data}
            style={{ background: 'transparent', fontSize: '12px', lineHeight: '1.7' }}
            mainStyle="background:transparent"
            keyStyle="color:#a78bfa"
            valueStyle="color:#34d399"
            stringStyle="color:#fb923c"
            booleanStyle="color:#60a5fa"
          />
        ) : (
          <pre style={{ color: t.textMuted, fontSize: '12px', lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: "'IBM Plex Mono', monospace" }}>
            {typeof response.data === 'object'
              ? JSON.stringify(response.data, null, 2)
              : String(response.data)}
          </pre>
        )}
      </div>
    </div>
  )
}