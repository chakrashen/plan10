'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function AdminCourseClasses() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', youtube_url: '', class_date: '', day_number: '', duration_minutes: '', is_published: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const supabase = createClient();
    const { data: c } = await supabase.from('courses').select('*').eq('id', id).single();
    setCourse(c);
    const { data: cls } = await supabase.from('classes').select('*').eq('course_id', id).order('order_index', { ascending: true });
    setClasses(cls || []);
    setLoading(false);
  }

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function openNew() {
    setEditId(null);
    setForm({ title: '', description: '', youtube_url: '', class_date: '', day_number: String(classes.length + 1), duration_minutes: '', is_published: true });
    setShowModal(true);
  }

  function openEdit(c) {
    setEditId(c.id);
    setForm({ title: c.title, description: c.description || '', youtube_url: c.youtube_url || '', class_date: c.class_date || '', day_number: String(c.day_number || ''), duration_minutes: String(c.duration_minutes || ''), is_published: c.is_published });
    setShowModal(true);
  }

  async function saveClass() {
    setSaving(true);
    const supabase = createClient();
    const payload = { ...form, course_id: id, day_number: Number(form.day_number) || 1, order_index: Number(form.day_number) || 1, duration_minutes: Number(form.duration_minutes) || 0, class_date: form.class_date || null };
    if (editId) { await supabase.from('classes').update(payload).eq('id', editId); }
    else { await supabase.from('classes').insert(payload); }
    setSaving(false); setShowModal(false); load();
  }

  async function deleteClass(cid) {
    if (!confirm('Delete this class?')) return;
    const supabase = createClient();
    await supabase.from('classes').delete().eq('id', cid);
    load();
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <Link href="/admin/courses" className="btn btn-ghost btn-sm" style={{ marginBottom: '8px' }}>← Back to Courses</Link>
          <h1>{course?.title || 'Course'} — Classes</h1>
          <p>Manage classes for this course. Add YouTube links, set schedule.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Class</button>
      </div>

      {classes.length === 0 ? (
        <div className="card empty-state"><div className="empty-icon">📋</div><h3>No Classes Yet</h3><p>Add classes with YouTube video links for students to watch.</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {classes.map(c => (
            <div key={c.id} className="class-item">
              <div className="class-day">D{c.day_number}</div>
              <div className="class-info">
                <h4>{c.title}</h4>
                <p>{c.duration_minutes ? `${c.duration_minutes} min` : ''} {c.class_date ? `· ${formatDate(c.class_date)}` : ''} {c.youtube_url ? '· 🎬 Video' : '· ⚠️ No Video'}</p>
              </div>
              <span className={`badge ${c.is_published ? 'badge-success' : 'badge-default'}`}>{c.is_published ? 'Published' : 'Draft'}</span>
              <div className="flex gap-sm">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteClass(c.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editId ? 'Edit Class' : 'New Class'}</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="auth-form">
              <div className="form-group"><label>Title *</label><input className="input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Class title" /></div>
              <div className="form-group"><label>Description</label><textarea className="input" rows={2} value={form.description} onChange={e => update('description', e.target.value)} placeholder="What this class covers" /></div>
              <div className="form-group"><label>YouTube URL *</label><input className="input" value={form.youtube_url} onChange={e => update('youtube_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
              <div className="grid-2">
                <div className="form-group"><label>Day Number</label><input className="input" type="number" value={form.day_number} onChange={e => update('day_number', e.target.value)} /></div>
                <div className="form-group"><label>Duration (min)</label><input className="input" type="number" value={form.duration_minutes} onChange={e => update('duration_minutes', e.target.value)} /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Class Date</label><input className="input" type="date" value={form.class_date} onChange={e => update('class_date', e.target.value)} /></div>
                <div className="form-group"><label>Published</label><select className="input" value={form.is_published} onChange={e => update('is_published', e.target.value === 'true')}><option value="true">Yes</option><option value="false">No (Draft)</option></select></div>
              </div>
              <button className="btn btn-primary" onClick={saveClass} disabled={saving || !form.title} style={{ width: '100%' }}>{saving ? 'Saving...' : editId ? 'Update Class' : 'Add Class'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
