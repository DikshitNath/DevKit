import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { generateBody, explainResponse } from '../../utils/aiService'

export default function AIPanel({ request, response, onBodyGenerated }) {
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

  return (
    <div style={{
      ...styles.container,
      ...(isMaximized ? styles.maximized : {})
    }}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>✦ AI Assistant</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={toggleMaximize} style={styles.toggleBtn}>
            {isMaximized ? '⊡ Restore' : '⊞ Maximize'}
          </button>
          <div style={styles.headerDivider} />
          <button onClick={toggleMinimize} style={styles.toggleBtn}>
            {panelState === 'minimized' ? '▲ Expand' : '▼ Minimize'}
          </button>
        </div>
      </div>

      {panelState !== 'minimized' && (
        <div style={{
          ...styles.content,
          ...(isMaximized ? styles.contentMaximized : {})
        }}>
          {/* Generate Body */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Generate Request Body</div>
            <div style={styles.inputRow}>
              <input
                placeholder='e.g. "create a user with name John and age 25"'
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && description && handle('generate')}
                style={styles.input}
              />
              <button
                onClick={() => handle('generate')}
                disabled={loading || !description}
                style={{
                  ...styles.btn,
                  opacity: loading || !description ? 0.5 : 1,
                  cursor: loading || !description ? 'not-allowed' : 'pointer'
                }}>
                {loading && activeFeature === 'generate' ? '⏳ Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Explain button */}
          {response && (
            <div style={styles.actionRow}>
              <button
                onClick={() => handle('explain')}
                disabled={loading}
                style={{
                  ...styles.actionBtn,
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                {loading && activeFeature === 'explain' ? '⏳ Explaining...' : '💡 Explain Response'}
              </button>
            </div>
          )}

          {/* Output */}
          {output && (
            <div style={{
              ...styles.output,
              ...(isMaximized ? styles.outputMaximized : {})
            }}>
              <div style={styles.outputHeader}>
                <span style={styles.outputLabel}>
                  {activeFeature === 'generate' ? 'Generated JSON' : 'AI Explanation'}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  style={styles.copyBtn}>
                  ⎘ Copy
                </button>
              </div>

              <div style={{
                ...styles.outputBody,
                ...(isMaximized ? styles.outputBodyMaximized : {})
              }}>
                {activeFeature === 'generate' ? (
                  <pre style={styles.outputText}>{output}</pre>
                ) : (
                  <div style={styles.markdown}>
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 style={styles.mdH1}>{children}</h1>,
                        h2: ({ children }) => <h2 style={styles.mdH2}>{children}</h2>,
                        h3: ({ children }) => <h3 style={styles.mdH3}>{children}</h3>,
                        p: ({ children }) => <p style={styles.mdP}>{children}</p>,
                        code: ({ node, className, children }) => {
                          const isInline = !className && !String(children).includes('\n')
                          return isInline
                            ? <code style={styles.mdInlineCode}>{children}</code>
                            : <pre style={styles.mdCodeBlock}><code>{children}</code></pre>
                        },
                        ul: ({ children }) => <ul style={styles.mdUl}>{children}</ul>,
                        ol: ({ children }) => <ol style={styles.mdOl}>{children}</ol>,
                        li: ({ children }) => <li style={styles.mdLi}>{children}</li>,
                        strong: ({ children }) => <strong style={styles.mdStrong}>{children}</strong>,
                        hr: () => <hr style={styles.mdHr} />,
                      }}>
                      {output}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!output && !loading && (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>
                {response
                  ? 'Generate a request body or explain the response using AI'
                  : 'Send a request first, then use AI to explain the response'}
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>✦ AI is thinking...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    borderTop: '1px solid #1e1e30',
    background: '#0d0d18',
  },
  maximized: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    background: '#0d0d18',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '10px 20px',
    borderBottom: '1px solid #1e1e30',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#a78bfa',
    textTransform: 'uppercase',
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: '#555',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.3px',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  headerDivider: {
    width: '1px',
    height: '12px',
    background: '#1e1e30',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  contentMaximized: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    padding: '12px 20px',
    borderBottom: '1px solid #1e1e30',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: '11px',
    color: '#6666aa',
    marginBottom: '8px',
    letterSpacing: '0.3px',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    background: '#11111c',
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    color: '#e2e2e2',
    fontSize: '12px',
    padding: '8px 12px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  btn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontFamily: 'inherit',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    padding: '12px 20px',
    borderBottom: '1px solid #1e1e30',
    alignItems: 'center',
    flexShrink: 0,
  },
  actionBtn: {
    background: '#11111c',
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    color: '#a78bfa',
    fontSize: '12px',
    padding: '7px 14px',
    fontFamily: 'inherit',
  },
  output: {
    margin: '12px 20px',
    background: '#11111c',
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    overflow: 'hidden',
    maxHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
  },
  outputMaximized: {
    flex: 1,
    maxHeight: 'none',
    margin: '12px 20px',
    overflow: 'hidden',
  },
  outputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #1e1e30',
    background: '#0d0d14',
    flexShrink: 0,
  },
  outputLabel: {
    fontSize: '10px',
    letterSpacing: '1px',
    color: '#6666aa',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  copyBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6366f1',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  outputBody: {
    overflowY: 'auto',
    maxHeight: '180px',
    padding: '12px',
  },
  outputBodyMaximized: {
    maxHeight: 'none',
    flex: 1,
    height: 'calc(100vh - 200px)',
    overflowY: 'auto',
  },
  outputText: {
    color: '#ccc',
    fontSize: '12px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    fontFamily: "'JetBrains Mono', monospace",
    margin: 0,
  },
  markdown: {
    color: '#ccc',
    fontSize: '13px',
    lineHeight: '1.7',
  },
  mdH1: {
    color: '#a78bfa',
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: '1px solid #1e1e30',
  },
  mdH2: {
    color: '#a78bfa',
    fontSize: '14px',
    fontWeight: '700',
    margin: '12px 0 6px',
  },
  mdH3: {
    color: '#a78bfa',
    fontSize: '13px',
    fontWeight: '600',
    margin: '10px 0 4px',
  },
  mdP: {
    margin: '6px 0',
    color: '#ccc',
  },
  mdInlineCode: {
    background: '#1e1e30',
    color: '#fb923c',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  mdCodeBlock: {
    background: '#0a0a12',
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    padding: '10px 12px',
    margin: '8px 0',
    fontSize: '12px',
    color: '#a78bfa',
    overflowX: 'auto',
    fontFamily: "'JetBrains Mono', monospace",
  },
  mdUl: {
    paddingLeft: '20px',
    margin: '6px 0',
  },
  mdOl: {
    paddingLeft: '20px',
    margin: '6px 0',
  },
  mdLi: {
    margin: '4px 0',
    color: '#ccc',
  },
  mdStrong: {
    color: '#e2e2e2',
    fontWeight: '600',
  },
  mdHr: {
    border: 'none',
    borderTop: '1px solid #1e1e30',
    margin: '10px 0',
  },
  emptyState: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#333',
    fontSize: '11px',
    textAlign: 'center',
    lineHeight: '1.6',
  }
}