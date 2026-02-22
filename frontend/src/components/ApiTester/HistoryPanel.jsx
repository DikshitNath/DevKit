import { getHistory, deleteFromHistory, clearHistory } from '../../utils/historyManager'

const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#6366f1',
  PUT: '#f59e0b',
  PATCH: '#f97316',
  DELETE: '#ef4444',
}

export default function HistoryPanel({ t, onSelect, refresh }) {
  const history = getHistory()

  const groupByDate = (entries) => {
    const groups = {}
    entries.forEach(entry => {
      const date = new Date(entry.timestamp)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      let label
      if (date.toDateString() === today.toDateString()) label = 'TODAY'
      else if (date.toDateString() === yesterday.toDateString()) label = 'YESTERDAY'
      else label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
      if (!groups[label]) groups[label] = []
      groups[label].push(entry)
    })
    return groups
  }

  const grouped = groupByDate(history)

  if (history.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: '6px' }}>
        <div style={{ fontSize: '22px', opacity: 0.2, marginBottom: '4px' }}>🕐</div>
        <p style={{ color: t.textDim, fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace" }}>No requests yet</p>
        <p style={{ color: t.textFaint, fontSize: '10px', fontFamily: "'IBM Plex Mono', monospace" }}>Your history will appear here</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Clear all */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px' }}>
        <button onClick={() => { clearHistory(); refresh() }} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", opacity: 0.6, letterSpacing: '0.3px' }}>
          Clear all
        </button>
      </div>

      {Object.entries(grouped).map(([label, entries]) => (
        <div key={label}>
          <div style={{ padding: '8px 16px 4px', fontSize: '10px', letterSpacing: '2px', color: t.textFaint, fontWeight: '600', fontFamily: "'IBM Plex Mono', monospace" }}>{label}</div>
          {entries.map(entry => (
            <HistoryEntry key={entry.id} t={t} entry={entry} onSelect={onSelect} onDelete={() => { deleteFromHistory(entry.id); refresh() }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function HistoryEntry({ t, entry, onSelect, onDelete }) {
  const { request, response } = entry
  const isSuccess = response.status >= 200 && response.status < 300
  const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  let displayUrl = request.url
  try {
    const u = new URL(request.url)
    displayUrl = u.pathname || request.url
  } catch {}

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s', borderBottom: `1px solid ${t.borderSubtle}` }}
      onClick={() => onSelect(entry)}
      onMouseEnter={e => e.currentTarget.style.background = t.historyEntryHover}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px', color: METHOD_COLORS[request.method], fontFamily: "'IBM Plex Mono', monospace" }}>
            {request.method}
          </span>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isSuccess ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', fontWeight: '600', color: isSuccess ? '#4ade80' : '#f87171', fontFamily: "'IBM Plex Mono', monospace" }}>
            {response.status}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: t.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px', fontFamily: "'IBM Plex Mono', monospace" }}>{displayUrl}</div>
        <div style={{ fontSize: '10px', color: t.textFaint, fontFamily: "'IBM Plex Mono', monospace" }}>{time}</div>
      </div>

      <button onClick={(e) => { e.stopPropagation(); onDelete() }} style={{ background: 'transparent', border: 'none', color: t.textFaint, fontSize: '18px', cursor: 'pointer', padding: '0 4px', lineHeight: 1, transition: 'color 0.15s', flexShrink: 0 }}>×</button>
    </div>
  )
}