import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../utils/authService'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await login(email, password)
      setUser(data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>⚡</div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to DevKit</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="john@example.com"
            style={styles.input}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={styles.input}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          style={{
            ...styles.btn,
            opacity: loading || !email || !password ? 0.5 : 1,
            cursor: loading || !email || !password ? 'not-allowed' : 'pointer'
          }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0d0d14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace",
  },
  card: {
    background: '#11111c',
    border: '1px solid #1e1e30',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logo: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    marginBottom: '4px',
  },
  title: {
    color: '#e2e2e2',
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
  },
  subtitle: {
    color: '#555',
    fontSize: '12px',
    margin: 0,
  },
  error: {
    background: '#ef444411',
    border: '1px solid #ef444433',
    borderRadius: '6px',
    padding: '10px 12px',
    color: '#f87171',
    fontSize: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    color: '#6666aa',
    letterSpacing: '0.5px',
  },
  input: {
    background: '#0d0d14',
    border: '1px solid #1e1e30',
    borderRadius: '6px',
    color: '#e2e2e2',
    fontSize: '13px',
    padding: '10px 12px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  btn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'inherit',
    marginTop: '4px',
  },
  footer: {
    color: '#555',
    fontSize: '12px',
    textAlign: 'center',
    margin: 0,
  },
  link: {
    color: '#a78bfa',
    textDecoration: 'none',
  }
}