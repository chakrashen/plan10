'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { COURSE_CATEGORIES, DIFFICULTY_LEVELS } from '@/lib/constants';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', short_description: '', description: '', price: '', duration_weeks: '', total_classes: '', category: '', difficulty: 'Beginner', teacher_id: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from('courses').select('*, teachers(name)').order('created_at', { ascending: false });
    setCourses(data || []);
    const { data: t } = await supabase.from('teachers').select('id, name').eq('is_active', true);
    setTeachers(t || []);
    setLoading(false);
  }

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function openNew() { setEditId(null); setForm({ title: '', short_description: '', description: '', price: '', duration_weeks: '', total_classes: '', category: '', difficulty: 'Beginner', teacher_id: '', is_active: true }); setShowModal(true); }
  function openEdit(c) { setEditId(c.id); setForm({ title: c.title, short_description: c.short_description || '', description: c.description || '', price: c.price || '', duration_weeks: c.duration_weeks || '', total_classes: c.total_classes || '', category: c.category || '', difficulty: c.difficulty || 'Beginner', teacher_id: c.teacher_id || '', is_active: c.is_active }); setShowModal(true); }

  async function saveCourse() {
    setSaving(true);
    const supabase = createClient();
    const payload = { ...form, price: Number(form.price) || 0, duration_weeks: Number(form.duration_weeks) || 0, total_classes: Number(form.total_classes) || 0, teacher_id: form.teacher_id || null };
    if (editId) { await supabase.from('courses').update(payload).eq('id', editId); }
    else { await supabase.from('courses').insert(payload); }
    setSaving(false); setShowModal(false); load();
  }

  async function deleteCourse(id) {
    if (!confirm('Delete this course?')) return;
    const supabase = createClient();
    await supabase.from('courses').delete().eq('id', id);
    load();
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Course Management</h1><p>Create, edit, and manage all courses</p></div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Course</button>
      </div>

      {courses.length === 0 ? (
        <div className="card empty-state"><div className="empty-icon">📚</div><h3>No Courses Yet</h3><p>Create your first course to get started.</p></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Course</th><th>Category</th><th>Price</th><th>Duration</th><th>Teacher</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.title}</strong><br/><span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{c.short_description}</span></td>
                  <td><span className="badge badge-accent">{c.category || '—'}</span></td>
                  <td>{formatCurrency(c.price)}</td>
                  <td>{c.duration_weeks} wks</td>
                  <td>{c.teachers?.name || '—'}</td>
                  <td><span className={`badge ${c.is_active ? 'badge-success' : 'badge-default'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="flex gap-sm">
                      <Link href={`/admin/courses/${c.id}`} className="btn btn-ghost btn-sm">Classes</Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{color:'var(--danger)'}} onClick={() => deleteCourse(c.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editId ? 'Edit Course' : 'New Course'}</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="auth-form">
              <div className="form-group"><label>Title *</label><input className="input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Course title" /></div>
              <div className="form-group"><label>Short Description</label><input className="input" value={form.short_description} onChange={e => update('short_description', e.target.value)} placeholder="One-liner description" /></div>
              <div className="form-group"><label>Full Description</label><textarea className="input" rows={3} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Detailed description" /></div>
              <div className="grid-2">
                <div className="form-group"><label>Price (₹)</label><input className="input" type="number" value={form.price} onChange={e => update('price', e.target.value)} /></div>
                <div className="form-group"><label>Duration (Weeks)</label><input className="input" type="number" value={form.duration_weeks} onChange={e => update('duration_weeks', e.target.value)} /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Category</label><select className="input" value={form.category} onChange={e => update('category', e.target.value)}><option value="">Select</option>{COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Difficulty</label><select className="input" value={form.difficulty} onChange={e => update('difficulty', e.target.value)}>{DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Teacher</label><select className="input" value={form.teacher_id} onChange={e => update('teacher_id', e.target.value)}><option value="">Select teacher</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              <button className="btn btn-primary" onClick={saveCourse} disabled={saving || !form.title} style={{width:'100%'}}>{saving ? 'Saving...' : editId ? 'Update Course' : 'Create Course'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
