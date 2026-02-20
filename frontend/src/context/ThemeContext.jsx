import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)
  const toggle = () => setIsDark(d => !d)

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}