import { createContext, useContext, useState } from 'react'

const darkTheme = {
  // Backgrounds
  page: '#07070f',
  sidebar: '#09091a',
  panel: '#0c0c1a',
  card: '#0f0f1e',
  cardHover: 'rgba(255,255,255,0.03)',
  cardActive: 'rgba(255,255,255,0.05)',

  // Borders
  border: '#1f1f35',
  borderSubtle: '#141428',

  // ── Text — this is where "dull" comes from ──────────────────────
  // Pure near-white instead of grey-tinted white
  text: '#ffffff',    // main text — pure white
  textMuted: '#a0a0cc',    // was too dark — labels, placeholders (BIG jump)
  textFaint: '#606090',    // was #444470 — dates, secondary labels  
  textDim: '#707099',    // was #555580 — tertiary text
  // ───────────────────────────────────────────────────────────────

  dot: '#1a1a32',
  input: '#0c0c1a',
  inputBg: '#0c0c1a',
  sectionBg: 'rgba(7,7,15,0.7)',
  contentBg: '#080812',

  // Nav
  navItemActive: 'rgba(6,182,212,0.10)',

  // Toggles
  toggleBg: '#14142a',
  toggleBorder: '#2a2a48',
  toggleShadow: '0 4px 20px rgba(0,0,0,0.5)',

  // Tool-specific
  topbarBg: 'rgba(9,9,26,0.85)',
  tabsBg: '#0a0a18',
  tabContentBg: '#080812',
  responseHeaderBg: 'rgba(8,8,18,0.9)',
  aiPanelBg: '#09091a',
  aiInputBg: '#0c0c1a',
  outputBg: '#0a0a14',
  outputHeaderBg: 'rgba(8,8,16,0.9)',
  toolbarBg: 'rgba(9,9,26,0.85)',
  editorBar: '#0a0a18',
  statusBar: '#08080f',
  dropdownBg: '#0f0f1e',
  historyEntryHover: 'rgba(255,255,255,0.02)',

  // Snippet / tag
  tagBg: 'rgba(99,102,241,0.12)',
  tagBorder: 'rgba(99,102,241,0.25)',
  tagColor: '#a78bfa',

  // Textarea
  textarea: 'rgba(8,8,16,0.5)',
}

const lightTheme = {
  // Backgrounds
  page: '#f2f2fa',
  sidebar: '#f8f8fd',
  panel: '#ffffff',
  card: '#ffffff',
  cardHover: 'rgba(0,0,0,0.02)',
  cardActive: 'rgba(0,0,0,0.04)',

  // Borders
  border: '#dcdcee',
  borderSubtle: '#e8e8f4',

  // ── Text — main fix for light mode ─────────────────────────────
  // Near-black with slight blue tint — avoids the washed-out grey look
  text: '#0d0d1a',       // was #1a1a2e — deeper, more contrast
  textMuted: '#55557a',       // was #666688 — slightly darker
  textFaint: '#9999bb',       // was #aaaacc
  textDim: '#7777aa',       // was #888899
  // ───────────────────────────────────────────────────────────────

  dot: '#d4d4ea',
  input: '#ffffff',
  inputBg: '#ffffff',
  sectionBg: 'rgba(242,242,250,0.8)',
  contentBg: '#f5f5fc',

  // Nav
  navItemActive: 'rgba(6,182,212,0.07)',

  // Toggles
  toggleBg: '#ffffff',
  toggleBorder: '#dcdcee',
  toggleShadow: '0 4px 20px rgba(0,0,0,0.08)',

  // Tool-specific
  topbarBg: 'rgba(248,248,253,0.9)',
  tabsBg: '#f5f5fc',
  tabContentBg: '#f2f2fa',
  responseHeaderBg: 'rgba(248,248,253,0.95)',
  aiPanelBg: '#f8f8fd',
  aiInputBg: '#ffffff',
  outputBg: '#f5f5fc',
  outputHeaderBg: 'rgba(248,248,253,0.95)',
  toolbarBg: 'rgba(248,248,253,0.9)',
  editorBar: '#f5f5fc',
  statusBar: '#ededf8',
  dropdownBg: '#ffffff',
  historyEntryHover: 'rgba(0,0,0,0.02)',

  // Snippet / tag
  tagBg: 'rgba(99,102,241,0.07)',
  tagBorder: 'rgba(99,102,241,0.18)',
  tagColor: '#6366f1',

  // Textarea
  textarea: 'rgba(248,248,252,0.8)',
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)
  const toggleTheme = () => setIsDark(d => !d)
  const theme = isDark ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}