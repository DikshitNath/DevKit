export default function BodyEditor({ body, setBody }) {
  const format = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(body), null, 2)
      setBody(formatted)
    } catch {
      // not valid JSON, leave as is
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <span style={styles.label}>JSON</span>
        <button onClick={format} style={styles.formatBtn} title="Format JSON">
          ⌥ Format
        </button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={'{\n  "key": "value"\n}'}
        rows={6}
        style={styles.textarea}
        spellCheck={false}
      />
    </div>
  )
}

const styles = {
  container: {
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    background: '#0d0d14',
    borderBottom: '1px solid #1e1e30',
  },
  label: {
    fontSize: '11px',
    letterSpacing: '1.5px',
    color: '#6666aa',
    fontWeight: '700',
  },
  formatBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6366f1',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.3px',
  },
  textarea: {
    width: '100%',
    background: '#0a0a12',
    border: 'none',
    outline: 'none',
    color: '#a78bfa',
    fontSize: '12px',
    padding: '12px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    resize: 'vertical',
    lineHeight: '1.6',
    minHeight: '120px',
  }
}