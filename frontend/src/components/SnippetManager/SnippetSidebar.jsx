const LANG_ICONS = {
  javascript: 'JS',
  typescript: 'TS',
  python: 'PY',
  java: 'JV',
  cpp: 'C+',
  css: 'CS',
  html: 'HT',
  json: 'JN',
  bash: 'SH',
  sql: 'SQ',
}

const LANG_COLORS = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3572A5',
  java: '#b07219',
  cpp: '#f34b7d',
  css: '#563d7c',
  html: '#e34c26',
  json: '#40d080',
  bash: '#89e051',
  sql: '#e38c00',
}

export default function SnippetSidebar({
  user, filter, filterTag, filterLang,
  allTags, allLangs, onFilter, onFilterTag, onFilterLang, onNew, onLogout
}) {
  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M8 6L3 12L8 18M16 6L21 12L16 18" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={styles.logoText}>SnippetKit</span>
      </div>

      {/* New Snippet Button */}
      <button onClick={onNew} style={styles.newBtn}>
        <span style={styles.newBtnPlus}>+</span>
        New Snippet
      </button>

      {/* Library */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>LIBRARY</div>
        {[
          { id: 'all', label: 'All Snippets', icon: '▦' },
          { id: 'public', label: 'Public', icon: '◈' },
          { id: 'private', label: 'Private', icon: '◉' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onFilter(item.id)}
            style={{
              ...styles.navItem,
              ...(filter === item.id ? styles.navItemActive : {})
            }}>
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Languages */}
      {allLangs.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionLabel}>LANGUAGES</div>
          {allLangs.map(lang => (
            <button
              key={lang}
              onClick={() => onFilterLang(lang === filterLang ? '' : lang)}
              style={{
                ...styles.navItem,
                ...(filterLang === lang ? styles.navItemActive : {})
              }}>
              <span style={{
                ...styles.langBadge,
                background: `${LANG_COLORS[lang]}22`,
                color: LANG_COLORS[lang] || '#888',
                border: `1px solid ${LANG_COLORS[lang]}44`,
              }}>
                {LANG_ICONS[lang] || lang.slice(0, 2).toUpperCase()}
              </span>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionLabel}>TAGS</div>
          <div style={styles.tagsGrid}>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => onFilterTag(tag === filterTag ? '' : tag)}
                style={{
                  ...styles.tagChip,
                  ...(filterTag === tag ? styles.tagChipActive : {})
                }}>
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User */}
      <div style={styles.userArea}>
        <div style={styles.avatar}>
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.username || 'User'}</div>
          <div style={styles.userEmail}>{user?.email || ''}</div>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn} title="Logout">
          ⎋
        </button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: '220px',
    minWidth: '220px',
    background: '#0c0c14',
    borderRight: '1px solid #1e1e30',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0 16px 0',
    overflow: 'hidden',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 16px 16px',
    borderBottom: '1px solid #1e1e30',
    marginBottom: '12px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e2f0',
    letterSpacing: '0.3px',
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 12px 16px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 14px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
  newBtnPlus: {
    fontSize: '18px',
    lineHeight: 1,
    fontWeight: '300',
  },
  section: {
    padding: '0 8px 16px',
  },
  sectionLabel: {
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '1.5px',
    color: '#3a3a5c',
    padding: '4px 8px 6px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#6666aa',
    fontSize: '13px',
    padding: '7px 8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: '#1e1e35',
    color: '#e2e2f0',
  },
  navIcon: {
    fontSize: '13px',
    width: '16px',
    textAlign: 'center',
  },
  langBadge: {
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 5px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  tagsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    padding: '0 8px',
  },
  tagChip: {
    background: 'transparent',
    border: '1px solid #1e1e30',
    borderRadius: '20px',
    color: '#4a4a7a',
    fontSize: '11px',
    padding: '3px 8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  tagChipActive: {
    background: '#4f46e522',
    border: '1px solid #4f46e544',
    color: '#a78bfa',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px 0',
    borderTop: '1px solid #1e1e30',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  userName: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#e2e2f0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '10px',
    color: '#3a3a5c',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#3a3a5c',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    flexShrink: 0,
  }
}