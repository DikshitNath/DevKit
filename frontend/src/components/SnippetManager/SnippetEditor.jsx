import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import AISnippetGenerator from './AISnippetGenerator'

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'css', 'html', 'json', 'bash', 'sql']

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

export default function SnippetEditor({ snippet, saving, onSave, onDelete }) {
  const [form, setForm] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const formRef = useRef(form)

  useEffect(() => {
    formRef.current = form
  }, [form])

  useEffect(() => {
    if (snippet) {
      setForm({ ...snippet, tags: Array.isArray(snippet.tags) ? snippet.tags : [] })
    } else {
      setForm(null)
    }
    setShowAI(false)
  }, [snippet])

  if (!form) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyGraphic}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M8 6L3 12L8 18M16 6L21 12L16 18" stroke="#2a2a45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={styles.emptyTitle}>No snippet selected</p>
        <p style={styles.emptyHint}>Select a snippet from the list or create a new one</p>
      </div>
    )
  }

  const update = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      formRef.current = updated
      return updated
    })
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (!tag) return
    const currentTags = Array.isArray(formRef.current?.tags) ? formRef.current.tags : []
    if (!currentTags.includes(tag)) {
      update('tags', [...currentTags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag) => {
    const currentTags = Array.isArray(formRef.current?.tags) ? formRef.current.tags : []
    update('tags', currentTags.filter(t => t !== tag))
  }

  const handleSave = () => onSave(formRef.current)

  const copy = () => {
    navigator.clipboard.writeText(form.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isModified = JSON.stringify(form) !== JSON.stringify(snippet)
  const langColor = LANG_COLORS[form.language] || '#888'

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        {/* File name */}
        <div style={styles.fileInfo}>
          <div style={styles.fileIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            placeholder="Untitled Snippet"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            style={styles.titleInput}
          />
        </div>

        {/* Language selector */}
        <div style={styles.langSelector}>
          <button
            onClick={() => setShowLangDropdown(s => !s)}
            style={styles.langBtn}>
            <span style={{ ...styles.langDot, background: langColor }} />
            {form.language}
            <span style={styles.langChevron}>▾</span>
          </button>
          {showLangDropdown && (
            <div style={styles.langDropdown}>
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  onClick={() => { update('language', l); setShowLangDropdown(false) }}
                  style={{
                    ...styles.langOption,
                    ...(form.language === l ? styles.langOptionActive : {})
                  }}>
                  <span style={{ ...styles.langDot, background: LANG_COLORS[l] || '#888' }} />
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {/* Public toggle */}
          <button
            onClick={() => update('isPublic', !form.isPublic)}
            style={{
              ...styles.actionBtn,
              ...(form.isPublic ? styles.actionBtnActive : {})
            }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {form.isPublic ? 'Public' : 'Share'}
          </button>

          <button onClick={copy} style={styles.actionBtn}>
            {copied ? (
              <>✓ Copied</>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Copy
              </>
            )}
          </button>

          {!form.isNew && (
            <button onClick={() => onDelete(form._id)} style={styles.deleteBtn}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19 6L18.1245 19.1334C18.0544 20.1289 17.2309 20.9 16.2334 20.9H7.76659C6.76909 20.9 5.94563 20.1289 5.87555 19.1334L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || (!isModified && !form.isNew)}
            style={{
              ...styles.saveBtn,
              opacity: saving || (!isModified && !form.isNew) ? 0.5 : 1,
              cursor: saving || (!isModified && !form.isNew) ? 'not-allowed' : 'pointer'
            }}>
            {saving ? 'Saving...' : form.isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tags Bar */}
      <div style={styles.tagsBar}>
        <div style={styles.tagsRow}>
          {form.tags?.map(tag => (
            <span key={tag} style={styles.tag}>
              #{tag}
              <button onClick={() => removeTag(tag)} style={styles.tagRemove}>×</button>
            </span>
          ))}
          <input
            placeholder="Add tag..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            style={styles.tagInput}
          />
          {tagInput && (
            <button onClick={addTag} style={styles.tagAddBtn}>Add</button>
          )}
        </div>

        {/* AI Button */}
        <button
          onClick={() => setShowAI(s => !s)}
          style={{
            ...styles.aiBtn,
            ...(showAI ? styles.aiBtnActive : {})
          }}>
          <span style={styles.aiStar}>✦</span>
          Ask AI
        </button>
      </div>

      {/* AI Panel */}
      {showAI && (
        <AISnippetGenerator
          language={form.language}
          onGenerate={(code) => {
            update('code', code)
            setShowAI(false)
          }}
        />
      )}

      {/* Monaco Editor */}
      <div style={styles.editorWrapper}>
        <Editor
          height="100%"
          language={form.language}
          value={form.code}
          onChange={(val) => update('code', val || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 20, bottom: 20 },
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            bracketPairColorization: { enabled: true },
            lineHeight: 22,
          }}
        />
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <span style={styles.statusItem}>
          <span style={{ ...styles.statusDot, background: langColor }} />
          {form.language}
        </span>
        <span style={styles.statusItem}>
          {form.code?.split('\n').length} lines
        </span>
        {isModified && <span style={{ ...styles.statusItem, color: '#f59e0b' }}>● Unsaved changes</span>}
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
    background: '#0f0f17',
    position: 'relative',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: '#0f0f17',
  },
  emptyGraphic: {
    opacity: 0.4,
    marginBottom: '8px',
  },
  emptyTitle: {
    color: '#3a3a5c',
    fontSize: '14px',
    fontWeight: '500',
  },
  emptyHint: {
    color: '#2a2a45',
    fontSize: '12px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 20px',
    borderBottom: '1px solid #1e1e30',
    background: '#0c0c14',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  fileIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  titleInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e2e2f0',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'inherit',
    minWidth: 0,
  },
  langSelector: {
    position: 'relative',
    flexShrink: 0,
  },
  langBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    color: '#8888bb',
    fontSize: '12px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  langDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  langChevron: {
    fontSize: '10px',
    opacity: 0.5,
  },
  langDropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 0,
    background: '#16162a',
    border: '1px solid #1e1e30',
    borderRadius: '8px',
    padding: '4px',
    zIndex: 100,
    minWidth: '140px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  langOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#8888bb',
    fontSize: '12px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  langOptionActive: {
    background: '#1e1e35',
    color: '#e2e2f0',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'transparent',
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    color: '#6666aa',
    fontSize: '12px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  actionBtnActive: {
    background: '#22c55e18',
    border: '1px solid #22c55e33',
    color: '#4ade80',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    border: '1px solid #ef444422',
    borderRadius: '6px',
    color: '#f87171',
    padding: '5px 8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 16px',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'inherit',
  },
  tagsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 20px',
    borderBottom: '1px solid #1e1e30',
    background: '#0c0c14',
    gap: '12px',
    minHeight: '44px',
  },
  tagsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    flex: 1,
  },
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    background: '#1e1e35',
    border: '1px solid #2a2a45',
    borderRadius: '20px',
    color: '#8888bb',
    fontSize: '11px',
    padding: '2px 8px',
  },
  tagRemove: {
    background: 'transparent',
    border: 'none',
    color: '#4a4a7a',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    lineHeight: 1,
  },
  tagInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#6666aa',
    fontSize: '12px',
    fontFamily: 'inherit',
    width: '90px',
  },
  tagAddBtn: {
    background: 'transparent',
    border: '1px solid #1e1e30',
    borderRadius: '4px',
    color: '#4f46e5',
    fontSize: '11px',
    cursor: 'pointer',
    padding: '2px 7px',
    fontFamily: 'inherit',
  },
  aiBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'transparent',
    border: '1px solid #2a2a45',
    borderRadius: '6px',
    color: '#6666aa',
    fontSize: '12px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  aiBtnActive: {
    background: '#4f46e518',
    border: '1px solid #4f46e544',
    color: '#a78bfa',
  },
  aiStar: {
    fontSize: '10px',
    color: '#a78bfa',
  },
  editorWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '4px 20px',
    background: '#0c0c14',
    borderTop: '1px solid #1e1e30',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: '#3a3a5c',
  },
  statusDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
  },
}