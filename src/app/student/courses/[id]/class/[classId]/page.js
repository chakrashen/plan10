'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getYouTubeEmbedUrl, formatDate } from '@/lib/utils';

export default function ClassPlayer() {
  const { id: courseId, classId } = useParams();
  const [cls, setCls] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadClass(); }, [classId]);

  async function loadClass() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: classData } = await supabase.from('classes').select('*').eq('id', classId).single();
    setCls(classData);

    const { data: allData } = await supabase
      .from('classes').select('id, title, order_index')
      .eq('course_id', courseId).eq('is_published', true)
      .order('order_index', { ascending: true });
    setAllClasses(allData || []);

    const { data: prog } = await supabase
      .from('progress')
      .select('is_completed')
      .eq('student_id', user.id).eq('class_id', classId)
      .single();
    setCompleted(prog?.is_completed || false);
    setLoading(false);
  }

  async function toggleComplete() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (completed) {
      await supabase.from('progress').update({ is_completed: false, completed_at: null })
        .eq('student_id', user.id).eq('class_id', classId);
    } else {
      await supabase.from('progress').upsert({
        student_id: user.id, course_id: courseId, class_id: classId,
        is_completed: true, completed_at: new Date().toISOString(),
      }, { onConflict: 'student_id,class_id' });
    }
    setCompleted(!completed);
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg"></div></div>;
  if (!cls) return <div className="card empty-state"><h3>Class Not Found</h3></div>;

  const currentIndex = allClasses.findIndex(c => c.id === classId);
  const prevClass = currentIndex > 0 ? allClasses[currentIndex - 1] : null;
  const nextClass = currentIndex < allClasses.length - 1 ? allClasses[currentIndex + 1] : null;
  const embedUrl = getYouTubeEmbedUrl(cls.youtube_url);

  return (
    <div className="fade-in">
      <Link href={`/student/courses/${courseId}`} className="btn btn-ghost btn-sm" style={{marginBottom: '16px'}}>
        ← Back to Course
      </Link>

      {/* Video Player */}
      {embedUrl ? (
        <div className="video-container">
          <iframe src={embedUrl} title={cls.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px', marginBottom: '24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎬</div>
          <h3>No Video Available</h3>
          <p style={{ color: 'var(--text-secondary)' }}>The instructor hasn&apos;t uploaded a video for this class yet.</p>
        </div>
      )}

      {/* Class Info */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
          <div>
            <span className="badge badge-accent" style={{ marginBottom: '8px' }}>Day {cls.day_number}</span>
            <h2 style={{ fontSize: '1.3rem' }}>{cls.title}</h2>
          </div>
          <button className={`btn ${completed ? 'btn-success' : 'btn-secondary'}`} onClick={toggleComplete}>
            {completed ? '✅ Completed' : '⬜ Mark Complete'}
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{cls.description || 'No description provided.'}</p>
        <div className="flex gap-md" style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {cls.duration_minutes && <span>⏱ {cls.duration_minutes} min</span>}
          {cls.class_date && <span>📅 {formatDate(cls.class_date)}</span>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        {prevClass ? (
          <Link href={`/student/courses/${courseId}/class/${prevClass.id}`} className="btn btn-secondary">← {prevClass.title}</Link>
        ) : <div />}
        {nextClass ? (
          <Link href={`/student/courses/${courseId}/class/${nextClass.id}`} className="btn btn-primary">{nextClass.title} →</Link>
        ) : <div />}
      </div>
    </div>
  );
}
