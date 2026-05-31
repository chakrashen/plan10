'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calcPercent, formatDate } from '@/lib/utils';

export default function StudentAttendance() {
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAttendance(); }, []);

  async function loadAttendance() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: enrolls } = await supabase
      .from('enrollments').select('course_id, courses(id, title)')
      .eq('student_id', user.id).eq('status', 'active');

    setCourses((enrolls || []).map(e => e.courses));

    const { data: att } = await supabase
      .from('attendance').select('*, classes(title, day_number, class_date), courses(title)')
      .eq('student_id', user.id)
      .order('marked_at', { ascending: false });

    setAttendance(att || []);
    setLoading(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  const filtered = selectedCourse === 'all' ? attendance : attendance.filter(a => a.course_id === selectedCourse);
  const present = filtered.filter(a => a.status === 'present').length;
  const absent = filtered.filter(a => a.status === 'absent').length;
  const late = filtered.filter(a => a.status === 'late').length;
  const total = filtered.length;
  const pct = calcPercent(present + late, total);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Track your class attendance records</p>
        </div>
        <select className="input" style={{ maxWidth: '250px' }} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {courses.map(c => c && <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="quick-stats" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-primary-light)' }}>📊</div>
          <div className="stat-info"><h3>{pct}%</h3><p>Attendance Rate</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>✅</div>
          <div className="stat-info"><h3>{present}</h3><p>Present</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-light)' }}>❌</div>
          <div className="stat-info"><h3>{absent}</h3><p>Absent</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>⏰</div>
          <div className="stat-info"><h3>{late}</h3><p>Late</p></div>
        </div>
      </div>

      {/* Attendance Table */}
      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📅</div>
          <h3>No Attendance Records</h3>
          <p>Your attendance will appear here once instructors start marking it.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Class</th>
                <th>Day</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{formatDate(a.classes?.class_date || a.marked_at)}</td>
                  <td>{a.courses?.title || '—'}</td>
                  <td>{a.classes?.title || '—'}</td>
                  <td>Day {a.classes?.day_number || '—'}</td>
                  <td>
                    <span className={`badge badge-${a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : 'warning'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
