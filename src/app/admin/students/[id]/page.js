'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate, calcPercent } from '@/lib/utils';

export default function AdminStudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const supabase = createClient();
    const { data: s } = await supabase.from('profiles').select('*').eq('id', id).single();
    setStudent(s);
    const { data: e } = await supabase.from('enrollments').select('*, courses(title)').eq('student_id', id);
    setEnrollments(e || []);
    const { data: a } = await supabase.from('attendance').select('*, classes(title, day_number)').eq('student_id', id).order('marked_at', { ascending: false }).limit(20);
    setAttendance(a || []);
    setLoading(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;
  if (!student) return <div className="card empty-state"><h3>Student Not Found</h3></div>;

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attPct = calcPercent(presentCount, attendance.length);

  const fields = [
    { label: 'Full Name', value: student.full_name },
    { label: 'Email', value: student.email },
    { label: 'Phone', value: student.phone },
    { label: 'Date of Birth', value: student.date_of_birth },
    { label: 'Gender', value: student.gender },
    { label: 'Address', value: student.address },
    { label: 'City', value: student.city },
    { label: 'State', value: student.state },
    { label: 'Pincode', value: student.pincode },
    { label: 'Joined', value: formatDate(student.created_at) },
  ];

  return (
    <div className="fade-in">
      <Link href="/admin/students" className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }}>← Back to Students</Link>
      <div className="page-header">
        <div className="flex items-center gap-lg">
          <div className="avatar avatar-xl">{student.full_name?.[0]?.toUpperCase() || '?'}</div>
          <div>
            <h1>{student.full_name}</h1>
            <p>{student.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="stat-card"><div className="stat-icon" style={{background:'var(--accent-primary-light)'}}>📚</div><div className="stat-info"><h3>{enrollments.length}</h3><p>Courses</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{background:'var(--success-light)'}}>📅</div><div className="stat-info"><h3>{attPct}%</h3><p>Attendance</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{background:'var(--info-light)'}}>📊</div><div className="stat-info"><h3>{attendance.length}</h3><p>Classes Attended</p></div></div>
      </div>

      {/* Profile Details */}
      <div className="section-title-row"><h2>Personal Information</h2></div>
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="grid-2">
          {fields.map(f => (
            <div key={f.label} className="form-group">
              <label>{f.label}</label>
              <p style={{padding:'10px 16px',background:'var(--bg-tertiary)',borderRadius:'var(--radius-md)',fontSize:'0.9rem',textTransform: f.label==='Gender'?'capitalize':'none'}}>{f.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollments */}
      <div className="section-title-row"><h2>Enrolled Courses</h2></div>
      {enrollments.length > 0 ? (
        <div className="table-container" style={{ marginBottom: '28px' }}>
          <table className="data-table">
            <thead><tr><th>Course</th><th>Status</th><th>Enrolled</th></tr></thead>
            <tbody>
              {enrollments.map(e => (
                <tr key={e.id}>
                  <td>{e.courses?.title || '—'}</td>
                  <td><span className={`badge badge-${e.status==='active'?'success':e.status==='pending'?'warning':'default'}`}>{e.status}</span></td>
                  <td>{formatDate(e.enrolled_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="card empty-state" style={{marginBottom:'28px'}}><p>No enrollments yet.</p></div>}

      {/* Recent Attendance */}
      <div className="section-title-row"><h2>Recent Attendance</h2></div>
      {attendance.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Class</th><th>Day</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a.id}>
                  <td>{a.classes?.title || '—'}</td>
                  <td>Day {a.classes?.day_number || '—'}</td>
                  <td><span className={`badge badge-${a.status==='present'?'success':a.status==='absent'?'danger':'warning'}`}>{a.status}</span></td>
                  <td>{formatDate(a.marked_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="card empty-state"><p>No attendance records.</p></div>}
    </div>
  );
}
