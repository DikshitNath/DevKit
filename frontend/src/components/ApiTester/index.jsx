import { useState } from 'react'
import { sendRequest } from '../../utils/apiTester'
import ResponseViewer from './ResponseViewer'
import HeadersEditor from './HeadersEditor'
import BodyEditor from './BodyEditor'
import { saveToHistory } from '../../utils/historyManager'
import HistoryPanel from './HistoryPanel'
import AIPanel from './AIPanel'

const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#f97316',
  DELETE: '#ef4444'
}

export default function ApiTester() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeTaken, setTimeTaken] = useState(null)
  const [historyKey, setHistoryKey] = useState(0)
  const [activeTab, setActiveTab] = useState('headers')

  const refresh = () => setHistoryKey(k => k + 1)

  const handleSend = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const result = await sendRequest({ url, method, headers, body })
      setResponse(result)
      setTimeTaken(result.timeTaken)
      saveToHistory({ url, method, headers, body }, result)
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFromHistory = (entry) => {
    setUrl(entry.request.url)
    setMethod(entry.request.method)
    setHeaders(entry.request.headers)
    setBody(entry.request.body || '')
    setResponse(entry.response)
    setTimeTaken(entry.response.timeTaken)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend()
  }

  return (
    <div style={styles.root}>
      {/* LEFT SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>⚡</div>
            <div>
              <div style={styles.logoTitle}>DevKit</div>
              <div style={styles.logoSub}>API Tester</div>
            </div>
          </div>
        </div>
        <div style={styles.historyLabel}>HISTORY</div>
        <div style={styles.historyScroll}>
          <HistoryPanel key={historyKey} onSelect={loadFromHistory} refresh={refresh} />
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main style={styles.main}>

        {/* TOP BAR */}
        <div style={styles.topBar}>
          <div style={styles.urlBar}>
            {/* Method Selector */}
            <div style={styles.methodWrapper}>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{ ...styles.methodSelect, color: METHOD_COLORS[method] }}>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div style={{ ...styles.methodDot, background: METHOD_COLORS[method] }} />
            </div>

            {/* URL Input */}
            <input
              type="text"
              placeholder="Enter request URL  (Ctrl+Enter to send)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.urlInput}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={loading || !url}
              style={{
                ...styles.sendBtn,
                opacity: loading || !url ? 0.5 : 1,
                cursor: loading || !url ? 'not-allowed' : 'pointer'
              }}>
              {loading ? (
                <span style={styles.spinner}>◌</span>
              ) : (
                <>Send <span style={styles.sendArrow}>→</span></>
              )}
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={styles.tabs}>
          {['headers', 'body'].map(tab => (
            (tab === 'body' && method === 'GET') ? null :
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {})
              }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'headers' && headers.filter(h => h.key).length > 0 && (
                <span style={styles.tabBadge}>{headers.filter(h => h.key).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div style={styles.tabContent}>
          {activeTab === 'headers' && (
            <HeadersEditor headers={headers} setHeaders={setHeaders} />
          )}
          {activeTab === 'body' && method !== 'GET' && (
            <BodyEditor body={body} setBody={setBody} />
          )}
        </div>

        {/* DIVIDER */}
        <div style={styles.divider} />

        {/* RESPONSE SECTION */}
        <div style={styles.responseSection}>
          <div style={styles.responseHeader}>
            <span style={styles.responseTitle}>Response</span>
            {response && (
              <div style={styles.responseMeta}>
                <span style={{
                  ...styles.statusBadge,
                  background: response.status >= 200 && response.status < 300 ? '#16a34a22' : '#dc262622',
                  color: response.status >= 200 && response.status < 300 ? '#4ade80' : '#f87171',
                  border: `1px solid ${response.status >= 200 && response.status < 300 ? '#16a34a44' : '#dc262644'}`
                }}>
                  {response.status} {response.statusText}
                </span>
                <span style={styles.metaChip}>{timeTaken}ms</span>
              </div>
            )}
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠</span> {error}
            </div>
          )}

          {!response && !error && !loading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>⚡</div>
              <p style={styles.emptyText}>Send a request to see the response</p>
              <p style={styles.emptyHint}>Press Ctrl+Enter or click Send</p>
            </div>
          )}

          {loading && (
            <div style={styles.emptyState}>
              <div style={{ ...styles.emptyIcon, animation: 'spin 1s linear infinite' }}>◌</div>
              <p style={styles.emptyText}>Sending request...</p>
            </div>
          )}

          {response && !loading && (
            <ResponseViewer response={response} timeTaken={timeTaken} />
          )}
        </div>
        <AIPanel
          request={{ url, method, headers, body }}
          response={response}
          onBodyGenerated={(generatedBody) => {
          setBody(generatedBody)
          setActiveTab('body')  // switch to body tab automatically
        }} />
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        select option { background: #1a1a2e; color: white; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    background: '#0d0d14',
    color: '#e2e2e2',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    overflow: 'hidden',
  },
  sidebar: {
    width: '260px',
    minWidth: '260px',
    background: '#11111c',
    borderRight: '1px solid #1e1e30',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '16px',
    borderBottom: '1px solid #1e1e30',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '34px',
    height: '34px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  logoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '0.5px',
  },
  logoSub: {
    fontSize: '10px',
    color: '#555',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  historyLabel: {
    padding: '12px 16px 6px',
    fontSize: '11px',
    letterSpacing: '2px',
    color: '#6666aa',
    fontWeight: '600',
  },
  historyScroll: {
    flex: 1,
    overflowY: 'auto',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topBar: {
    padding: '16px 20px',
    borderBottom: '1px solid #1e1e30',
    background: '#0d0d14',
  },
  urlBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#11111c',
    border: '1px solid #1e1e30',
    borderRadius: '8px',
    padding: '4px 4px 4px 8px',
  },
  methodWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingRight: '8px',
    borderRight: '1px solid #1e1e30',
  },
  methodDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  methodSelect: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  urlInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e2e2e2',
    fontSize: '13px',
    padding: '8px 4px',
    fontFamily: 'inherit',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'opacity 0.2s',
    whiteSpace: 'nowrap',
  },
  sendArrow: {
    fontSize: '14px',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  tabs: {
    display: 'flex',
    gap: '0',
    padding: '0 20px',
    borderBottom: '1px solid #1e1e30',
    background: '#0d0d14',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#555',
    fontSize: '12px',
    fontWeight: '500',
    padding: '12px 16px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.2s',
  },
  tabActive: {
    color: '#a78bfa',
    borderBottom: '2px solid #6366f1',
  },
  tabBadge: {
    background: '#6366f122',
    color: '#a78bfa',
    border: '1px solid #6366f133',
    borderRadius: '10px',
    padding: '1px 6px',
    fontSize: '10px',
  },
  tabContent: {
    padding: '16px 20px',
    borderBottom: '1px solid #1e1e30',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  divider: {
    height: '1px',
    background: '#1e1e30',
  },
  responseSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  responseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid #1e1e30',
  },
  responseTitle: {
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#6666aa',
  },
  responseMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
    letterSpacing: '0.3px',
  },
  metaChip: {
    fontSize: '11px',
    color: '#555',
    background: '#1e1e30',
    padding: '3px 8px',
    borderRadius: '20px',
  },
  errorBox: {
    margin: '16px 20px',
    padding: '12px 16px',
    background: '#dc262611',
    border: '1px solid #dc262633',
    borderRadius: '6px',
    color: '#f87171',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    fontSize: '16px',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '8px',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
    opacity: 0.2,
  },
  emptyText: {
    color: '#444',
    fontSize: '13px',
  },
  emptyHint: {
    color: '#333',
    fontSize: '11px',
  },
}