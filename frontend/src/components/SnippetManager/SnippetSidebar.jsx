import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import DevKitLogo from '../ui/DevKitLogo'

const LANG_ICONS = {
  javascript: 'JS', typescript: 'TS', python: 'PY', java: 'JV',
  cpp: 'C+', css: 'CS', html: 'HT', json: 'JN', bash: 'SH', sql: 'SQ',
}

const LANG_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3572A5',
  java: '#b07219', cpp: '#f34b7d', css: '#563d7c', html: '#e34c26',
  json: '#40d080', bash: '#89e051', sql: '#e38c00',
}

export default function SnippetSidebar({
  user, filter, filterTag, filterLang,
  allTags, allLangs, onFilter, onFilterTag, onFilterLang, onNew, onLogout
}) {
  const navigate = useNavigate()
  const { theme: t } = useTheme()

  return (
    <aside style={{ width: '260px', minWidth: '220px', background: t.sidebar, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', padding: '0 0 16px 0', overflow: 'hidden', position: 'relative', zIndex: 10, transition: 'background 0.3s ease, border-color 0.3s ease' }}>

      {/* Logo */}
      <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 16px 14px', borderBottom: `1px solid ${t.border}`, cursor: 'pointer' }}>
        <DevKitLogo size={28} />
        <span style={{ fontSize: '15px', fontWeight: '700', color: t.text, letterSpacing: '0.4px' }}>DevKit</span>
      </div>

      {/* Tool badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', margin: '12px 16px 4px', background: '#10b98111', border: '1px solid #10b98133', borderRadius: '20px', color: '#34d399', fontSize: '11px', padding: '4px 12px', fontFamily: "'IBM Plex Mono', monospace", width: 'fit-content' }}>
        <span style={styles.toolBadgeDot} />
        Snippets
      </div>

      {/* New Snippet Button */}
      <button onClick={onNew} style={styles.newBtn}>
        <span style={{ fontSize: '18px', lineHeight: 1, fontWeight: '300' }}>+</span>
        New Snippet
      </button>

      {/* Library */}
      <div style={{ padding: '0 8px 14px' }}>
        <div style={{ ...styles.sectionLabel, color: t.sectionLabel }}>LIBRARY</div>
        {[
          { id: 'all', label: 'All Snippets', icon: '▦' },
          { id: 'public', label: 'Public', icon: '◈' },
          { id: 'private', label: 'Private', icon: '◉' },
        ].map(item => (
          <button key={item.id} onClick={() => onFilter(item.id)} style={{ ...styles.navItem, color: filter === item.id ? '#a78bfa' : t.textMuted, background: filter === item.id ? t.navItemActive : 'transparent', borderLeft: filter === item.id ? '2px solid #6366f1' : '2px solid transparent' }}>
            <span style={{ fontSize: '12px', width: '16px', textAlign: 'center', color: t.textMuted }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Languages */}
      {allLangs.length > 0 && (
        <div style={{ padding: '0 8px 14px' }}>
          <div style={{ ...styles.sectionLabel, color: t.sectionLabel }}>LANGUAGES</div>
          {allLangs.map(lang => (
            <button key={lang} onClick={() => onFilterLang(lang === filterLang ? '' : lang)} style={{ ...styles.navItem, color: filterLang === lang ? '#a78bfa' : t.textMuted, background: filterLang === lang ? t.navItemActive : 'transparent', borderLeft: filterLang === lang ? '2px solid #6366f1' : '2px solid transparent' }}>
              <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 5px', borderRadius: '4px', letterSpacing: '0.5px', fontFamily: "'IBM Plex Mono', monospace", background: `${LANG_COLORS[lang] || '#888'}22`, color: LANG_COLORS[lang] || '#888', border: `1px solid ${LANG_COLORS[lang] || '#888'}44` }}>
                {LANG_ICONS[lang] || lang.slice(0, 2).toUpperCase()}
              </span>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <div style={{ padding: '0 8px 14px' }}>
          <div style={{ ...styles.sectionLabel, color: t.sectionLabel }}>TAGS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0 8px' }}>
            {allTags.map(tag => (
              <button key={tag} onClick={() => onFilterTag(tag === filterTag ? '' : tag)} style={{ background: filterTag === tag ? '#4f46e518' : 'transparent', border: `1px solid ${filterTag === tag ? '#4f46e544' : t.border}`, borderRadius: '20px', color: filterTag === tag ? '#a78bfa' : t.textMuted, fontSize: '11px', padding: '3px 8px', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", transition: 'all 0.15s' }}>
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* User area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px 0', borderTop: `1px solid ${t.border}` }}>
        <div style={styles.avatar} onClick={() => navigate('/profile')}>
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username || 'User'}</div>
          <div style={{ fontSize: '10px', color: t.textFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'IBM Plex Mono', monospace" }}>{user?.email || ''}</div>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '5px', color: t.textMuted, cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}

const styles = {
  toolBadgeDot: { width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', animation: 'blink 2s ease-in-out infinite', flexShrink: 0 },
  newBtn: { display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 12px 14px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(99,102,241,0.25)' },
  sectionLabel: { fontSize: '9px', fontWeight: '600', letterSpacing: '1.5px', padding: '4px 8px 6px', fontFamily: "'IBM Plex Mono', monospace" },
  navItem: { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'transparent', border: 'none', borderRadius: '6px', fontSize: '13px', padding: '7px 8px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0, cursor: 'pointer' },
}