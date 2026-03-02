// src/components/ui/TerminalLine.jsx
import { useState, useEffect } from 'react'

export default function TerminalLine({ children, delay, color }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay + 800)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div style={{
      fontSize: '12px',
      fontFamily: "'IBM Plex Mono', monospace",
      color: color || '#888',
      padding: '2px 0',
      opacity: show ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}>
      {children}
    </div>
  )
}