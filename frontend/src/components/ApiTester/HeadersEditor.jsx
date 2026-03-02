import { useTheme } from '../../context/ThemeContext'

export default function HeadersEditor({ headers, setHeaders }) {
  const { theme: t } = useTheme()

  const update = (index, field, value) => {
    const updated = [...headers]
    updated[index][field] = value
    setHeaders(updated)
  }

  const addRow = () => setHeaders([...headers, { key: '', value: '' }])
  const removeRow = (i) => setHeaders(headers.filter((_, idx) => idx !== i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.3s ease' }}>
      <div style={{ display: 'flex', background: t.sectionBg, borderBottom: `1px solid ${t.border}`, padding: '6px 12px', gap: '8px', transition: 'background 0.3s ease' }}>
        <div style={{ flex: 1, fontSize: '10px', letterSpacing: '1.5px', color: t.textFaint, fontWeight: '700', fontFamily: "'IBM Plex Mono', monospace" }}>KEY</div>
        <div style={{ flex: 1, fontSize: '10px', letterSpacing: '1.5px', color: t.textFaint, fontWeight: '700', fontFamily: "'IBM Plex Mono', monospace" }}>VALUE</div>
        <div style={{ width: '24px' }} />
      </div>
      {headers.map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${t.borderSubtle}`, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = t.historyEntryHover}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <input placeholder="Content-Type" value={h.key} onChange={e => update(i, 'key', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontSize: '12px', padding: '9px 12px', fontFamily: "'IBM Plex Mono', monospace" }} />
          <div style={{ width: '1px', height: '20px', background: t.border, flexShrink: 0 }} />
          <input placeholder="application/json" value={h.value} onChange={e => update(i, 'value', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontSize: '12px', padding: '9px 12px', fontFamily: "'IBM Plex Mono', monospace" }} />
          <button onClick={() => removeRow(i)} style={{ background: 'transparent', border: 'none', color: t.textFaint, fontSize: '18px', cursor: 'pointer', padding: '0 10px', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
      ))}
      <button onClick={addRow} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '11px', cursor: 'pointer', padding: '10px 12px', textAlign: 'left', fontFamily: "'IBM Plex Mono', monospace" }}>
        + Add Header
      </button>
    </div>
  )
}