import { useState } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { generateSnippet } from '../../utils/aiService'

export default function AISnippetGenerator({ language, onGenerate }) {
  const { theme: t } = useTheme()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const code = await generateSnippet(prompt, language)
      onGenerate(code)
    } catch {
      setError('Failed to generate snippet')
    } finally {
      setLoading(false)
    }
  } 

  return (
    <div style={{ padding: '12px 20px', borderBottom: `1px solid ${t.border}`, background: t.aiPanelBg, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600', letterSpacing: '0.3px' }}>✦ Describe what you want to generate</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          placeholder={`e.g. "fetch data from an API with error handling in ${language}"`}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && prompt && generate()}
          style={{ flex: 1, background: t.aiInputBg, border: `1px solid ${t.border}`, borderRadius: '6px', color: t.text, fontSize: '12px', padding: '8px 12px', outline: 'none', fontFamily: 'inherit' }}
        />
        <button
          onClick={generate}
          disabled={loading || !prompt}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: loading || !prompt ? 0.5 : 1, cursor: loading || !prompt ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: '11px', margin: 0 }}>{error}</p>}
    </div>
  )
}