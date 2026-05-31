'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', qualification: '', experience_years: '', specialization: '', bio: '', email: '', phone: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from('teachers').select('*').order('created_at', { ascending: false });
    setTeachers(data || []);
    setLoading(false);
  }

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function openNew() { setEditId(null); setForm({ name: '', qualification: '', experience_years: '', specialization: '', bio: '', email: '', phone: '', is_active: true }); setShowModal(true); }
  function openEdit(t) { setEditId(t.id); setForm({ name: t.name, qualification: t.qualification || '', experience_years: String(t.experience_years || ''), specialization: t.specialization || '', bio: t.bio || '', email: t.email || '', phone: t.phone || '', is_active: t.is_active }); setShowModal(true); }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const payload = { ...form, experience_years: Number(form.experience_years) || 0 };
    if (editId) { await supabase.from('teachers').update(payload).eq('id', editId); }
    else { await supabase.from('teachers').insert(payload); }
    setSaving(false); setShowModal(false); load();
  }

  async function deleteTeacher(id) {
    if (!confirm('Delete this teacher?')) return;
    const supabase = createClient();
    await supabase.from('teachers').delete().eq('id', id);
    load();
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Teachers</h1><p>Manage instructor profiles</p></div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Teacher</button>
      </div>

      {teachers.length === 0 ? (
        <div className="card empty-state"><div className="empty-icon">👨‍🏫</div><h3>No Teachers Yet</h3><p>Add your first instructor.</p></div>
      ) : (
        <div className="grid-3">
          {teachers.map(t => (
            <div key={t.id} className="card" style={{ textAlign: 'center' }}>
              <div className="avatar avatar-lg" style={{ margin: '0 auto 12px' }}>{t.name?.[0]?.toUpperCase()}</div>
              <h3 style={{ fontSize: '1rem' }}>{t.name}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{t.specialization || 'Instructor'}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0' }}>{t.qualification} · {t.experience_years} yrs exp</p>
              <span className={`badge ${t.is_active ? 'badge-success' : 'badge-default'}`}>{t.is_active ? 'Active' : 'Inactive'}</span>
              <div className="flex gap-sm" style={{ marginTop: '12px', justifyContent: 'center' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteTeacher(t.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editId ? 'Edit Teacher' : 'New Teacher'}</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="auth-form">
              <div className="form-group"><label>Name *</label><input className="input" value={form.name} onChange={e => update('name', e.target.value)} /></div>
              <div className="grid-2">
                <div className="form-group"><label>Qualification</label><input className="input" value={form.qualification} onChange={e => update('qualification', e.target.value)} placeholder="e.g., PhD, MBA" /></div>
                <div className="form-group"><label>Experience (Years)</label><input className="input" type="number" value={form.experience_years} onChange={e => update('experience_years', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Specialization</label><input className="input" value={form.specialization} onChange={e => update('specialization', e.target.value)} placeholder="e.g., React, ML, Design" /></div>
              <div className="form-group"><label>Bio</label><textarea className="input" rows={2} value={form.bio} onChange={e => update('bio', e.target.value)} /></div>
              <div className="grid-2">
                <div className="form-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                <div className="form-group"><label>Phone</label><input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
              </div>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.name} style={{ width: '100%' }}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Teacher'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
