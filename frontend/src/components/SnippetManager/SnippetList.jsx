import { useState } from 'react'
import Fuse from 'fuse.js'

const LANG_COLORS = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3572A5',
  java: '#b07219',
  cpp: '#f34b7d',
  css: '#563d7c',
  html: '#e34c26',
  json: '#40d080',
  bash: '#89e051',
  sql: '#e38c00',
}

const LANG_SHORT = {
  javascript: 'JS',
  typescript: 'TS',
  python: 'PY',
  java: 'JV',
  cpp: 'C+',
  css: 'CSS',
  html: 'HTML',
  json: 'JSON',
  bash: 'SH',
  sql: 'SQL',
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function SnippetList({ snippets, selected, loading, onSelect, onNew }) {
  const [search, setSearch] = useState('')

  const fuse = new Fuse(snippets, { keys: ['title', 'tags', 'language'], threshold: 0.4 })
  const filtered = search ? fuse.search(search).map(r => r.item) : snippets

  return (
    <div style={styles.panel}>
      {/* Search bar */}
      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#4a4a7a" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="#4a4a7a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
        <input
          placeholder="Search snippets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Count + Filter */}
      <div style={styles.listHeader}>
        <span style={styles.count}>
          {filtered.length} {filtered.length === 1 ? 'snippet' : 'snippets'}
        </span>
        <button style={styles.filterBtn} title="Filter">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21M7 12H17M11 18H13" stroke="#4a4a7a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* List */}
      <div style={styles.list}>
        {loading && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>⟳</div>
            <p style={styles.emptyText}>Loading snippets...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>{ }</div>
            <p style={styles.emptyText}>
              {search ? 'No snippets match your search' : 'No snippets yet'}
            </p>
            {!search && (
              <button onClick={onNew} style={styles.emptyBtn}>
                + Create your first snippet
              </button>
            )}
          </div>
        )}

        {filtered.map(snippet => (
          <SnippetCard
            key={snippet._id}
            snippet={snippet}
            isSelected={selected?._id === snippet._id}
            onClick={() => onSelect(snippet)}
          />
        ))}
      </div>
    </div>
  )
}

function SnippetCard({ snippet, isSelected, onClick }) {
  const color = LANG_COLORS[snippet.language] || '#888'
  const short = LANG_SHORT[snippet.language] || snippet.language?.slice(0, 2).toUpperCase()

  return (
    <div
      onClick={onClick}
      style={{
        ...styles.card,
        ...(isSelected ? styles.cardActive : {})
      }}
      onMouseEnter={e => {
        if (!isSelected) e.currentTarget.style.background = '#14141f'
      }}
      onMouseLeave={e => {
        if (!isSelected) e.currentTarget.style.background = 'transparent'
      }}>

      {/* Title */}
      <div style={styles.cardTitle}>
        {snippet.title || 'Untitled'}
        {snippet.isPublic && (
          <span style={styles.publicDot} title="Public" />
        )}
      </div>

      {/* Code preview */}
      <div style={styles.cardPreview}>
        {snippet.code?.split('\n').slice(0, 2).join(' ').slice(0, 80) || 'No code yet'}
      </div>

      {/* Footer */}
      <div style={styles.cardFooter}>
        <span style={{
          ...styles.langBadge,
          background: `${color}18`,
          color: color,
          border: `1px solid ${color}33`,
        }}>
          {short}
        </span>

        {snippet.tags?.slice(0, 2).map(tag => (
          <span key={tag} style={styles.tagBadge}>{tag}</span>
        ))}

        <span style={styles.cardTime}>
          {snippet.updatedAt ? timeAgo(snippet.updatedAt) : ''}
        </span>
      </div>
    </div>
  )
}

const styles = {
  panel: {
    width: '280px',
    minWidth: '280px',
    background: '#0f0f17',
    borderRight: '1px solid #1e1e30',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 16px',
    borderBottom: '1px solid #1e1e30',
  },
  searchIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e2e2f0',
    fontSize: '13px',
    fontFamily: 'inherit',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid #1e1e30',
  },
  count: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#3a3a5c',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  filterBtn: {
    background: 'transparent',
    border: 'none',
    color: '#4a4a7a',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
  },
  card: {
    padding: '14px 16px',
    borderBottom: '1px solid #13131e',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  cardActive: {
    background: '#16162a',
    borderLeft: '2px solid #4f46e5',
    paddingLeft: '14px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e2e2f0',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  publicDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#4ade80',
    flexShrink: 0,
  },
  cardPreview: {
    fontSize: '11px',
    color: '#3a3a5c',
    fontFamily: "'IBM Plex Mono', monospace",
    marginBottom: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    flexWrap: 'wrap',
  },
  langBadge: {
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  tagBadge: {
    fontSize: '10px',
    color: '#4a4a7a',
    background: '#1e1e30',
    borderRadius: '4px',
    padding: '1px 5px',
  },
  cardTime: {
    fontSize: '10px',
    color: '#2a2a45',
    marginLeft: 'auto',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    gap: '8px',
  },
  emptyIcon: {
    fontSize: '28px',
    opacity: 0.2,
    marginBottom: '4px',
  },
  emptyText: {
    color: '#3a3a5c',
    fontSize: '12px',
    textAlign: 'center',
  },
  emptyBtn: {
    background: 'transparent',
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    color: '#4f46e5',
    fontSize: '12px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '8px',
  }
}