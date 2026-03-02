import { createContext, useContext, useState } from 'react'

export const darkTheme = {
  page: '#080810',
  sidebar: '#0a0a16',
  panel: '#0c0c18',
  border: '#1e1e30',
  borderSubtle: '#13131e',
  text: '#e2e2f0',
  textMuted: '#4a4a7a',
  textFaint: '#2a2a45',
  textDim: '#3a3a5c',
  dot: '#1e1e35',
  input: '#0c0c18',
  cardHover: 'rgba(255,255,255,0.02)',
  sectionBg: 'rgba(8,8,16,0.6)',
  toggleBg: '#16162a',
  toggleBorder: '#2a2a45',
  toggleShadow: '0 4px 20px rgba(0,0,0,0.4)',
}

export const lightTheme = {
  page: '#f0f0f8',
  sidebar: '#f8f8fc',
  panel: '#ffffff',
  border: '#e0e0ee',
  borderSubtle: '#eaeaf4',
  text: '#1a1a2e',
  textMuted: '#666688',
  textFaint: '#aaaacc',
  textDim: '#888899',
  dot: '#d8d8ee',
  input: '#ffffff',
  cardHover: 'rgba(0,0,0,0.015)',
  sectionBg: 'rgba(240,240,248,0.7)',
  toggleBg: '#ffffff',
  toggleBorder: '#e0e0ee',
  toggleShadow: '0 4px 20px rgba(0,0,0,0.1)',
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)
  const theme = isDark ? darkTheme : lightTheme
  const toggleTheme = () => setIsDark(d => !d)

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}