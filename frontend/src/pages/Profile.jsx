import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../utils/authService'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const { isDark, theme: t, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }
    // Google users don't need password confirmation
    if (!user?.googleId && !deletePassword) {
      return toast.error('Please enter your password to confirm')
    }
    setDeleteLoading(true)
    try {
      await axios.delete('/api/auth/delete-account', {
        data: { password: deletePassword },
        withCredentials: true,
      })
      toast.success('Account deleted')
      await logout()
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.username?.charAt(0).toUpperCase() || 'U'

  const s = {
    page: {
      minHeight: '100vh',
      background: t.page,
      color: t.text,
      fontFamily: "'IBM Plex Sans', sans-serif",
      padding: '40px 24px',
      transition: 'background 0.3s ease, color 0.3s ease',
    },
    container: { maxWidth: '900px', margin: '0 auto' },
    header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' },
    backBtn: {
      background: 'transparent',
      border: `1px solid ${t.border}`,
      borderRadius: '8px',
      color: t.textMuted,
      fontSize: '13px',
      padding: '7px 14px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.15s',
    },
    pageTitle: { fontSize: '22px', fontWeight: '700', color: t.text, margin: 0 },
    content: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
    leftPanel: { width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' },
    avatarSection: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      background: t.panel, border: `1px solid ${t.border}`, borderRadius: '12px',
      padding: '24px 16px', textAlign: 'center', transition: 'background 0.3s, border-color 0.3s',
    },
    avatar: {
      width: '64px', height: '64px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '24px', fontWeight: '700', color: '#fff',
    },
    avatarName: { fontSize: '14px', fontWeight: '600', color: t.text, marginBottom: '4px' },
    avatarEmail: { fontSize: '11px', color: t.textMuted },
    googleBadge: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
      marginTop: '8px', background: isDark ? '#ffffff11' : '#00000008',
      border: `1px solid ${t.border}`, borderRadius: '20px',
      fontSize: '10px', color: t.textMuted, padding: '3px 8px',
    },
    nav: {
      background: t.panel, border: `1px solid ${t.border}`, borderRadius: '12px',
      overflow: 'hidden', transition: 'background 0.3s, border-color 0.3s',
    },
    navItem: {
      display: 'block', width: '100%', background: 'transparent',
      borderTop: 'none', borderRight: 'none',
      borderBottom: `1px solid ${t.border}`,
      borderLeft: '2px solid transparent',
      color: t.textMuted, fontSize: '13px', padding: '12px 16px',
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
    },
    navItemActive: { background: t.navItemActive, color: t.text, borderLeft: '2px solid #4f46e5' },
    rightPanel: {
      flex: 1, background: t.panel, border: `1px solid ${t.border}`,
      borderRadius: '12px', padding: '28px',
      transition: 'background 0.3s, border-color 0.3s',
    },
    section: { display: 'flex', flexDirection: 'column', gap: '20px' },
    sectionTitle: { fontSize: '16px', fontWeight: '600', color: t.text, margin: 0 },
    sectionDesc: { fontSize: '13px', color: t.textMuted, margin: 0 },
    fields: { display: 'flex', flexDirection: 'column', gap: '14px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', color: t.textMuted, letterSpacing: '0.3px' },
    input: {
      background: t.input, border: `1px solid ${t.border}`, borderRadius: '8px',
      color: t.text, fontSize: '13px', padding: '10px 12px', outline: 'none',
      fontFamily: 'inherit', transition: 'background 0.3s, border-color 0.3s',
    },
    saveBtn: {
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px',
      fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
      alignSelf: 'flex-start',
    },
    infoBox: {
      background: '#4f46e511', border: '1px solid #4f46e533',
      borderRadius: '8px', color: '#a78bfa', fontSize: '13px', padding: '14px 16px',
    },
    dangerCard: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#ef444408', border: '1px solid #ef444422',
      borderRadius: '10px', padding: '16px 20px', gap: '16px',
    },
    dangerTitle: { fontSize: '13px', fontWeight: '600', color: '#f87171', marginBottom: '4px' },
    dangerDesc: { fontSize: '12px', color: t.textMuted },
    dangerBtn: {
      background: 'transparent', border: '1px solid #ef444444', borderRadius: '8px',
      color: '#f87171', fontSize: '13px', padding: '8px 16px',
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
    },
  }

  return (
    <div style={s.page}>
      <div style={s.container}>

        <div style={s.header}>
          <button onClick={() => navigate(-1)} style={s.backBtn}>← Back</button>
          <h1 style={s.pageTitle}>Account Settings</h1>
          <button onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}
            style={{ ...s.backBtn, marginLeft: 'auto', fontSize: '16px', padding: '5px 10px' }}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <div style={s.content}>

          {/* Left — Avatar + Nav */}
          <div style={s.leftPanel}>
            <div style={s.avatarSection}>
              <div style={s.avatar}>{initials}</div>
              <div>
                <div style={s.avatarName}>{user?.username}</div>
                <div style={s.avatarEmail}>{user?.email}</div>
                {user?.googleId && (
                  <div style={s.googleBadge}>
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

            <div style={s.nav}>
              {['profile', 'password', 'danger'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ ...s.navItem, ...(activeTab === tab ? s.navItemActive : {}) }}>
                  {tab === 'profile'   && '👤 '}
                  {tab === 'password'  && '🔒 '}
                  {tab === 'danger'    && '⚠️ '}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'danger' ? ' Zone' : tab === 'password' ? '' : ' Info'}
                </button>
              ))}
            </div>
          </div>

          {/* Right — Forms */}
          <div style={s.rightPanel}>

            {/* ── Profile tab ── */}
            {activeTab === 'profile' && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>Profile Information</h2>
                <p style={s.sectionDesc}>Update your username and email address.</p>
                <div style={s.fields}>
                  <div style={s.field}>
                    <label style={s.label}>Username</label>
                    <input value={username} onChange={e => setUsername(e.target.value)} style={s.input} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={s.input} />
                  </div>
                </div>
                <button onClick={handleUpdateProfile} disabled={loading}
                  style={{ ...s.saveBtn, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* ── Password tab ── */}
            {activeTab === 'password' && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>Change Password</h2>
                <p style={s.sectionDesc}>
                  {user?.googleId ? 'Google accounts cannot change password here.' : 'Update your password to keep your account secure.'}
                </p>
                {user?.googleId ? (
                  <div style={s.infoBox}>You signed in with Google. Password management is handled by Google.</div>
                ) : (
                  <>
                    <div style={s.fields}>
                      <div style={s.field}>
                        <label style={s.label}>Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" style={s.input} />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" style={s.input} />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={s.input} />
                      </div>
                    </div>
                    <button onClick={handleUpdatePassword} disabled={loading}
                      style={{ ...s.saveBtn, opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── Danger zone tab ── */}
            {activeTab === 'danger' && (
              <div style={s.section}>
                <h2 style={{ ...s.sectionTitle, color: '#f87171' }}>Danger Zone</h2>
                <p style={s.sectionDesc}>These actions are irreversible. Please be careful.</p>

                {/* Sign out */}
                <div style={s.dangerCard}>
                  <div>
                    <div style={s.dangerTitle}>Sign out of DevKit</div>
                    <div style={s.dangerDesc}>You will need to log in again to access your account.</div>
                  </div>
                  <button onClick={handleLogout} style={s.dangerBtn}>Sign Out</button>
                </div>

                {/* Delete account */}
                <div style={{ ...s.dangerCard, flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
                    <div>
                      <div style={s.dangerTitle}>Delete Account</div>
                      <div style={s.dangerDesc}>Permanently delete your account and all associated data. This cannot be undone.</div>
                    </div>
                    {!showDeleteConfirm && (
                      <button onClick={() => setShowDeleteConfirm(true)} style={{ ...s.dangerBtn, background: '#ef444410' }}>
                        Delete Account
                      </button>
                    )}
                  </div>

                  {/* Confirmation form — expands inline */}
                  {showDeleteConfirm && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px', borderTop: '1px solid #ef444422' }}>
                      <p style={{ fontSize: '12px', color: '#f87171', margin: 0 }}>
                        ⚠ This will permanently delete your account, snippets, and all saved data.
                      </p>

                      {/* Password confirmation — only for non-Google accounts */}
                      {!user?.googleId && (
                        <div style={s.field}>
                          <label style={{ ...s.label, color: '#f87171' }}>Enter your password to confirm</label>
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={e => setDeletePassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleDeleteAccount()}
                            placeholder="••••••••"
                            style={{ ...s.input, border: '1px solid #ef444444' }}
                            autoFocus
                          />
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading}
                          style={{ background: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', padding: '9px 20px', cursor: deleteLoading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: deleteLoading ? 0.7 : 1 }}
                        >
                          {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
                        </button>
                        <button
                          onClick={() => { setShowDeleteConfirm(false); setDeletePassword('') }}
                          style={s.dangerBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        input::placeholder { color: ${t.textFaint}; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}