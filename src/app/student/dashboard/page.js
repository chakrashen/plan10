'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate, calcPercent } from '@/lib/utils';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({ courses: 0, attendance: 0, completed: 0, totalClasses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
    setUser(profile);

    const { data: enrolls } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('student_id', authUser.id)
      .eq('status', 'active');

    setEnrollments(enrolls || []);

    // Get attendance stats
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', authUser.id);

    const presentCount = (attendance || []).filter(a => a.status === 'present').length;
    const totalAttendance = (attendance || []).length;

    // Get progress stats
    const { data: progress } = await supabase
      .from('progress')
      .select('is_completed')
      .eq('student_id', authUser.id);

    const completedClasses = (progress || []).filter(p => p.is_completed).length;

    setStats({
      courses: (enrolls || []).length,
      attendance: totalAttendance > 0 ? calcPercent(presentCount, totalAttendance) : 100,
      completed: completedClasses,
      totalClasses: (progress || []).length,
    });

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Enrolled Courses', value: stats.courses, icon: '📚', color: 'var(--accent-primary-light)' },
    { label: 'Attendance', value: `${stats.attendance}%`, icon: '📅', color: 'var(--success-light)' },
    { label: 'Classes Done', value: stats.completed, icon: '✅', color: 'var(--info-light)' },
    { label: 'Total Classes', value: stats.totalClasses, icon: '📖', color: 'var(--warning-light)' },
  ];

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h1>Welcome back, {user?.full_name?.split(' ')[0] || 'Student'} 👋</h1>
        <p>Ready to continue your learning journey? You have {stats.courses} active course{stats.courses !== 1 ? 's' : ''}.</p>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled Courses */}
      <div className="section-title-row">
        <h2>My Courses</h2>
        <Link href="/student/courses" className="btn btn-ghost btn-sm">View All →</Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Courses Yet</h3>
          <p>You haven&apos;t enrolled in any courses. Browse our catalog to get started!</p>
          <Link href="/courses" className="btn btn-primary" style={{ marginTop: '16px' }}>Explore Courses</Link>
        </div>
      ) : (
        <div className="grid-2" style={{ marginBottom: '28px' }}>
          {enrollments.slice(0, 4).map((enroll) => (
            <Link key={enroll.id} href={`/student/courses/${enroll.course_id}`} className="course-list-card">
              <div className="course-list-header">
                <span className="course-list-emoji">📘</span>
                <div className="course-list-info">
                  <h3>{enroll.courses?.title || 'Course'}</h3>
                  <p>{enroll.courses?.short_description || enroll.courses?.category}</p>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
              <div className="course-list-footer">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Enrolled: {formatDate(enroll.enrolled_at)}
                </span>
                <span className="btn btn-ghost btn-sm">Open →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
