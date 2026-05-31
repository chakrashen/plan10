'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', course_id: '', status: 'active', payment_status: 'paid' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: e } = await supabase.from('enrollments').select('*, profiles(full_name, email), courses(title)').order('enrolled_at', { ascending: false });
    setEnrollments(e || []);
    const { data: c } = await supabase.from('courses').select('id, title').eq('is_active', true);
    setCourses(c || []);
    const { data: s } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'student');
    setStudents(s || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    const supabase = createClient();
    const updates = { status };
    if (status === 'active') updates.approved_at = new Date().toISOString();
    await supabase.from('enrollments').update(updates).eq('id', id);
    load();
  }

  async function enrollStudent() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('enrollments').insert({
      ...form, enrolled_by: 'admin', enrolled_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    });
    setSaving(false); setShowModal(false); load();
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  const filtered = filter === 'all' ? enrollments : enrollments.filter(e => e.status === filter);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Enrollments</h1><p>Manage student course enrollments</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Enroll Student</button>
      </div>

      {/* Filters */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        {['all', 'pending', 'active', 'completed', 'rejected'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{textTransform:'capitalize'}}>{f} ({f === 'all' ? enrollments.length : enrollments.filter(e => e.status === f).length})</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state"><div className="empty-icon">📝</div><h3>No Enrollments</h3></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Course</th><th>Type</th><th>Date</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td><strong>{e.profiles?.full_name || '—'}</strong><br/><span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{e.profiles?.email}</span></td>
                  <td>{e.courses?.title || '—'}</td>
                  <td><span className="badge badge-default">{e.enrolled_by}</span></td>
                  <td>{formatDate(e.enrolled_at)}</td>
                  <td><span className={`badge badge-${e.payment_status==='paid'?'success':e.payment_status==='pending'?'warning':'info'}`}>{e.payment_status || 'pending'}</span></td>
                  <td><span className={`badge badge-${e.status==='active'?'success':e.status==='pending'?'warning':e.status==='rejected'?'danger':'default'}`}>{e.status}</span></td>
                  <td>
                    <div className="flex gap-sm">
                      {e.status === 'pending' && <>
                        <button className="btn btn-sm btn-success" onClick={() => updateStatus(e.id, 'active')}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => updateStatus(e.id, 'rejected')}>Reject</button>
                      </>}
                      {e.status === 'active' && <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(e.id, 'completed')}>Complete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enroll Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Enroll Student</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="auth-form">
              <div className="form-group"><label>Student</label><select className="input" value={form.student_id} onChange={e => setForm(p=>({...p,student_id:e.target.value}))}><option value="">Select student</option>{students.map(s=><option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}</select></div>
              <div className="form-group"><label>Course</label><select className="input" value={form.course_id} onChange={e => setForm(p=>({...p,course_id:e.target.value}))}><option value="">Select course</option>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
              <div className="form-group"><label>Payment Status</label><select className="input" value={form.payment_status} onChange={e => setForm(p=>({...p,payment_status:e.target.value}))}><option value="paid">Paid</option><option value="pending">Pending</option><option value="waived">Waived</option></select></div>
              <button className="btn btn-primary" onClick={enrollStudent} disabled={saving || !form.student_id || !form.course_id} style={{width:'100%'}}>{saving ? 'Enrolling...' : 'Enroll Student'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
