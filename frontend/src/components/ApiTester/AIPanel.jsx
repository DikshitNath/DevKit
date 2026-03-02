import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { generateBody, explainResponse } from '../../utils/aiService'
import { useTheme } from '../../context/ThemeContext'

export default function AIPanel({ request, response, onBodyGenerated }) {
  const { isDark, theme: t } = useTheme()
  const [description, setDescription] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeFeature, setActiveFeature] = useState(null)
  const [panelState, setPanelState] = useState('normal')

  const handle = async (feature) => {
    setLoading(true)
    setActiveFeature(feature)
    setOutput('')
    try {
      let result
      if (feature === 'generate') result = await generateBody(description)
      if (feature === 'explain') result = await explainResponse(request, response)

      if (feature === 'generate') {
        const formatted = JSON.stringify(JSON.parse(result), null, 2)
        setOutput(formatted)
        onBodyGenerated(result)
      } else {
        setOutput(result)
      }
    } catch (err) {
      setOutput('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleMinimize = () => setPanelState(s => s === 'minimized' ? 'normal' : 'minimized')
  const toggleMaximize = () => setPanelState(s => s === 'maximized' ? 'normal' : 'maximized')
  const isMaximized = panelState === 'maximized'

  const mdCodeColor = isDark ? '#a78bfa' : '#6366f1'
  const mdTextColor = isDark ? '#c4c4d4' : '#444466'
  const mdCodeBg = isDark ? '#0a0a12' : '#f0f0f8'
  const mdInlineBg = isDark ? '#1e1e30' : '#ebebf8'

  return (
    <div style={{
      borderTop: `1px solid ${t.border}`,
      background: t.aiPanelBg,
      transition: 'background 0.3s ease, border-color 0.3s ease',
      ...(isMaximized ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' } : {}),
    }}>

      {/* Header */}
      <div style={{ padding: '10px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#a78bfa', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
          ✦ AI Assistant
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={toggleMaximize} style={{ background: 'transparent', border: 'none', color: t.textMuted, fontSize: '11px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", padding: '2px 6px', borderRadius: '4px' }}>
            {isMaximized ? '⊡ Restore' : '⊞ Maximize'}
          </button>
          <div style={{ width: '1px', height: '12px', background: t.border }} />
          <button onClick={toggleMinimize} style={{ background: 'transparent', border: 'none', color: t.textMuted, fontSize: '11px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", padding: '2px 6px', borderRadius: '4px' }}>
            {panelState === 'minimized' ? '▲ Expand' : '▼ Minimize'}
          </button>
        </div>
      </div>

      {panelState !== 'minimized' && (
        <div style={{ display: 'flex', flexDirection: 'column', ...(isMaximized ? { flex: 1, overflow: 'hidden' } : {}) }}>

          {/* Generate Body */}
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
            <div style={{ fontSize: '11px', color: t.textMuted, marginBottom: '8px', fontFamily: "'IBM Plex Mono', monospace" }}>Generate Request Body</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                placeholder='e.g. "create a user with name John and age 25"'
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && description && handle('generate')}
                style={{ flex: 1, background: t.aiInputBg, border: `1px solid ${t.border}`, borderRadius: '7px', color: t.text, fontSize: '12px', padding: '8px 12px', outline: 'none', fontFamily: "'IBM Plex Mono', monospace", transition: 'background 0.3s ease, border-color 0.3s ease' }}
              />
              <button
                onClick={() => handle('generate')}
                disabled={loading || !description}
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", fontWeight: '600', whiteSpace: 'nowrap', opacity: loading || !description ? 0.5 : 1, cursor: loading || !description ? 'not-allowed' : 'pointer', boxShadow: '0 0 16px rgba(99,102,241,0.2)' }}>
                {loading && activeFeature === 'generate' ? '⏳ Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Explain button */}
          {response && (
            <div style={{ display: 'flex', gap: '8px', padding: '10px 20px', borderBottom: `1px solid ${t.border}`, alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={() => handle('explain')}
                disabled={loading}
                style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: '#a78bfa', fontSize: '12px', padding: '7px 14px', fontFamily: "'IBM Plex Mono', monospace", cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.15s' }}>
                {loading && activeFeature === 'explain' ? '⏳ Explaining...' : '💡 Explain Response'}
              </button>
            </div>
          )}

          {/* Output */}
          {output && (
            <div style={{ margin: '12px 20px', background: t.outputBg, border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', ...(isMaximized ? { flex: 1, maxHeight: 'none' } : { maxHeight: '220px' }), transition: 'background 0.3s ease, border-color 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${t.border}`, background: t.outputHeaderBg, flexShrink: 0, transition: 'background 0.3s ease' }}>
                <span style={{ fontSize: '10px', letterSpacing: '1px', color: t.textMuted, fontWeight: '700', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
                  {activeFeature === 'generate' ? 'Generated JSON' : 'AI Explanation'}
                </span>
                <button onClick={() => navigator.clipboard.writeText(output)} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '11px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace" }}>
                  ⎘ Copy
                </button>
              </div>
              <div style={{ overflowY: 'auto', padding: '12px', ...(isMaximized ? { flex: 1 } : { maxHeight: '180px' }) }}>
                {activeFeature === 'generate' ? (
                  <pre style={{ color: t.textMuted, fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>{output}</pre>
                ) : (
                  <div style={{ color: mdTextColor, fontSize: '13px', lineHeight: '1.7' }}>
                    <ReactMarkdown components={{
                      h1: ({ children }) => <h1 style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '700', marginBottom: '8px', paddingBottom: '6px', borderBottom: `1px solid ${t.border}` }}>{children}</h1>,
                      h2: ({ children }) => <h2 style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '700', margin: '12px 0 6px' }}>{children}</h2>,
                      h3: ({ children }) => <h3 style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '600', margin: '10px 0 4px' }}>{children}</h3>,
                      p: ({ children }) => <p style={{ margin: '6px 0', color: mdTextColor }}>{children}</p>,
                      code: ({ className, children }) => {
                        const isInline = !className && !String(children).includes('\n')
                        return isInline
                          ? <code style={{ background: mdInlineBg, color: '#fb923c', padding: '1px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace" }}>{children}</code>
                          : <pre style={{ background: mdCodeBg, border: `1px solid ${t.border}`, borderRadius: '6px', padding: '10px 12px', margin: '8px 0', fontSize: '12px', color: mdCodeColor, overflowX: 'auto', fontFamily: "'IBM Plex Mono', monospace" }}><code>{children}</code></pre>
                      },
                      ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>{children}</ul>,
                      ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '6px 0' }}>{children}</ol>,
                      li: ({ children }) => <li style={{ margin: '4px 0', color: mdTextColor }}>{children}</li>,
                      strong: ({ children }) => <strong style={{ color: t.text, fontWeight: '600' }}>{children}</strong>,
                      hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${t.border}`, margin: '10px 0' }} />,
                    }}>
                      {output}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty / loading state */}
          {!output && (
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <p style={{ color: t.textFaint, fontSize: '11px', textAlign: 'center', lineHeight: '1.6', fontFamily: "'IBM Plex Mono', monospace" }}>
                {loading ? '✦ AI is thinking...' : response ? 'Generate a request body or explain the response using AI' : 'Send a request first, then use AI to explain the response'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}