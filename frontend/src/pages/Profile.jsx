import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../utils/authService'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const data = await updateProfile({ username, email })
      setUser(data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.error('Please fill in all fields')
    if (newPassword !== confirmPassword)
      return toast.error('Passwords do not match')
    if (newPassword.length < 6)
      return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await updateProfile({ currentPassword, newPassword })
      toast.success('Password updated!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.username?.charAt(0).toUpperCase() || 'U'

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
          <h1 style={styles.pageTitle}>Account Settings</h1>
        </div>

        <div style={styles.content}>
          {/* Left — Avatar + Info */}
          <div style={styles.leftPanel}>
            <div style={styles.avatarSection}>
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" style={styles.avatarImg} />
              ) : (
                <div style={styles.avatar}>{initials}</div>
              )}
              <div>
                <div style={styles.avatarName}>{user?.username}</div>
                <div style={styles.avatarEmail}>{user?.email}</div>
                {user?.googleId && (
                  <div style={styles.googleBadge}>
                    <svg width="12" height="12" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google Account
                  </div>
                )}
              </div>
            </div>

            {/* Nav */}
            <div style={styles.nav}>
              {['profile', 'password', 'danger'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...styles.navItem,
                    ...(activeTab === tab ? styles.navItemActive : {})
                  }}>
                  {tab === 'profile' && '👤 '}
                  {tab === 'password' && '🔒 '}
                  {tab === 'danger' && '⚠️ '}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'danger' ? ' Zone' : tab === 'password' ? '' : ' Info'}
                </button>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div style={styles.rightPanel}>

            {activeTab === 'profile' && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Profile Information</h2>
                <p style={styles.sectionDesc}>Update your username and email address.</p>

                <div style={styles.fields}>
                  <div style={styles.field}>
                    <label style={styles.label}>Username</label>
                    <input
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'password' && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Change Password</h2>
                <p style={styles.sectionDesc}>
                  {user?.googleId ? 'Google accounts cannot change password here.' : 'Update your password to keep your account secure.'}
                </p>

                {user?.googleId ? (
                  <div style={styles.infoBox}>
                    You signed in with Google. Password management is handled by Google.
                  </div>
                ) : (
                  <>
                    <div style={styles.fields}>
                      <div style={styles.field}>
                        <label style={styles.label}>Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.field}>
                        <label style={styles.label}>New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.field}>
                        <label style={styles.label}>Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleUpdatePassword}
                      disabled={loading}
                      style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === 'danger' && (
              <div style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: '#f87171' }}>Danger Zone</h2>
                <p style={styles.sectionDesc}>These actions are irreversible. Please be careful.</p>

                <div style={styles.dangerCard}>
                  <div>
                    <div style={styles.dangerTitle}>Sign out of DevKit</div>
                    <div style={styles.dangerDesc}>You will need to log in again to access your account.</div>
                  </div>
                  <button onClick={handleLogout} style={styles.dangerBtn}>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#080810',
    color: '#e2e2f0',
    fontFamily: "'IBM Plex Sans', sans-serif",
    padding: '40px 24px',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #1e1e30',
    borderRadius: '8px',
    color: '#6666aa',
    fontSize: '13px',
    padding: '7px 14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#e2e2f0',
    margin: 0,
  },
  content: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  leftPanel: {
    width: '240px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    background: '#0f0f1a',
    border: '1px solid #1e1e30',
    borderRadius: '12px',
    padding: '24px 16px',
    textAlign: 'center',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
  },
  avatarImg: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e2f0',
    marginBottom: '4px',
  },
  avatarEmail: {
    fontSize: '11px',
    color: '#4a4a7a',
  },
  googleBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '8px',
    background: '#ffffff11',
    border: '1px solid #ffffff22',
    borderRadius: '20px',
    fontSize: '10px',
    color: '#888',
    padding: '3px 8px',
  },
  nav: {
    background: '#0f0f1a',
    border: '1px solid #1e1e30',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  navItem: {
    display: 'block',
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #1e1e30',
    color: '#6666aa',
    fontSize: '13px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: '#1e1e35',
    color: '#e2e2f0',
    borderLeft: '2px solid #4f46e5',
  },
  rightPanel: {
    flex: 1,
    background: '#0f0f1a',
    border: '1px solid #1e1e30',
    borderRadius: '12px',
    padding: '28px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e2e2f0',
    margin: 0,
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#4a4a7a',
    margin: 0,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    color: '#6666aa',
    letterSpacing: '0.3px',
  },
  input: {
    background: '#0a0a12',
    border: '1px solid #1e1e30',
    borderRadius: '8px',
    color: '#e2e2f0',
    fontSize: '13px',
    padding: '10px 12px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '11px 24px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    alignSelf: 'flex-start',
  },
  infoBox: {
    background: '#4f46e511',
    border: '1px solid #4f46e533',
    borderRadius: '8px',
    color: '#a78bfa',
    fontSize: '13px',
    padding: '14px 16px',
  },
  dangerCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#ef444408',
    border: '1px solid #ef444422',
    borderRadius: '10px',
    padding: '16px 20px',
    gap: '16px',
  },
  dangerTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f87171',
    marginBottom: '4px',
  },
  dangerDesc: {
    fontSize: '12px',
    color: '#4a4a7a',
  },
  dangerBtn: {
    background: 'transparent',
    border: '1px solid #ef444444',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '13px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
}