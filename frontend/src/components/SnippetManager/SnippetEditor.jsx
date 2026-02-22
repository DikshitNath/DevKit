import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import AISnippetGenerator from './AISnippetGenerator'

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'css', 'html', 'json', 'bash', 'sql']

const LANG_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3572A5',
  java: '#b07219', cpp: '#f34b7d', css: '#563d7c', html: '#e34c26',
  json: '#40d080', bash: '#89e051', sql: '#e38c00',
}

export default function SnippetEditor({ t, isDark, snippet, saving, onSave, onDelete }) {
  const [form, setForm] = useState(null)
  const [tagInput, setTagInput] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const formRef = useRef(form)

  useEffect(() => { formRef.current = form }, [form])

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
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        background: t.editor,
        position: 'relative',
        zIndex: 10,
        transition: 'background 0.3s ease',
      }}>
        <div style={{ opacity: 0.3, marginBottom: '8px' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M8 6L3 12L8 18M16 6L21 12L16 18" stroke={t.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ color: t.textDim, fontSize: '14px', fontWeight: '500' }}>No snippet selected</p>
        <p style={{ color: t.textFaint, fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace" }}>
          Select a snippet or create a new one
        </p>
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
    if (!currentTags.includes(tag)) update('tags', [...currentTags, tag])
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
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: t.editor,
      position: 'relative',
      zIndex: 10,
      transition: 'background 0.3s ease',
    }}>

      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderBottom: `1px solid ${t.border}`,
        background: t.editorBar,
        backdropFilter: 'blur(8px)',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        {/* File icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            placeholder="Untitled Snippet"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: t.text,
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: "'Syne', sans-serif",
              minWidth: 0,
            }}
          />
        </div>

        {/* Language selector */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowLangDropdown(s => !s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: `1px solid ${t.border}`,
              borderRadius: '6px',
              color: t.textMuted,
              fontSize: '12px',
              padding: '5px 10px',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
              transition: 'border-color 0.15s',
            }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: langColor, flexShrink: 0 }} />
            {form.language}
            <span style={{ fontSize: '9px', color: t.textFaint }}>▾</span>
          </button>
          {showLangDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              background: t.dropdownBg,
              border: `1px solid ${t.border}`,
              borderRadius: '10px',
              padding: '4px',
              zIndex: 200,
              minWidth: '150px',
              boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
            }}>
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  onClick={() => { update('language', l); setShowLangDropdown(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    background: form.language === l ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: form.language === l ? '#a78bfa' : t.textMuted,
                    fontSize: '12px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontFamily: "'IBM Plex Mono', monospace",
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: LANG_COLORS[l] || '#888', flexShrink: 0 }} />
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Public toggle */}
          <button
            onClick={() => update('isPublic', !form.isPublic)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: form.isPublic ? '#22c55e12' : 'transparent',
              border: `1px solid ${form.isPublic ? '#22c55e33' : t.border}`,
              borderRadius: '6px',
              color: form.isPublic ? '#4ade80' : t.textMuted,
              fontSize: '12px', padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {form.isPublic ? 'Public' : 'Share'}
          </button>

          {/* Copy */}
          <button onClick={copy} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'transparent', border: `1px solid ${t.border}`,
            borderRadius: '6px', color: copied ? '#4ade80' : t.textMuted,
            fontSize: '12px', padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}>
            {copied ? '✓ Copied' : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Copy
              </>
            )}
          </button>

          {/* Delete */}
          {!form.isNew && (
            <button onClick={() => onDelete(form._id)} style={{
              display: 'flex', alignItems: 'center',
              background: 'transparent', border: '1px solid #ef444422',
              borderRadius: '6px', color: '#f87171',
              padding: '5px 8px', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19 6L18.1245 19.1334C18.0544 20.1289 17.2309 20.9 16.2334 20.9H7.76659C6.76909 20.9 5.94563 20.1289 5.87555 19.1334L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || (!isModified && !form.isNew)}
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: '7px',
              padding: '6px 18px', fontSize: '12px', fontWeight: '600',
              fontFamily: 'inherit', boxShadow: '0 0 16px rgba(99,102,241,0.3)',
              transition: 'opacity 0.2s',
              opacity: saving || (!isModified && !form.isNew) ? 0.45 : 1,
              cursor: saving || (!isModified && !form.isNew) ? 'not-allowed' : 'pointer',
            }}>
            {saving ? 'Saving...' : form.isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tags Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 16px', borderBottom: `1px solid ${t.border}`,
        background: t.editorBar, gap: '12px', minHeight: '42px',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px', flex: 1 }}>
          {form.tags?.map(tag => (
            <span key={tag} style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              background: t.tagBg, border: `1px solid ${t.tagBorder}`,
              borderRadius: '20px', color: t.tagColor,
              fontSize: '11px', padding: '2px 8px',
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              #{tag}
              <button onClick={() => removeTag(tag)} style={{
                background: 'transparent', border: 'none', color: t.tagColor,
                cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1,
              }}>×</button>
            </span>
          ))}
          <input
            placeholder="Add tag..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: t.textMuted, fontSize: '12px',
              fontFamily: "'IBM Plex Mono', monospace", width: '90px',
            }}
          />
          {tagInput && (
            <button onClick={addTag} style={{
              background: 'transparent', border: `1px solid ${t.border}`,
              borderRadius: '4px', color: '#6366f1', fontSize: '11px',
              cursor: 'pointer', padding: '2px 7px', fontFamily: 'inherit',
            }}>Add</button>
          )}
        </div>

        {/* AI Button */}
        <button
          onClick={() => setShowAI(s => !s)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: showAI ? '#4f46e518' : 'transparent',
            border: `1px solid ${showAI ? '#4f46e544' : t.border}`,
            borderRadius: '7px', color: showAI ? '#a78bfa' : t.textMuted,
            fontSize: '12px', padding: '5px 11px', cursor: 'pointer',
            fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.15s',
          }}>
          <span style={{ fontSize: '10px', color: '#a78bfa' }}>✦</span>
          Ask AI
        </button>
      </div>

      {/* AI Panel */}
      {showAI && (
        <AISnippetGenerator
          language={form.language}
          onGenerate={(code) => { update('code', code); setShowAI(false) }}
        />
      )}

      {/* Monaco Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={form.language}
          value={form.code}
          onChange={(val) => update('code', val || '')}
          theme={isDark ? 'vs-dark' : 'light'}
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
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '4px 16px',
        background: t.statusBar,
        borderTop: `1px solid ${t.border}`,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: t.textDim, fontFamily: "'IBM Plex Mono', monospace" }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: langColor }} />
          {form.language}
        </span>
        <span style={{ fontSize: '11px', color: t.textDim, fontFamily: "'IBM Plex Mono', monospace" }}>
          {form.code?.split('\n').length} lines
        </span>
        {isModified && (
          <span style={{ fontSize: '11px', color: '#f59e0b', fontFamily: "'IBM Plex Mono', monospace" }}>
            ● Unsaved changes
          </span>
        )}
      </div>
    </div>
  )
}