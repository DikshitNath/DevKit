import { useState } from 'react'
import Fuse from 'fuse.js'
import { useTheme } from '../../context/ThemeContext'

const LANG_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3572A5',
  java: '#b07219', cpp: '#f34b7d', css: '#563d7c', html: '#e34c26',
  json: '#40d080', bash: '#89e051', sql: '#e38c00',
}

const LANG_SHORT = {
  javascript: 'JS', typescript: 'TS', python: 'PY', java: 'JV',
  cpp: 'C+', css: 'CSS', html: 'HTML', json: 'JSON', bash: 'SH', sql: 'SQL',
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
  const { theme: t } = useTheme()
  const [search, setSearch] = useState('')

  const fuse = new Fuse(snippets, { keys: ['title', 'tags', 'language'], threshold: 0.4 })
  const filtered = search ? fuse.search(search).map(r => r.item) : snippets

  return (
    <div style={{ width: '272px', minWidth: '272px', background: t.list, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10, transition: 'background 0.3s ease, border-color 0.3s ease' }}>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', borderBottom: `1px solid ${t.border}` }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: t.textMuted }}>
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input placeholder="Search snippets..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: t.text, fontSize: '13px', fontFamily: 'inherit' }} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0 }}>×</button>}
      </div>

      {/* Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: `1px solid ${t.border}` }}>
        <span style={{ fontSize: '10px', fontWeight: '600', color: t.textFaint, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
          {filtered.length} {filtered.length === 1 ? 'snippet' : 'snippets'}
        </span>
        <button style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21M7 12H17M11 18H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={styles.empty}>
            <div style={{ fontSize: '28px', marginBottom: '4px', color: t.textFaint }}>◌</div>
            <p style={{ fontSize: '12px', color: t.textDim, fontFamily: "'IBM Plex Mono', monospace" }}>Loading snippets...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={styles.empty}>
            <div style={{ opacity: 0.25, marginBottom: '4px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={t.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: '12px', color: t.textDim, textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace" }}>
              {search ? 'No snippets match your search' : 'No snippets yet'}
            </p>
            {!search && (
              <button onClick={onNew} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: '#6366f1', fontSize: '12px', padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' }}>
                + Create your first snippet
              </button>
            )}
          </div>
        )}

        {filtered.map(snippet => (
          <SnippetCard key={snippet._id} snippet={snippet} isSelected={selected?._id === snippet._id} onClick={() => onSelect(snippet)} />
        ))}
      </div>
    </div>
  )
}

function SnippetCard({ snippet, isSelected, onClick }) {
  const { theme: t } = useTheme()
  const [hovered, setHovered] = useState(false)
  const color = LANG_COLORS[snippet.language] || '#888'
  const short = LANG_SHORT[snippet.language] || snippet.language?.slice(0, 2).toUpperCase()

  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ padding: '13px 14px 13px 12px', borderBottom: `1px solid ${t.borderSubtle}`, cursor: 'pointer', transition: 'background 0.15s, border-left-color 0.15s', background: isSelected ? t.cardActive : hovered ? t.cardHover : 'transparent', borderLeft: isSelected ? '2px solid #6366f1' : '2px solid transparent' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
          {snippet.title || 'Untitled'}
        </span>
        {snippet.isPublic && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />}
      </div>

      <div style={{ fontSize: '11px', color: t.textFaint, fontFamily: "'IBM Plex Mono', monospace", marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {snippet.code?.split('\n').slice(0, 2).join(' ').slice(0, 80) || 'No code yet'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px', fontFamily: "'IBM Plex Mono', monospace", background: `${color}18`, color, border: `1px solid ${color}33` }}>
          {short}
        </span>
        {snippet.tags?.slice(0, 2).map(tag => (
          <span key={tag} style={{ fontSize: '10px', color: t.textMuted, border: `1px solid ${t.border}`, borderRadius: '20px', padding: '1px 6px', fontFamily: "'IBM Plex Mono', monospace" }}>#{tag}</span>
        ))}
        <span style={{ fontSize: '10px', color: t.textFaint, marginLeft: 'auto', fontFamily: "'IBM Plex Mono', monospace" }}>
          {snippet.updatedAt ? timeAgo(snippet.updatedAt) : ''}
        </span>
      </div>
    </div>
  )
}

const styles = {
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', gap: '8px' },
}