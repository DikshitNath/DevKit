import { useState, useEffect } from 'react'
import SnippetList from './SnippetList'
import SnippetEditor from './SnippetEditor'
import SnippetSidebar from './SnippetSidebar'
import { getSnippets, createSnippet, updateSnippet, deleteSnippet } from '../../utils/snippetService'
import { useAuth } from '../../context/AuthContext'

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

  useEffect(() => { fetchSnippets() }, [])

  const fetchSnippets = async () => {
    try {
      const data = await getSnippets()
      setSnippets(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    setSelected({ ...defaultSnippet, isNew: true })
  }

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
    <div style={styles.root}>
      <SnippetSidebar
        user={user}
        filter={filter}
        filterTag={filterTag}
        filterLang={filterLang}
        allTags={allTags}
        allLangs={allLangs}
        onFilter={setFilter}
        onFilterTag={setFilterTag}
        onFilterLang={setFilterLang}
        onNew={handleNew}
        onLogout={logout}
      />
      <SnippetList
        snippets={filteredSnippets}
        selected={selected}
        loading={loading}
        onSelect={setSelected}
        onNew={handleNew}
      />
      <SnippetEditor
        snippet={selected}
        saving={saving}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3d; border-radius: 4px; }
        select option { background: #1a1a2e; }
      `}</style>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    background: '#0f0f17',
    color: '#e2e2f0',
    fontFamily: "'IBM Plex Sans', sans-serif",
    overflow: 'hidden',
  }
}