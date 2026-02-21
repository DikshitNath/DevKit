import { useState } from 'react'
import axios from 'axios'

export default function AISnippetGenerator({ language, onGenerate }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/ai/generate-snippet', {
        prompt,
        language
      }, { withCredentials: true })
      onGenerate(res.data.code)
    } catch (err) {
      setError('Failed to generate snippet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <span style={styles.label}>✦ Describe what you want to generate</span>
      </div>
      <div style={styles.inputRow}>
        <input
          placeholder={`e.g. "fetch data from an API with error handling in ${language}"`}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && prompt && generate()}
          style={styles.input}
        />
        <button
          onClick={generate}
          disabled={loading || !prompt}
          style={{
            ...styles.btn,
            opacity: loading || !prompt ? 0.5 : 1,
            cursor: loading || !prompt ? 'not-allowed' : 'pointer'
          }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  )
}

const styles = {
  container: {
    padding: '12px 20px',
    borderBottom: '1px solid #1e1e30',
    background: '#0d0d18',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    fontSize: '11px',
    color: '#a78bfa',
    fontWeight: '600',
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
    fontWeight: '600',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  error: {
    color: '#f87171',
    fontSize: '11px',
    margin: 0,
  }
}