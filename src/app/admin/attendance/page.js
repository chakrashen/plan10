'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminAttendance() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    const supabase = createClient();
    const { data } = await supabase.from('courses').select('id, title').eq('is_active', true);
    setCourses(data || []);
    setLoading(false);
  }

  async function onCourseChange(courseId) {
    setSelectedCourse(courseId);
    setSelectedClass('');
    setStudents([]);
    const supabase = createClient();
    const { data } = await supabase.from('classes').select('id, title, day_number').eq('course_id', courseId).order('order_index');
    setClasses(data || []);
  }

  async function onClassChange(classId) {
    setSelectedClass(classId);
    const supabase = createClient();

    // Get enrolled students
    const { data: enrolls } = await supabase.from('enrollments').select('student_id, profiles(id, full_name, email)').eq('course_id', selectedCourse).eq('status', 'active');
    setStudents((enrolls || []).map(e => e.profiles).filter(Boolean));

    // Get existing attendance
    const { data: att } = await supabase.from('attendance').select('student_id, status').eq('class_id', classId);
    const map = {};
    (att || []).forEach(a => { map[a.student_id] = a.status; });
    setAttendance(map);
  }

  function setStatus(studentId, status) {
    setAttendance(p => ({ ...p, [studentId]: status }));
  }

  function markAllPresent() {
    const map = {};
    students.forEach(s => { map[s.id] = 'present'; });
    setAttendance(map);
  }

  async function saveAttendance() {
    setSaving(true); setMsg('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const records = Object.entries(attendance).map(([student_id, status]) => ({
      student_id, class_id: selectedClass, course_id: selectedCourse,
      status, marked_at: new Date().toISOString(), marked_by: user?.id,
    }));

    // Delete existing then insert
    await supabase.from('attendance').delete().eq('class_id', selectedClass);
    if (records.length > 0) await supabase.from('attendance').insert(records);

    setMsg('Attendance saved!');
    setSaving(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Mark Attendance</h1><p>Select a course and class to mark student attendance</p></div>
      </div>

      {/* Selectors */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="grid-2">
          <div className="form-group">
            <label>Course</label>
            <select className="input" value={selectedCourse} onChange={e => onCourseChange(e.target.value)}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Class</label>
            <select className="input" value={selectedClass} onChange={e => onClassChange(e.target.value)} disabled={!selectedCourse}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>Day {c.day_number} — {c.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      {msg && <div style={{ padding:'10px 16px',borderRadius:'var(--radius-md)',background:'var(--success-light)',color:'var(--success)',fontWeight:500,fontSize:'0.85rem',marginBottom:'16px' }}>{msg}</div>}

      {selectedClass && students.length > 0 && (
        <>
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Students ({students.length})</h2>
            <div className="flex gap-sm">
              <button className="btn btn-success btn-sm" onClick={markAllPresent}>✅ Mark All Present</button>
              <button className="btn btn-primary btn-sm" onClick={saveAttendance} disabled={saving}>{saving ? 'Saving...' : '💾 Save Attendance'}</button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Late</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.full_name}</strong><br/><span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{s.email}</span></td>
                    <td><button className={`btn btn-sm ${attendance[s.id]==='present'?'btn-success':'btn-secondary'}`} onClick={() => setStatus(s.id,'present')}>✅</button></td>
                    <td><button className={`btn btn-sm ${attendance[s.id]==='absent'?'btn-danger':'btn-secondary'}`} onClick={() => setStatus(s.id,'absent')}>❌</button></td>
                    <td><button className={`btn btn-sm ${attendance[s.id]==='late'?'btn-primary':'btn-secondary'}`} style={attendance[s.id]==='late'?{background:'var(--warning)',color:'#fff'}:{}} onClick={() => setStatus(s.id,'late')}>⏰</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedClass && students.length === 0 && (
        <div className="card empty-state"><div className="empty-icon">👥</div><h3>No Students Enrolled</h3><p>No active students are enrolled in this course.</p></div>
      )}
    </div>
  );
}
