import JSONPretty from 'react-json-pretty'
import { useState } from 'react'

export default function ResponseViewer({ response }) {
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
    <div style={styles.container}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.viewTabs}>
          {['pretty', 'raw'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{ ...styles.viewTab, ...(view === v ? styles.viewTabActive : {}) }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={copy} style={styles.copyBtn}>
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
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
          <pre style={styles.raw}>
            {typeof response.data === 'object'
              ? JSON.stringify(response.data, null, 2)
              : String(response.data)}
          </pre>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 20px',
    borderBottom: '1px solid #1e1e30',
    background: '#0a0a12',
  },
  viewTabs: {
    display: 'flex',
    gap: '4px',
  },
  viewTab: {
    background: 'transparent',
    border: '1px solid transparent',
    color: '#555',
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  viewTabActive: {
    background: '#1e1e30',
    border: '1px solid #2e2e45',
    color: '#a78bfa',
  },
  copyBtn: {
    background: 'transparent',
    border: '1px solid #1e1e30',
    color: '#555',
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    background: '#0a0a12',
  },
  raw: {
    color: '#888',
    fontSize: '12px',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  }
}