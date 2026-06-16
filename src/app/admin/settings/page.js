'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';

const KEYS = [
  { key: 'institute_name', label: 'Institute Name', type: 'text' },
  { key: 'tagline', label: 'Tagline', type: 'text' },
  { key: 'about_text', label: 'About Us', type: 'textarea' },
  { key: 'mission', label: 'Mission', type: 'textarea' },
  { key: 'vision', label: 'Vision', type: 'textarea' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'hours', label: 'Working Hours', type: 'text' },
];

export default function AdminSettings() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from('institute_info').select('*');
    const map = {};
    (data || []).forEach(d => { map[d.key] = d.value; });
    setSettings(map);
    setLoading(false);
  }

  const update = (key, value) => setSettings(p => ({ ...p, [key]: value }));

  async function save() {
    setSaving(true); setMsg('');
    const supabase = createClient();

    for (const k of KEYS) {
      if (settings[k.key] !== undefined) {
        await supabase.from('institute_info').upsert(
          { key: k.key, value: settings[k.key], updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      }
    }

    setMsg('Settings saved!');
    setSaving(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Institute Settings</h1><p>Manage your institute&apos;s public-facing information</p></div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : '💾 Save Settings'}</button>
      </div>

      {msg && <div style={{ padding:'10px 16px',borderRadius:'var(--radius-md)',background:'var(--success-light)',color:'var(--success)',fontWeight:500,fontSize:'0.85rem',marginBottom:'16px' }}>{msg}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Theme</span>
        <button 
          onClick={toggleTheme} 
          suppressHydrationWarning
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'var(--text-primary)'
          }}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="card">
        <div className="auth-form">
          {KEYS.map(k => (
            <div key={k.key} className="form-group">
              <label>{k.label}</label>
              {k.type === 'textarea' ? (
                <textarea className="input" rows={3} value={settings[k.key] || ''} onChange={e => update(k.key, e.target.value)} />
              ) : (
                <input className="input" type={k.type} value={settings[k.key] || ''} onChange={e => update(k.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
