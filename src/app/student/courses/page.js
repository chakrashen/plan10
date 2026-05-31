'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate, calcPercent } from '@/lib/utils';

export default function StudentCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('enrollments')
      .select('*, courses(*, teachers(name))')
      .eq('student_id', user.id)
      .in('status', ['active', 'completed']);

    // Get progress for each enrollment
    const enriched = await Promise.all((data || []).map(async (enroll) => {
      const { data: progress } = await supabase
        .from('progress')
        .select('is_completed')
        .eq('student_id', user.id)
        .eq('course_id', enroll.course_id);
      
      const { count: totalClasses } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', enroll.course_id)
        .eq('is_published', true);

      const completedCount = (progress || []).filter(p => p.is_completed).length;
      return { ...enroll, completedCount, totalClasses: totalClasses || 0 };
    }));

    setEnrollments(enriched);
    setLoading(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>My Courses</h1>
          <p>All your enrolled courses in one place</p>
        </div>
        <Link href="/courses" className="btn btn-primary">🔍 Browse More Courses</Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Courses Yet</h3>
          <p>You haven&apos;t enrolled in any courses yet.</p>
          <Link href="/courses" className="btn btn-primary" style={{ marginTop: '16px' }}>Explore Courses</Link>
        </div>
      ) : (
        <div className="grid-2">
          {enrollments.map((enroll) => {
            const pct = calcPercent(enroll.completedCount, enroll.totalClasses);
            return (
              <Link key={enroll.id} href={`/student/courses/${enroll.course_id}`} className="course-list-card">
                <div className="course-list-header">
                  <span className="course-list-emoji">📘</span>
                  <div className="course-list-info">
                    <h3>{enroll.courses?.title}</h3>
                    <p>{enroll.courses?.teachers?.name || 'Instructor'} · {enroll.courses?.duration_weeks} Weeks</p>
                  </div>
                  <span className={`badge ${enroll.status === 'active' ? 'badge-success' : 'badge-info'}`}>{enroll.status}</span>
                </div>
                <div className="course-list-footer">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{enroll.completedCount}/{enroll.totalClasses} classes</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
