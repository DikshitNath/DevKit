import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getSnippets, createSnippet, updateSnippet, deleteSnippet } from '../../utils/snippetService'
import SnippetList from './SnippetList'
import SnippetEditor from './SnippetEditor'
import SnippetSidebar from './SnippetSidebar'

const defaultSnippet = {
  title: 'Untitled Snippet',
  code: '// Start coding here\n',
  language: 'javascript',
  tags: [],
  isPublic: false,
}

export default function SnippetManager() {
  const [snippets, setSnippets] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')
  const [filterTag, setFilterTag] = useState('')
  const [filterLang, setFilterLang] = useState('')
  const { user, logout } = useAuth()
  const { isDark, theme: t, toggleTheme } = useTheme()

  useEffect(() => { fetchSnippets() }, [])

  const fetchSnippets = async () => {
    try {
      const data = await getSnippets()
      setSnippets(data || []) 
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => setSelected({ ...defaultSnippet, isNew: true })

  const handleSave = async (snippetData) => {
    setSaving(true)
    try {
      if (snippetData.isNew) {
        const { isNew, ...data } = snippetData
        const created = await createSnippet(data)
        setSnippets(prev => [created, ...prev])
        setSelected(created)
      } else {
        const updated = await updateSnippet(snippetData._id, snippetData)
        setSnippets(prev => prev.map(s => s._id === updated._id ? updated : s))
        setSelected(updated)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSnippet(id)
      setSnippets(prev => prev.filter(s => s._id !== id))
      setSelected(null)
    } catch (err) {
      console.error(err)
    }
  }

  const allTags = [...new Set(snippets.flatMap(s => s.tags || []))]
  const allLangs = [...new Set(snippets.map(s => s.language).filter(Boolean))]

  const filteredSnippets = snippets.filter(s => {
    if (filter === 'public' && !s.isPublic) return false
    if (filter === 'private' && s.isPublic) return false
    if (filterTag && !s.tags?.includes(filterTag)) return false
    if (filterLang && s.language !== filterLang) return false
    return true
  })

  return (
    <div style={{ ...styles.root, background: t.page, color: t.text }}>

      {/* Dot grid */}
      <div style={{ ...styles.dotGrid, backgroundImage: `radial-gradient(circle, ${t.dot} 1px, transparent 1px)` }} />

      {/* Glow orbs — dark only */}
      {isDark && (
        <>
          <div style={styles.orb1} />
          <div style={styles.orb2} />
        </>
      )}

      <SnippetSidebar
        user={user} filter={filter} filterTag={filterTag} filterLang={filterLang}
        allTags={allTags} allLangs={allLangs}
        onFilter={setFilter} onFilterTag={setFilterTag} onFilterLang={setFilterLang}
        onNew={handleNew} onLogout={logout}
      />
      <SnippetList
        snippets={filteredSnippets} selected={selected} loading={loading}
        onSelect={setSelected} onNew={handleNew}
      />
      <SnippetEditor
        snippet={selected} saving={saving}
        onSave={handleSave} onDelete={handleDelete}
      />

      {/* Floating theme toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{ position: 'fixed', bottom: '28px', right: '28px', width: '44px', height: '44px', borderRadius: '50%', background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, boxShadow: t.toggleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 999, fontSize: '19px', transition: 'all 0.3s ease', backdropFilter: 'blur(8px)' }}>
        {isDark ? '☀️' : '🌙'}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#1e1e30' : '#d0d0e8'}; border-radius: 4px; }
        select option { background: ${isDark ? '#0c0c18' : '#ffffff'}; color: ${isDark ? '#e2e2f0' : '#1a1a2e'}; }
        input::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
        textarea::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.05)} }
      `}</style>
    </div>
  )
}

const styles = {
  root: { display: 'flex', height: '100vh', fontFamily: "'Syne', sans-serif", overflow: 'hidden', position: 'relative', transition: 'background 0.3s ease, color 0.3s ease' },
  dotGrid: { position: 'fixed', inset: 0, backgroundSize: '28px 28px', opacity: 0.55, pointerEvents: 'none', zIndex: 0 },
  orb1: { position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 8s ease-in-out infinite', zIndex: 0 },
  orb2: { position: 'fixed', bottom: '-20%', left: '20%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 10s ease-in-out infinite 2s', zIndex: 0 },
}