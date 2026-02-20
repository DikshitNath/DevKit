export default function HeadersEditor({ headers, setHeaders }) {
  const update = (index, field, value) => {
    const updated = [...headers]
    updated[index][field] = value
    setHeaders(updated)
  }

  const addRow = () => setHeaders([...headers, { key: '', value: '' }])
  const removeRow = (i) => setHeaders(headers.filter((_, idx) => idx !== i))

  return (
    <div style={styles.container}>
      {/* Table Header */}
      <div style={styles.tableHeader}>
        <div style={styles.colKey}>KEY</div>
        <div style={styles.colValue}>VALUE</div>
        <div style={styles.colAction} />
      </div>

      {/* Rows */}
      {headers.map((h, i) => (
        <div key={i} style={styles.row}
          onMouseEnter={e => e.currentTarget.style.background = '#13131f'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <input
            placeholder="Content-Type"
            value={h.key}
            onChange={(e) => update(i, 'key', e.target.value)}
            style={styles.input}
          />
          <div style={styles.divider} />
          <input
            placeholder="application/json"
            value={h.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            style={styles.input}
          />
          <button
            onClick={() => removeRow(i)}
            style={styles.removeBtn}
            title="Remove header">
            ×
          </button>
        </div>
      ))}

      {/* Add Button */}
      <button onClick={addRow} style={styles.addBtn}>
        + Add Header
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    background: '#0d0d14',
    borderBottom: '1px solid #1e1e30',
    padding: '6px 12px',
    gap: '8px',
  },
  colKey: {
    flex: 1,
    fontSize: '11px',
    letterSpacing: '1.5px',
    color: '#6666aa',
    fontWeight: '700',
  },
  colValue: {
    flex: 1,
    fontSize: '11px',
    letterSpacing: '1.5px',
    color: '#6666aa',
    fontWeight: '700',
  },
  colAction: {
    width: '24px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #1a1a28',
    transition: 'background 0.15s',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ccc',
    fontSize: '12px',
    padding: '9px 12px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  divider: {
    width: '1px',
    height: '20px',
    background: '#1e1e30',
    flexShrink: 0,
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#333',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 10px',
    lineHeight: 1,
    transition: 'color 0.15s',
    flexShrink: 0,
  },
  addBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6366f1',
    fontSize: '11px',
    cursor: 'pointer',
    padding: '10px 12px',
    textAlign: 'left',
    fontFamily: 'inherit',
    letterSpacing: '0.3px',
    transition: 'opacity 0.2s',
  }
}