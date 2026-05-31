'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate, calcPercent } from '@/lib/utils';

export default function StudentCourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCourse(); }, [id]);

  async function loadCourse() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: courseData } = await supabase.from('courses').select('*, teachers(*)').eq('id', id).single();
    setCourse(courseData);

    const { data: classData } = await supabase
      .from('classes')
      .select('*')
      .eq('course_id', id)
      .eq('is_published', true)
      .order('order_index', { ascending: true });
    setClasses(classData || []);

    const { data: progData } = await supabase
      .from('progress')
      .select('class_id, is_completed')
      .eq('student_id', user.id)
      .eq('course_id', id);

    const progMap = {};
    (progData || []).forEach(p => { progMap[p.class_id] = p.is_completed; });
    setProgress(progMap);
    setLoading(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;
  if (!course) return <div className="card empty-state"><h3>Course Not Found</h3></div>;

  const completedCount = Object.values(progress).filter(Boolean).length;
  const pct = calcPercent(completedCount, classes.length);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <Link href="/student/courses" className="btn btn-ghost btn-sm" style={{marginBottom: '8px'}}>← Back to Courses</Link>
          <h1>{course.title}</h1>
          <p>{course.teachers?.name || 'Instructor'} · {course.duration_weeks} Weeks · {classes.length} Classes</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <span style={{ fontWeight: 600 }}>Course Progress</span>
          <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{pct}%</span>
        </div>
        <div className="progress-bar-container" style={{ height: '12px' }}>
          <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          {completedCount} of {classes.length} classes completed
        </p>
      </div>

      {/* Course Description */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>About This Course</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{course.description || course.short_description || 'No description available.'}</p>
      </div>

      {/* Class List */}
      <div className="section-title-row">
        <h2>Classes ({classes.length})</h2>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {classes.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <div className="empty-icon">📋</div>
            <h3>No Classes Yet</h3>
            <p>The instructor hasn&apos;t published any classes for this course yet.</p>
          </div>
        ) : (
          classes.map((cls) => (
            <Link key={cls.id} href={`/student/courses/${id}/class/${cls.id}`} className="class-item">
              <div className={`class-day ${progress[cls.id] ? 'completed' : ''}`}>
                {progress[cls.id] ? '✓' : `D${cls.day_number}`}
              </div>
              <div className="class-info">
                <h4>{cls.title}</h4>
                <p>{cls.duration_minutes ? `${cls.duration_minutes} min` : ''} {cls.class_date ? `· ${formatDate(cls.class_date)}` : ''}</p>
              </div>
              <span className={`badge ${progress[cls.id] ? 'badge-success' : 'badge-default'}`}>
                {progress[cls.id] ? 'Completed' : 'Pending'}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
