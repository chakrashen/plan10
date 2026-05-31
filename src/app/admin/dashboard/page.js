'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, courses: 0, enrollments: 0, pending: 0 });
  const [recentEnrolls, setRecentEnrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    const supabase = createClient();

    const { count: students } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    const { count: courses } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    const { count: enrollments } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    setStats({ students: students || 0, courses: courses || 0, enrollments: enrollments || 0, pending: pending || 0 });

    const { data: recent } = await supabase
      .from('enrollments')
      .select('*, profiles(full_name, email), courses(title)')
      .order('enrolled_at', { ascending: false })
      .limit(8);
    setRecentEnrolls(recent || []);
    setLoading(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  const STAT_CARDS = [
    { label: 'Total Students', value: stats.students, icon: '👥', color: 'var(--accent-primary-light)' },
    { label: 'Active Courses', value: stats.courses, icon: '📚', color: 'var(--info-light)' },
    { label: 'Enrollments', value: stats.enrollments, icon: '📝', color: 'var(--success-light)' },
    { label: 'Pending Requests', value: stats.pending, icon: '⏳', color: 'var(--warning-light)' },
  ];

  return (
    <div className="fade-in">
      <div className="welcome-banner">
        <h1>Admin Dashboard 🛡️</h1>
        <p>Manage your institute, courses, students, and enrollments all in one place.</p>
      </div>

      <div className="quick-stats">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-title-row">
        <h2>Quick Actions</h2>
      </div>
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <Link href="/admin/courses" className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '2rem' }}>📚</span>
          <p style={{ fontWeight: 600, marginTop: '8px' }}>Manage Courses</p>
        </Link>
        <Link href="/admin/students" className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '2rem' }}>👥</span>
          <p style={{ fontWeight: 600, marginTop: '8px' }}>View Students</p>
        </Link>
        <Link href="/admin/enrollments" className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '2rem' }}>📝</span>
          <p style={{ fontWeight: 600, marginTop: '8px' }}>Enrollments</p>
        </Link>
        <Link href="/admin/attendance" className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '2rem' }}>📅</span>
          <p style={{ fontWeight: 600, marginTop: '8px' }}>Mark Attendance</p>
        </Link>
      </div>

      {/* Recent Enrollments */}
      <div className="section-title-row">
        <h2>Recent Enrollments</h2>
        <Link href="/admin/enrollments" className="btn btn-ghost btn-sm">View All →</Link>
      </div>

      {recentEnrolls.length === 0 ? (
        <div className="card empty-state"><div className="empty-icon">📭</div><h3>No Enrollments Yet</h3></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Course</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentEnrolls.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div><strong>{e.profiles?.full_name || '—'}</strong></div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.profiles?.email}</div>
                  </td>
                  <td>{e.courses?.title || '—'}</td>
                  <td>{formatDate(e.enrolled_at)}</td>
                  <td><span className={`badge badge-${e.status === 'active' ? 'success' : e.status === 'pending' ? 'warning' : 'default'}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
