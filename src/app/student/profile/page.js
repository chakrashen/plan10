'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function StudentProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
    setUser(data);
    setForm(data || {});
    setLoading(false);
  }

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMsg('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      update('profile_photo_url', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  async function saveProfile() {
    setSaving(true); setMsg('');
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name, phone: form.phone,
      date_of_birth: form.date_of_birth, gender: form.gender,
      address: form.address, city: form.city, state: form.state, pincode: form.pincode,
      profile_photo_url: form.profile_photo_url,
    }).eq('id', user.id);
    if (error) { setMsg('Failed to save.'); } else { setMsg('Profile updated!'); setUser(form); setEditing(false); window.location.reload(); }
    setSaving(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  const fields = [
    { label: 'Full Name', key: 'full_name', type: 'text' },
    { label: 'Email', key: 'email', type: 'email', disabled: true },
    { label: 'Phone', key: 'phone', type: 'text' },
    { label: 'Date of Birth', key: 'date_of_birth', type: 'date' },
    { label: 'Gender', key: 'gender', type: 'text' },
    { label: 'Address', key: 'address', type: 'text' },
    { label: 'City', key: 'city', type: 'text' },
    { label: 'State', key: 'state', type: 'text' },
    { label: 'Pincode', key: 'pincode', type: 'text' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your personal information</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
        ) : (
          <div className="flex gap-sm">
            <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm(user); }}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        )}
      </div>

      {msg && <div className={`auth-error ${msg.includes('updated') ? '' : ''}`} style={{ marginBottom: '16px', background: msg.includes('updated') ? 'var(--success-light)' : 'var(--danger-light)', color: msg.includes('updated') ? 'var(--success)' : 'var(--danger)' }}>{msg}</div>}

      <div className="card">
        <div className="flex items-center gap-lg" style={{ marginBottom: '28px' }}>
          <div className="avatar avatar-xl">
            {form?.profile_photo_url ? (
              <img src={form.profile_photo_url} alt="Profile" />
            ) : (
              form?.full_name?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>{user?.full_name || 'Student'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user?.email}</p>
            <span className="badge badge-accent" style={{ marginTop: '6px' }}>Student</span>
            {editing && (
              <div style={{ marginTop: '12px' }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  📷 Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />
                </label>
                {form?.profile_photo_url && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ marginLeft: '8px', color: 'var(--danger)' }}
                    onClick={() => update('profile_photo_url', null)}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid-2">
          {fields.map((f) => (
            <div key={f.key} className="form-group">
              <label>{f.label}</label>
              {editing && !f.disabled ? (
                <input className="input" type={f.type} value={form[f.key] || ''} onChange={(e) => update(f.key, e.target.value)} />
              ) : (
                <p style={{ padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: form[f.key] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {form[f.key] || '—'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
