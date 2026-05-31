'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ student_name: '', content: '', rating: 5, is_featured: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    setTestimonials(data || []);
    setLoading(false);
  }

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function openNew() { setEditId(null); setForm({ student_name: '', content: '', rating: 5, is_featured: true }); setShowModal(true); }
  function openEdit(t) { setEditId(t.id); setForm({ student_name: t.student_name, content: t.content, rating: t.rating, is_featured: t.is_featured }); setShowModal(true); }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    if (editId) { await supabase.from('testimonials').update(form).eq('id', editId); }
    else { await supabase.from('testimonials').insert(form); }
    setSaving(false); setShowModal(false); load();
  }

  async function del(id) {
    if (!confirm('Delete?')) return;
    await createClient().from('testimonials').delete().eq('id', id);
    load();
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Testimonials</h1><p>Manage student reviews shown on the landing page</p></div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Testimonial</button>
      </div>

      {testimonials.length === 0 ? (
        <div className="card empty-state"><div className="empty-icon">💬</div><h3>No Testimonials</h3></div>
      ) : (
        <div className="grid-2">
          {testimonials.map(t => (
            <div key={t.id} className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <div className="flex items-center gap-sm">
                  <div className="avatar" style={{width:'36px',height:'36px',fontSize:'0.75rem'}}>{t.student_name?.[0]}</div>
                  <div>
                    <strong>{t.student_name}</strong>
                    <div style={{ color: '#f59e0b', fontSize: '0.85rem' }}>{'★'.repeat(t.rating)}{'☆'.repeat(5-t.rating)}</div>
                  </div>
                </div>
                <span className={`badge ${t.is_featured ? 'badge-success' : 'badge-default'}`}>{t.is_featured ? 'Featured' : 'Hidden'}</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>&ldquo;{t.content}&rdquo;</p>
              <div className="flex gap-sm" style={{ marginTop: '12px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => del(t.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editId ? 'Edit' : 'Add'} Testimonial</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="auth-form">
              <div className="form-group"><label>Student Name</label><input className="input" value={form.student_name} onChange={e => update('student_name', e.target.value)} /></div>
              <div className="form-group"><label>Review</label><textarea className="input" rows={3} value={form.content} onChange={e => update('content', e.target.value)} /></div>
              <div className="grid-2">
                <div className="form-group"><label>Rating (1-5)</label><input className="input" type="number" min={1} max={5} value={form.rating} onChange={e => update('rating', Number(e.target.value))} /></div>
                <div className="form-group"><label>Featured?</label><select className="input" value={form.is_featured} onChange={e => update('is_featured', e.target.value === 'true')}><option value="true">Yes</option><option value="false">No</option></select></div>
              </div>
              <button className="btn btn-primary" onClick={save} disabled={saving} style={{ width: '100%' }}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
