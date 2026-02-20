import { getHistory, deleteFromHistory, clearHistory } from '../../utils/historyManager'

const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#f97316',
  DELETE: '#ef4444'
}

export default function HistoryPanel({ onSelect, refresh }) {
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
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🕐</div>
        <p style={styles.emptyText}>No requests yet</p>
        <p style={styles.emptyHint}>Your history will appear here</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Clear all */}
      <div style={styles.clearRow}>
        <button
          onClick={() => { clearHistory(); refresh() }}
          style={styles.clearBtn}>
          Clear all
        </button>
      </div>

      {Object.entries(grouped).map(([label, entries]) => (
        <div key={label}>
          <div style={styles.groupLabel}>{label}</div>
          {entries.map(entry => (
            <HistoryEntry
              key={entry.id}
              entry={entry}
              onSelect={onSelect}
              onDelete={() => { deleteFromHistory(entry.id); refresh() }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function HistoryEntry({ entry, onSelect, onDelete }) {
  const { request, response } = entry
  const isSuccess = response.status >= 200 && response.status < 300
  const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })

  // Extract path from URL
  let displayUrl = request.url
  try {
    const u = new URL(request.url)
    displayUrl = u.pathname || request.url
  } catch {}

  return (
    <div
      style={styles.entry}
      onClick={() => onSelect(entry)}
      onMouseEnter={e => e.currentTarget.style.background = '#1a1a2e'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      <div style={styles.entryLeft}>
        <div style={styles.entryTop}>
          <span style={{ ...styles.methodBadge, color: METHOD_COLORS[request.method] }}>
            {request.method}
          </span>
          <span style={{
            ...styles.statusDot,
            background: isSuccess ? '#22c55e' : '#ef4444'
          }} />
          <span style={{ ...styles.statusText, color: isSuccess ? '#4ade80' : '#f87171' }}>
            {response.status}
          </span>
        </div>
        <div style={styles.entryUrl}>{displayUrl}</div>
        <div style={styles.entryTime}>{time}</div>
      </div>

      <button
        style={styles.deleteBtn}
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        title="Remove">
        ×
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  clearRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '6px 12px',
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    opacity: 0.7,
    letterSpacing: '0.3px',
  },
  groupLabel: {
    padding: '8px 16px 4px',
    fontSize: '11px',
    letterSpacing: '2px',
    color: '#6666aa',
    fontWeight: '700',
  },
  entry: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderBottom: '1px solid #0d0d14',
  },
  entryLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
    flex: 1,
  },
  entryTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  methodBadge: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  statusDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '10px',
    fontWeight: '600',
  },
  entryUrl: {
    fontSize: '11px',
    color: '#888',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  entryTime: {
    fontSize: '11px',
    color: '#6666aa',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#333',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    transition: 'color 0.15s',
    flexShrink: 0,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    gap: '6px',
  },
  emptyIcon: {
    fontSize: '24px',
    opacity: 0.3,
    marginBottom: '4px',
  },
  emptyText: {
    color: '#444',
    fontSize: '12px',
  },
  emptyHint: {
    color: '#333',
    fontSize: '10px',
  },
}