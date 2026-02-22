export default function BodyEditor({ t, body, setBody }) {
  const format = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(body), null, 2)
      setBody(formatted)
    } catch {
      // not valid JSON, leave as is
    }
  }

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: t.sectionBg, borderBottom: `1px solid ${t.border}`, transition: 'background 0.3s ease' }}>
        <span style={{ fontSize: '10px', letterSpacing: '1.5px', color: t.textFaint, fontWeight: '700', fontFamily: "'IBM Plex Mono', monospace" }}>JSON</span>
        <button onClick={format} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '11px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.3px' }} title="Format JSON">
          ⌥ Format
        </button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={'{\n  "key": "value"\n}'}
        rows={6}
        spellCheck={false}
        style={{
          width: '100%',
          background: t.aiInputBg,
          border: 'none',
          outline: 'none',
          color: '#a78bfa',
          fontSize: '12px',
          padding: '12px',
          fontFamily: "'IBM Plex Mono', monospace",
          resize: 'vertical',
          lineHeight: '1.6',
          minHeight: '120px',
          transition: 'background 0.3s ease',
        }}
      />
    </div>
  )
}