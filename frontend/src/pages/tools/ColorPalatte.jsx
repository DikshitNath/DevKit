import { useState, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import DevKitLogo from '../../components/ui/DevKitLogo'
import { generateColorPalette } from '../../utils/aiService'

// ─── Color Math ──────────────────────────────────────────────────────
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)); l = Math.max(0, Math.min(100, l))
  const hNorm = h / 360, sNorm = s / 100, lNorm = l / 100
  let r, g, b
  if (sNorm === 0) { r = g = b = lNorm } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
    const p = 2 * lNorm - q
    r = hue2rgb(p, q, hNorm + 1 / 3); g = hue2rgb(p, q, hNorm); b = hue2rgb(p, q, hNorm - 1 / 3)
  }
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToRgb(hex) {
  return `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})`
}

function getLuminance(hex) {
  return 0.299 * parseInt(hex.slice(1, 3), 16) / 255 + 0.587 * parseInt(hex.slice(3, 5), 16) / 255 + 0.114 * parseInt(hex.slice(5, 7), 16) / 255
}

function textColor(hex) { return getLuminance(hex) > 0.5 ? '#1a1a2e' : '#ffffff' }

const MODES = ['Complementary', 'Triadic', 'Analogous', 'Monochromatic', 'Split']

function generatePalette(baseHex, mode, numColors) {
  const [h, s, l] = hexToHsl(baseHex)
  switch (mode) {
    case 'Complementary': return [baseHex, hslToHex(h, s, Math.min(l + 20, 90)), hslToHex(h, s, Math.max(l - 20, 10)), hslToHex(h + 180, s, l), hslToHex(h + 180, s, Math.min(l + 15, 90))]
    case 'Triadic': return [baseHex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l), hslToHex(h + 120, s, Math.min(l + 20, 90)), hslToHex(h + 240, s, Math.max(l - 15, 10))]
    case 'Analogous': return [hslToHex(h - 40, s, l), hslToHex(h - 20, s, l), baseHex, hslToHex(h + 20, s, l), hslToHex(h + 40, s, l)]
    case 'Monochromatic': return [hslToHex(h, s, Math.max(l - 30, 5)), hslToHex(h, s, Math.max(l - 15, 10)), baseHex, hslToHex(h, s, Math.min(l + 15, 90)), hslToHex(h, s, Math.min(l + 30, 95))]
    case 'Split': return [baseHex, hslToHex(h + 150, s, l), hslToHex(h + 210, s, l), hslToHex(h + 150, s, Math.min(l + 20, 90)), hslToHex(h + 210, s, Math.max(l - 15, 10))]
    default: return [baseHex]
  }
}

const mono = "'IBM Plex Mono', monospace"

export default function ColorPalette() {
  const [baseColor, setBaseColor] = useState('#6366f1')
  const [hexInput, setHexInput] = useState('#6366f1')
  const [mode, setMode] = useState('Complementary')
  const [palette, setPalette] = useState(() => generatePalette('#6366f1', 'Complementary'))
  const [copied, setCopied] = useState(null)
  const [colorFormat, setColorFormat] = useState('hex')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [savedPalettes, setSavedPalettes] = useState([])
  const { isDark, theme: t, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const updateColor = useCallback((hex, newMode = mode) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return
    setBaseColor(hex); setHexInput(hex); setPalette(generatePalette(hex, newMode))
  }, [mode])

  const handleHexInput = (val) => { setHexInput(val); if (/^#[0-9A-Fa-f]{6}$/.test(val)) updateColor(val) }
  const handleModeChange = (newMode) => { setMode(newMode); setPalette(generatePalette(baseColor, newMode)) }

  const getColorDisplay = (hex) => {
    if (colorFormat === 'rgb') return hexToRgb(hex)
    if (colorFormat === 'hsl') { const [h, s, l] = hexToHsl(hex); return `hsl(${h}, ${s}%, ${l}%)` }
    return hex
  }

  const copyColor = (hex) => { navigator.clipboard.writeText(getColorDisplay(hex)); setCopied(hex); setTimeout(() => setCopied(null), 1500) }

  const exportCSS = () => {
    const css = palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')
    navigator.clipboard.writeText(`:root {\n${css}\n}`)
    setCopied('css'); setTimeout(() => setCopied(null), 1500)
  }

  const savePalette = () => setSavedPalettes(prev => [{ colors: [...palette], mode, base: baseColor, id: Date.now() }, ...prev.slice(0, 7)])

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    try {
      const colors = await generateColorPalette(aiPrompt)
      if (colors?.length >= 5) {
        setPalette(colors.slice(0, 5))
        setBaseColor(colors[0])
        setHexInput(colors[0])
        setShowAI(false)
        setAiPrompt('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  const [h, s, l] = hexToHsl(baseColor)

  return (
    <div style={{ height: '100vh', display: 'flex', background: t.page, color: t.text, fontFamily: "'Syne', sans-serif", overflow: 'hidden', position: 'relative', transition: 'background 0.3s ease, color 0.3s ease' }}>

      <div style={{ position: 'fixed', inset: 0, backgroundImage: `radial-gradient(circle, ${t.dot} 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: 0.55, pointerEvents: 'none', zIndex: 0 }} />
      {isDark && <>
        <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 8s ease-in-out infinite', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-20%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 10s ease-in-out infinite 2s', zIndex: 0 }} />
      </>}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', minWidth: '220px', background: t.sidebar, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 16px 14px', borderBottom: `1px solid ${t.border}`, cursor: 'pointer' }}>
          <DevKitLogo size={28} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: t.text, letterSpacing: '0.4px' }}>DevKit</span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', margin: '12px 16px 4px', background: `${baseColor}18`, border: `1px solid ${baseColor}33`, borderRadius: '20px', fontSize: '11px', padding: '4px 12px', fontFamily: mono, color: baseColor, width: 'fit-content', transition: 'all 0.3s ease' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: baseColor, animation: 'blink 2s ease-in-out infinite', flexShrink: 0 }} />
          Color Palette
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

          {/* Base Color */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, marginBottom: '10px', textTransform: 'uppercase', fontFamily: mono }}>Base Color</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ position: 'relative', cursor: 'pointer' }}>
                <input type="color" value={baseColor} onChange={e => updateColor(e.target.value)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: baseColor, border: `2px solid ${t.border}`, boxShadow: `0 0 16px ${baseColor}55`, cursor: 'pointer', flexShrink: 0 }} />
              </label>
              <input value={hexInput} onChange={e => handleHexInput(e.target.value)} maxLength={7} style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: '8px', color: t.text, fontSize: '13px', padding: '9px 10px', outline: 'none', fontFamily: mono }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'H', value: h, max: 360, onChange: v => updateColor(hslToHex(v, s, l)) },
                { label: 'S', value: s, max: 100, onChange: v => updateColor(hslToHex(h, v, l)) },
                { label: 'L', value: l, max: 100, onChange: v => updateColor(hslToHex(h, s, v)) },
              ].map(({ label, value, max, onChange }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: t.textFaint, fontFamily: mono, width: '12px', flexShrink: 0 }}>{label}</span>
                  <input type="range" min={0} max={max} value={value} onChange={e => onChange(Number(e.target.value))} style={{ flex: 1, accentColor: baseColor, cursor: 'pointer', height: '3px' }} />
                  <span style={{ fontSize: '10px', color: t.textMuted, fontFamily: mono, width: '28px', textAlign: 'right', flexShrink: 0 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Harmony */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, marginBottom: '10px', textTransform: 'uppercase', fontFamily: mono }}>Harmony</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {MODES.map(m => (
                <button key={m} onClick={() => handleModeChange(m)} style={{ background: mode === m ? `${baseColor}18` : 'transparent', border: `1px solid ${mode === m ? baseColor + '44' : t.border}`, borderLeft: mode === m ? `2px solid ${baseColor}` : '2px solid transparent', borderRadius: '7px', color: mode === m ? baseColor : t.textMuted, fontSize: '12px', fontWeight: mode === m ? '600' : '400', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {m}{mode === m && <span style={{ fontSize: '9px', opacity: 0.7 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, marginBottom: '10px', textTransform: 'uppercase', fontFamily: mono }}>Format</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['hex', 'rgb', 'hsl'].map(f => (
                <button key={f} onClick={() => setColorFormat(f)} style={{ flex: 1, background: colorFormat === f ? `${baseColor}18` : 'transparent', border: `1px solid ${colorFormat === f ? baseColor + '44' : t.border}`, borderRadius: '7px', color: colorFormat === f ? baseColor : t.textMuted, fontSize: '10px', fontWeight: '600', padding: '7px 6px', cursor: 'pointer', fontFamily: mono, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Quick Picks */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, marginBottom: '10px', textTransform: 'uppercase', fontFamily: mono }}>Quick Picks</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f43f5e', '#1a1a2e', '#ffffff'].map(c => (
                <button key={c} onClick={() => updateColor(c)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: c, border: baseColor === c ? `2px solid ${t.text}` : `1px solid ${t.border}`, cursor: 'pointer', flexShrink: 0 }}
                  onMouseEnter={e => { e.target.style.transform = 'scale(1.18)'; e.target.style.boxShadow = `0 0 10px ${c}66` }}
                  onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none' }} />
              ))}
            </div>
          </div>

          {savedPalettes.length > 0 && (
            <div>
              <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, marginBottom: '10px', textTransform: 'uppercase', fontFamily: mono }}>Saved</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {savedPalettes.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button onClick={() => { setPalette(p.colors); setBaseColor(p.base); setHexInput(p.base); setMode(p.mode) }} style={{ flex: 1, display: 'flex', gap: '3px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = baseColor + '66'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                      {p.colors.map((c, i) => <div key={i} style={{ flex: 1, height: '16px', borderRadius: '3px', background: c }} />)}
                    </button>
                    <button onClick={() => setSavedPalettes(prev => prev.filter(s => s.id !== p.id))} style={{ width: '24px', height: '24px', flexShrink: 0, background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '6px', color: t.textMuted, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef444466'; e.currentTarget.style.color = '#f87171' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 16px', borderTop: `1px solid ${t.border}` }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div onClick={() => navigate('/profile')} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                <div style={{ fontSize: '10px', color: t.textFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: mono }}>{user.email || ''}</div>
              </div>
              <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '5px', color: t.textMuted, cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${t.border}`, background: t.sectionBg, backdropFilter: 'blur(12px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {palette.map((c, i) => <div key={i} style={{ width: '18px', height: '18px', borderRadius: '4px', background: c, boxShadow: `0 0 8px ${c}44` }} />)}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: t.textMuted, fontFamily: mono }}>{mode}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => setShowAI(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: showAI ? '#a78bfa18' : 'transparent', border: `1px solid ${showAI ? '#a78bfa44' : t.border}`, borderRadius: '7px', color: showAI ? '#a78bfa' : t.textMuted, fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ color: '#a78bfa', fontSize: '10px' }}>✦</span> AI Generate
            </button>
            <button onClick={savePalette} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: t.textMuted, fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>♡ Save</button>
            <button onClick={exportCSS} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: copied === 'css' ? '#4ade80' : t.textMuted, fontSize: '12px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied === 'css' ? '✓ Copied CSS' : '⎘ Export CSS'}
            </button>
          </div>
        </div>

        {showAI && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,22,0.8)' : 'rgba(244,244,252,0.9)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
            <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', fontFamily: mono }}>✦ DESCRIBE A PALETTE:</span>
            <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAIGenerate()} placeholder='"sunset over the ocean", "dark cyberpunk neon", "forest in autumn"' style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: '7px', color: t.text, fontSize: '12px', padding: '8px 12px', outline: 'none', fontFamily: mono }} />
            <button onClick={handleAIGenerate} disabled={aiLoading || !aiPrompt.trim()} style={{ background: 'linear-gradient(135deg, #a78bfa, #6366f1)', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 18px', fontSize: '12px', fontWeight: '600', cursor: aiLoading ? 'wait' : 'pointer', opacity: !aiPrompt.trim() ? 0.5 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {aiLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {palette.map((color, i) => (
            <ColorSwatch key={`${color}-${i}`} color={color} index={i} display={getColorDisplay(color)} isCopied={copied === color} onCopy={() => copyColor(color)} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: `1px solid ${t.border}`, background: t.sectionBg, backdropFilter: 'blur(12px)', flexShrink: 0, padding: '10px 16px' }}>
          {palette.map((color, i) => {
            const [ch, cs, cl] = hexToHsl(color)
            return (
              <div key={i} onClick={() => copyColor(color)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${t.border}`, borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', minWidth: 0 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color + '88'; e.currentTarget.style.background = `${color}12` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 10px ${color}55`, border: `2px solid ${color}44` }} />
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: t.text, fontFamily: mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{copied === color ? '✓ Copied' : color.toUpperCase()}</div>
                  <div style={{ fontSize: '10px', color: t.textMuted, fontFamily: mono, whiteSpace: 'nowrap' }}>{ch}° {cs}% {cl}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button onClick={toggleTheme} style={{ position: 'fixed', bottom: '28px', right: '28px', width: '44px', height: '44px', borderRadius: '50%', background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, boxShadow: t.toggleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 999, fontSize: '19px', transition: 'all 0.3s ease', backdropFilter: 'blur(8px)' }}>
        {isDark ? '☀️' : '🌙'}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 0px; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#1e1e30' : '#d0d0e8'}; border-radius: 4px; }
        input[type=range] { height: 3px; border-radius: 2px; }
        input::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
        @keyframes swatchIn { from { opacity: 0; transform: scaleY(0.97); } to { opacity: 1; transform: scaleY(1); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.05)} }
      `}</style>
    </div>
  )
}

function ColorSwatch({ color, index, display, isCopied, onCopy }) {
  const [hovered, setHovered] = useState(false)
  const fg = textColor(color)

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onCopy}
      style={{ flex: hovered ? 1.4 : 1, background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'flex 0.3s ease', animation: `swatchIn 0.4s ease ${index * 0.06}s both` }}>

      <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.08)' : 'transparent', transition: 'background 0.2s' }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.2s, transform 0.2s' }}>
        <div style={{ background: isCopied ? 'rgba(74,222,128,0.9)' : `rgba(${fg === '#ffffff' ? '255,255,255' : '0,0,0'},0.15)`, backdropFilter: 'blur(8px)', border: `1px solid rgba(${fg === '#ffffff' ? '255,255,255' : '0,0,0'},0.2)`, borderRadius: '8px', padding: '8px 14px', color: isCopied ? '#fff' : fg, fontSize: '12px', fontWeight: '600', fontFamily: mono, whiteSpace: 'nowrap' }}>
          {isCopied ? '✓ Copied!' : display}
        </div>
        <div style={{ fontSize: '10px', color: fg, opacity: 0.5, fontFamily: mono }}>click to copy</div>
      </div>

      <div style={{ position: 'absolute', bottom: '72px', left: '50%', transform: 'translateX(-50%)', background: `rgba(${fg === '#ffffff' ? '255,255,255' : '0,0,0'},0.12)`, borderRadius: '20px', padding: '3px 10px', fontSize: '10px', color: fg, opacity: hovered ? 0 : 0.5, fontFamily: mono, whiteSpace: 'nowrap' }}>
        {color.toUpperCase()}
      </div>
    </div>
  )
}