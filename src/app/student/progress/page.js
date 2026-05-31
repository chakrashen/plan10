'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calcPercent } from '@/lib/utils';

export default function StudentProgress() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProgress(); }, []);

  async function loadProgress() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: enrolls } = await supabase
      .from('enrollments').select('*, courses(id, title, total_classes)')
      .eq('student_id', user.id).in('status', ['active', 'completed']);

    const enriched = await Promise.all((enrolls || []).map(async (enroll) => {
      const { data: progress } = await supabase
        .from('progress').select('is_completed')
        .eq('student_id', user.id).eq('course_id', enroll.course_id);

      const { count } = await supabase
        .from('classes').select('*', { count: 'exact', head: true })
        .eq('course_id', enroll.course_id).eq('is_published', true);

      const done = (progress || []).filter(p => p.is_completed).length;
      return { ...enroll, done, total: count || 0 };
    }));

    setCourses(enriched);
    setLoading(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;

  const totalDone = courses.reduce((a, c) => a + c.done, 0);
  const totalAll = courses.reduce((a, c) => a + c.total, 0);
  const overallPct = calcPercent(totalDone, totalAll);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Progress</h1>
          <p>Track your learning progress across all courses</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ marginBottom: '28px', textAlign: 'center', padding: '40px' }}>
        <div className="progress-ring-container">
          <div className="progress-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <circle className="progress-ring-bg" cx="60" cy="60" r="52" />
              <circle
                className="progress-ring-fill"
                cx="60" cy="60" r="52"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - overallPct / 100)}`}
              />
            </svg>
            <div className="progress-ring-text">{overallPct}%</div>
          </div>
          <h3 style={{ fontSize: '1.1rem' }}>Overall Progress</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {totalDone} of {totalAll} classes completed
          </p>
        </div>
      </div>

      {/* Per Course Progress */}
      <h2 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Course-wise Progress</h2>

      {courses.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Progress Data</h3>
          <p>Start watching classes to track your progress!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {courses.map((c) => {
            const pct = calcPercent(c.done, c.total);
            return (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem' }}>{c.courses?.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.done}/{c.total} classes</p>
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{pct}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
