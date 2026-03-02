import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import DevKitLogo from '../../components/ui/DevKitLogo'

const SAMPLE_JSON = `{
  "app": "JSON Forge",
  "version": "2.0.1",
  "config": {
    "debug": true,
    "maxRetries": 3,
    "timeout": null,
    "tags": ["production", "v2", "stable"],
    "database": {
      "host": "db.example.com",
      "port": 5432,
      "credentials": {
        "user": "admin",
        "password": "••••••••"
      }
    }
  },
  "users": [
    { "id": 1, "name": "Alice Chen", "role": "admin", "active": true },
    { "id": 2, "name": "Bob Smith", "role": "viewer", "active": false },
    { "id": 3, "name": "Carol White", "role": "editor", "active": true }
  ],
  "meta": {
    "created": "2024-01-15T10:30:00Z",
    "updated": "2024-08-22T14:45:12Z",
    "checksum": 8472916350
  }
}`;

function typeColor(type) {
  const map = { string: "#4ade80", number: "#60a5fa", boolean: "#f472b6", null: "#a78bfa", object: "#fbbf24", array: "#fb923c" };
  return map[type] || "#e2e2f0";
}
function typeBg(type) {
  const map = { string: "rgba(74,222,128,0.1)", number: "rgba(96,165,250,0.1)", boolean: "rgba(244,114,182,0.1)", null: "rgba(167,139,250,0.1)", object: "rgba(251,191,36,0.1)", array: "rgba(251,146,60,0.1)" };
  return map[type] || "rgba(226,232,240,0.06)";
}
function getType(val) {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}
function countNodes(obj) {
  if (typeof obj !== "object" || obj === null) return 1;
  let c = 1; for (const k in obj) c += countNodes(obj[k]); return c;
}
function getDepth(obj, d = 0) {
  if (typeof obj !== "object" || obj === null) return d;
  let max = d; for (const k in obj) max = Math.max(max, getDepth(obj[k], d + 1)); return max;
}
function collectStats(obj) {
  let strings = 0, numbers = 0, booleans = 0, nulls = 0, objects = 0, arrays = 0, keys = 0;
  function walk(v) {
    const t = getType(v);
    if (t === "string") strings++;
    else if (t === "number") numbers++;
    else if (t === "boolean") booleans++;
    else if (t === "null") nulls++;
    else if (t === "array") { arrays++; v.forEach(walk); }
    else if (t === "object") { objects++; Object.keys(v).forEach(k => { keys++; walk(v[k]); }); }
  }
  walk(obj); return { strings, numbers, booleans, nulls, objects, arrays, keys };
}

function TreeNode({ keyName, value, depth, path, searchQuery, onCopyPath }) {
  const { theme: t } = useTheme()
  const type = getType(value);
  const isComplex = type === "object" || type === "array";
  const [collapsed, setCollapsed] = useState(depth > 2);
  const childCount = isComplex ? Object.keys(value).length : 0;
  const fullPath = path ? `${path}.${keyName}` : String(keyName);
  const matchesSearch = searchQuery && (
    String(keyName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (!isComplex && String(value).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderValue = () => {
    if (type === "string") return <span style={{ color: typeColor("string") }}>"{value}"</span>;
    if (type === "number") return <span style={{ color: typeColor("number") }}>{value}</span>;
    if (type === "boolean") return <span style={{ color: typeColor("boolean") }}>{String(value)}</span>;
    if (type === "null") return <span style={{ color: typeColor("null") }}>null</span>;
    return null;
  };

  return (
    <div style={{ marginLeft: depth * 18, fontFamily: "'IBM Plex Mono', monospace" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 6, cursor: isComplex ? "pointer" : "default", background: matchesSearch ? "rgba(251,191,36,0.12)" : "transparent", transition: "background 0.15s" }}
        onMouseEnter={e => !matchesSearch && (e.currentTarget.style.background = "rgba(99,102,241,0.06)")}
        onMouseLeave={e => !matchesSearch && (e.currentTarget.style.background = "transparent")}
        onClick={isComplex ? () => setCollapsed(!collapsed) : undefined}
      >
        {isComplex
          ? <span style={{ color: t.textFaint, fontSize: 10, width: 12, textAlign: "center", display: "inline-block", transition: "transform 0.2s", transform: collapsed ? "rotate(-90deg)" : "rotate(0)" }}>▼</span>
          : <span style={{ width: 12, display: "inline-block" }} />}

        {keyName !== undefined && (
          <span>
            <span style={{ color: '#6366f1', fontSize: 12, cursor: "pointer" }} onClick={e => { e.stopPropagation(); onCopyPath(fullPath); }} title="Click to copy path">{keyName}</span>
            <span style={{ color: t.textFaint, fontSize: 12 }}>: </span>
          </span>
        )}

        {isComplex ? (
          <span style={{ color: typeColor(type), fontSize: 12 }}>
            {type === "array" ? "[" : "{"}
            {collapsed && <span style={{ color: t.textMuted, fontSize: 11 }}> {childCount} {childCount === 1 ? (type === "array" ? "item" : "key") : (type === "array" ? "items" : "keys")} </span>}
            {collapsed && (type === "array" ? "]" : "}")}
          </span>
        ) : renderValue()}

        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 10, background: typeBg(type), color: typeColor(type), fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginLeft: 4 }}>{type}</span>
      </div>

      {isComplex && !collapsed && (
        <div>
          {Object.entries(value).map(([k, v]) => (
            <TreeNode key={k} keyName={type === "array" ? Number(k) : k} value={v} depth={depth + 1} path={fullPath} searchQuery={searchQuery} onCopyPath={onCopyPath} />
          ))}
          <div style={{ marginLeft: 0, padding: "3px 6px 3px 24px", color: typeColor(type), fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
            {type === "array" ? "]" : "}"}
          </div>
        </div>
      )}
    </div>
  );
}

function SyntaxHighlight({ json }) {
  const { theme: t } = useTheme()
  const highlighted = json
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let color = typeColor("number");
      if (/^"/.test(match)) { color = /:$/.test(match) ? '#a78bfa' : typeColor("string"); }
      else if (/true|false/.test(match)) color = typeColor("boolean");
      else if (/null/.test(match)) color = typeColor("null");
      return `<span style="color:${color}">${match}</span>`;
    });
  return (
    <pre style={{ margin: 0, padding: 20, overflow: "auto", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: t.text, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-all", background: 'transparent' }}
      dangerouslySetInnerHTML={{ __html: highlighted }} />
  );
}

const mono = "'IBM Plex Mono', monospace";

export default function JSONForge() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [indent, setIndent] = useState(2);
  const [view, setView] = useState("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState(null);
  const [sortKeys, setSortKeys] = useState(false);
  const [output, setOutput] = useState("");
  const { isDark, theme: t, toggleTheme } = useTheme()
  const fileRef = useRef();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const tryParse = useCallback((text, si = indent, sk = sortKeys) => {
    if (!text.trim()) { setParsed(null); setError(null); setOutput(""); setStats(null); return; }
    try {
      let obj = JSON.parse(text);
      if (sk) {
        const sortObj = (v) => {
          if (Array.isArray(v)) return v.map(sortObj);
          if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, val]) => [k, sortObj(val)]));
          return v;
        };
        obj = sortObj(obj);
      }
      const formatted = JSON.stringify(obj, null, si);
      setParsed(obj); setOutput(formatted); setError(null); setStats(collectStats(obj));
    } catch (e) {
      setError(e.message); setParsed(null); setStats(null); setOutput("");
    }
  }, [indent, sortKeys]);

  useEffect(() => { tryParse(input, indent, sortKeys); }, []);

  const handleInput = (v) => { setInput(v); tryParse(v, indent, sortKeys); };
  const handleIndent = (v) => { setIndent(v); tryParse(input, v, sortKeys); };
  const handleSortKeys = (v) => { setSortKeys(v); tryParse(input, indent, v); };
  const copy = (text) => { navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard!")); };
  const copyPath = (p) => showToast(`Path copied: ${p}`);
  const minify = () => { if (!parsed) return; const m = JSON.stringify(parsed); setInput(m); setOutput(m); };
  const prettify = () => { if (parsed) { const f = JSON.stringify(parsed, null, indent); setInput(f); setOutput(f); } };
  const download = () => {
    const blob = new Blob([output], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "formatted.json"; a.click();
  };
  const loadFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const tx = ev.target.result; setInput(tx); tryParse(tx, indent, sortKeys); };
    reader.readAsText(file);
  };

  const statItems = stats ? [
    { label: "Objects", val: stats.objects, type: "object" },
    { label: "Arrays", val: stats.arrays, type: "array" },
    { label: "Keys", val: stats.keys, type: "object" },
    { label: "Strings", val: stats.strings, type: "string" },
    { label: "Numbers", val: stats.numbers, type: "number" },
    { label: "Booleans", val: stats.booleans, type: "boolean" },
    { label: "Nulls", val: stats.nulls, type: "null" },
    { label: "Depth", val: parsed ? getDepth(parsed) : 0, type: "number" },
    { label: "Nodes", val: parsed ? countNodes(parsed) : 0, type: "array" },
    { label: "Size", val: output ? `${(output.length / 1024).toFixed(1)}kb` : "0kb", type: "string" },
  ] : [];

  return (
    <div style={{ height: '100vh', display: 'flex', background: t.page, color: t.text, fontFamily: "'Syne', sans-serif", overflow: 'hidden', position: 'relative', transition: 'background 0.3s ease, color 0.3s ease' }}>

      {/* Dot grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `radial-gradient(circle, ${t.dot} 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: 0.55, pointerEvents: 'none', zIndex: 0 }} />
      {isDark && <>
        <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 8s ease-in-out infinite', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-20%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 10s ease-in-out infinite 2s', zIndex: 0 }} />
      </>}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', minWidth: '220px', background: t.sidebar, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10, transition: 'background 0.3s ease, border-color 0.3s ease' }}>

        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 16px 14px', borderBottom: `1px solid ${t.border}`, cursor: 'pointer' }}>
          <DevKitLogo size={28} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: t.text, letterSpacing: '0.4px' }}>DevKit</span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', margin: '12px 16px 14px', background: '#fbbf2411', border: '1px solid #fbbf2433', borderRadius: '20px', color: '#fbbf24', fontSize: '11px', padding: '4px 12px', fontFamily: mono, width: 'fit-content' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fbbf24', animation: 'blink 2s ease-in-out infinite', flexShrink: 0 }} />
          JSON Forge
        </div>

        <div style={{ padding: '0 8px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, padding: '4px 8px 8px', textTransform: 'uppercase', fontFamily: mono }}>ACTIONS</div>

          {[
            { label: 'Prettify', icon: '{ }', onClick: prettify, disabled: !parsed },
            { label: 'Minify', icon: '—', onClick: minify, disabled: !parsed },
            { label: 'Import File', icon: '⬆', onClick: () => fileRef.current.click(), disabled: false },
            { label: 'Download', icon: '⬇', onClick: download, disabled: !parsed },
          ].map(b => (
            <button key={b.label} onClick={b.onClick} disabled={b.disabled}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'transparent', border: 'none', borderLeft: '2px solid transparent', borderRadius: '6px', color: b.disabled ? t.textDim : t.textMuted, fontSize: '13px', padding: '8px 10px', cursor: b.disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s', opacity: b.disabled ? 0.4 : 1 }}
              onMouseEnter={e => { if (!b.disabled) { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderLeftColor = '#6366f1'; e.currentTarget.style.color = '#a78bfa'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.color = b.disabled ? t.textDim : t.textMuted; }}>
              <span style={{ fontSize: '11px', fontFamily: mono, width: '18px', textAlign: 'center' }}>{b.icon}</span>
              {b.label}
            </button>
          ))}

          <div style={{ height: '1px', background: t.border, margin: '8px 8px' }} />

          <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, padding: '4px 8px 8px', textTransform: 'uppercase', fontFamily: mono }}>VIEW</div>
          {['tree', 'code', 'stats'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: view === v ? 'rgba(99,102,241,0.08)' : 'transparent', border: 'none', borderLeft: view === v ? '2px solid #6366f1' : '2px solid transparent', borderRadius: '6px', color: view === v ? '#a78bfa' : t.textMuted, fontSize: '13px', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '10px', fontFamily: mono, width: '18px', textAlign: 'center' }}>{v === 'tree' ? '🌲' : v === 'code' ? '</>' : '≡'}</span>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}

          <div style={{ height: '1px', background: t.border, margin: '8px 8px' }} />

          {/* Sort keys */}
          <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: t.textMuted }}>Sort Keys</span>
            <div onClick={() => handleSortKeys(!sortKeys)} style={{ width: '34px', height: '18px', borderRadius: '9px', background: sortKeys ? '#6366f1' : t.border, position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: sortKeys ? '19px' : '3px', transition: 'left 0.2s' }} />
            </div>
          </div>

          {/* Indent */}
          <div style={{ padding: '6px 10px' }}>
            <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, marginBottom: '8px', textTransform: 'uppercase', fontFamily: mono }}>INDENT</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[2, 4, '\t'].map(v => (
                <button key={v} onClick={() => handleIndent(v === '\t' ? '\t' : Number(v))} style={{ flex: 1, padding: '5px 4px', borderRadius: '6px', fontSize: '10px', border: `1px solid ${indent === (v === '\t' ? '\t' : Number(v)) ? '#6366f144' : t.border}`, background: indent === (v === '\t' ? '\t' : Number(v)) ? '#6366f118' : 'transparent', color: indent === (v === '\t' ? '\t' : Number(v)) ? '#a78bfa' : t.textMuted, cursor: 'pointer', fontFamily: mono, transition: 'all 0.15s' }}>{v === '\t' ? 'tab' : `${v}sp`}</button>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          {stats && (
            <div style={{ margin: '8px', padding: '10px', background: isDark ? '#fbbf2408' : '#fbbf2406', border: '1px solid #fbbf2422', borderRadius: '10px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, marginBottom: '8px', fontFamily: mono }}>QUICK STATS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { label: 'Depth', val: getDepth(parsed), color: '#60a5fa' },
                  { label: 'Keys', val: stats.keys, color: '#fbbf24' },
                  { label: 'Arrays', val: stats.arrays, color: '#fb923c' },
                  { label: 'Size', val: `${(output.length / 1024).toFixed(1)}k`, color: '#4ade80' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: s.color, fontFamily: mono, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '9px', color: t.textFaint, fontFamily: mono, marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User area */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${t.border}` }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div onClick={() => navigate('/profile')} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                <div style={{ fontSize: '10px', color: t.textFaint, fontFamily: mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || ''}</div>
              </div>
              <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '5px', color: t.textMuted, cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${t.border}`, background: t.sectionBg, backdropFilter: 'blur(12px)', flexShrink: 0, transition: 'background 0.3s, border-color 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>JSON Forge</span>
            <span style={{ fontSize: '11px', color: t.textMuted }}>— format, explore, analyze</span>
            {error && <span style={{ fontSize: '11px', color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', padding: '2px 8px', borderRadius: '20px', fontFamily: mono }}>⚠ Parse Error</span>}
            {parsed && !error && <span style={{ fontSize: '11px', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '2px 8px', borderRadius: '20px', fontFamily: mono }}>✓ Valid JSON</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {view === 'tree' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: t.input, border: `1px solid ${t.border}`, borderRadius: '7px', padding: '6px 10px' }}>
                <span style={{ color: t.textFaint, fontSize: '11px' }}>🔍</span>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search keys / values..." style={{ background: 'none', border: 'none', outline: 'none', color: t.text, fontSize: '12px', fontFamily: mono, width: '160px' }} />
                {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: t.textFaint, cursor: 'pointer', fontSize: '12px', padding: 0 }}>✕</button>}
              </div>
            )}
            <button onClick={() => copy(output)} disabled={!output} style={{ background: 'transparent', border: `1px solid ${t.border}`, borderRadius: '7px', color: t.textMuted, fontSize: '12px', padding: '6px 12px', cursor: !output ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: !output ? 0.4 : 1 }}>⎘ Copy</button>
          </div>
        </div>

        {/* Split pane */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

          {/* Input */}
          <div style={{ width: '44%', flexShrink: 0, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 16px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,16,0.5)' : 'rgba(248,248,252,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, textTransform: 'uppercase', fontFamily: mono }}>Input</span>
              <button onClick={() => { setInput(""); setParsed(null); setError(null); setOutput(""); setStats(null); }} style={{ fontSize: '10px', color: t.textFaint, background: 'none', border: `1px solid ${t.border}`, padding: '3px 8px', borderRadius: '5px', cursor: 'pointer', fontFamily: mono }}>Clear</button>
            </div>
            <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder="Paste your JSON here..." spellCheck={false}
              style={{ flex: 1, background: t.textarea, border: 'none', outline: 'none', color: error ? "#fca5a5" : t.text, fontFamily: mono, fontSize: 12, padding: 16, resize: 'none', lineHeight: 1.8, backdropFilter: 'blur(4px)', transition: 'background 0.3s, color 0.3s' }} />
            {error && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)', fontSize: 11, color: '#fca5a5', fontFamily: mono, flexShrink: 0 }}>
                <strong>Parse Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Output */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <div style={{ padding: '8px 16px', borderBottom: `1px solid ${t.border}`, background: isDark ? 'rgba(8,8,16,0.5)' : 'rgba(248,248,252,0.8)', fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, textTransform: 'uppercase', flexShrink: 0, fontFamily: mono }}>
              {view === 'tree' ? 'Tree Explorer' : view === 'code' ? 'Formatted Output' : 'Statistics'}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {!parsed && !error && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '42px', opacity: 0.15 }}>{'{}'}</div>
                  <span style={{ color: t.textFaint, fontSize: '13px', fontFamily: mono }}>Paste JSON on the left to begin</span>
                </div>
              )}
              {parsed && view === 'tree' && (
                <div style={{ padding: 16 }}>
                  <TreeNode keyName="root" value={parsed} depth={0} path="" searchQuery={searchQuery} onCopyPath={copyPath} />
                </div>
              )}
              {parsed && view === 'code' && <SyntaxHighlight json={output} />}
              {parsed && view === 'stats' && (
                <div style={{ padding: 20 }}>
                  <div style={{ marginBottom: '12px', fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, textTransform: 'uppercase', fontFamily: mono }}>JSON Statistics</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '28px' }}>
                    {statItems.map(s => (
                      <div key={s.label} style={{ background: typeBg(s.type), border: `1px solid ${typeColor(s.type)}22`, borderRadius: '10px', padding: '14px 16px' }}>
                        <div style={{ fontSize: '9px', color: t.textFaint, textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: mono, marginBottom: '6px' }}>{s.label}</div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: typeColor(s.type), fontFamily: mono }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', color: t.textFaint, textTransform: 'uppercase', fontFamily: mono, marginBottom: '14px' }}>Type Distribution</div>
                  {[
                    { label: "Strings", val: stats.strings, type: "string" },
                    { label: "Numbers", val: stats.numbers, type: "number" },
                    { label: "Booleans", val: stats.booleans, type: "boolean" },
                    { label: "Nulls", val: stats.nulls, type: "null" },
                  ].map(s => {
                    const total = stats.strings + stats.numbers + stats.booleans + stats.nulls || 1;
                    const pct = Math.round((s.val / total) * 100);
                    return (
                      <div key={s.label} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '12px', color: typeColor(s.type), fontFamily: mono }}>{s.label}</span>
                          <span style={{ fontSize: '11px', color: t.textMuted, fontFamily: mono }}>{s.val} ({pct}%)</span>
                        </div>
                        <div style={{ height: '5px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: typeColor(s.type), transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} style={{ position: 'fixed', bottom: '28px', right: '28px', width: '44px', height: '44px', borderRadius: '50%', background: t.toggleBg, border: `1px solid ${t.toggleBorder}`, boxShadow: t.toggleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 999, fontSize: '19px', transition: 'all 0.3s ease', backdropFilter: 'blur(8px)' }}>
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: toast.ok ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', border: `1px solid ${toast.ok ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, color: toast.ok ? '#4ade80' : '#f87171', padding: '9px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', backdropFilter: 'blur(20px)', zIndex: 1000, fontFamily: mono, animation: 'fadeIn 0.2s ease', whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>
      )}

      <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={loadFile} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#1e1e30' : '#d0d0e8'}; border-radius: 4px; }
        textarea::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
        input::placeholder { color: ${isDark ? '#2a2a45' : '#aaaacc'}; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.05)} }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}