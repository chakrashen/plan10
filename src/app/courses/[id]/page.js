'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CourseDetailPublic() {
  const { theme, toggleTheme } = useTheme();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: c } = await supabase.from('courses').select('*, teachers(*)').eq('id', id).single();
      setCourse(c);
      const { data: cls } = await supabase.from('classes').select('title, day_number, duration_minutes').eq('course_id', id).eq('is_published', true).order('order_index');
      setClasses(cls || []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="page-loader" style={{minHeight:'100vh'}}><div className="spinner spinner-lg"></div></div>;
  if (!course) return <div style={{padding:'200px 24px',textAlign:'center'}}><h2>Course Not Found</h2><Link href="/courses" className="btn btn-primary" style={{marginTop:'16px'}}>Browse Courses</Link></div>;

  return (
    <div style={{minHeight:'100vh'}}>
      <nav className="landing-nav">
        <div className="nav-container">
          <Link href="/" className="nav-logo"><span className="logo-mark">P</span><span className="logo-text">Plan10</span></Link>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme}>{theme==='dark'?'☀️':'🌙'}</button>
            <Link href="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:'900px',margin:'0 auto',padding:'100px 24px 60px'}}>
        <Link href="/courses" className="btn btn-ghost btn-sm" style={{marginBottom:'20px'}}>← All Courses</Link>

        {/* Hero */}
        <div className="card" style={{marginBottom:'28px',padding:'36px'}}>
          <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
            <span className="badge badge-accent">{course.category}</span>
            <span className="badge badge-default">{course.difficulty}</span>
          </div>
          <h1 style={{fontSize:'1.8rem',marginBottom:'12px'}}>{course.title}</h1>
          <p style={{color:'var(--text-secondary)',fontSize:'1rem',lineHeight:1.7,marginBottom:'24px'}}>{course.description || course.short_description}</p>

          <div style={{display:'flex',gap:'24px',flexWrap:'wrap',marginBottom:'24px',fontSize:'0.9rem',color:'var(--text-muted)'}}>
            <span>👨‍🏫 {course.teachers?.name || 'Instructor'}</span>
            <span>⏱ {course.duration_weeks} Weeks</span>
            <span>📋 {classes.length} Classes</span>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <span style={{fontSize:'2rem',fontWeight:900,background:'var(--accent-gradient)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{formatCurrency(course.price)}</span>
            <Link href="/register" className="btn btn-primary btn-lg">Enroll Now →</Link>
          </div>
        </div>

        {/* Teacher */}
        {course.teachers && (
          <div className="card" style={{marginBottom:'28px'}}>
            <h2 style={{fontSize:'1.1rem',marginBottom:'16px'}}>Instructor</h2>
            <div className="flex items-center gap-md">
              <div className="avatar avatar-lg">{course.teachers.name?.[0]}</div>
              <div>
                <h3 style={{fontSize:'1rem'}}>{course.teachers.name}</h3>
                <p style={{fontSize:'0.82rem',color:'var(--accent-primary)',fontWeight:600}}>{course.teachers.specialization}</p>
                <p style={{fontSize:'0.85rem',color:'var(--text-secondary)',marginTop:'4px'}}>{course.teachers.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Curriculum */}
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border-color)'}}><h2 style={{fontSize:'1.1rem'}}>Curriculum ({classes.length} Classes)</h2></div>
          {classes.map((c, i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 24px',borderBottom:'1px solid var(--border-color)'}}>
              <div style={{width:'40px',height:'40px',borderRadius:'var(--radius-md)',background:'var(--accent-primary-light)',color:'var(--accent-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.85rem',flexShrink:0}}>D{c.day_number}</div>
              <div style={{flex:1}}>
                <h4 style={{fontSize:'0.9rem'}}>{c.title}</h4>
                {c.duration_minutes && <p style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>⏱ {c.duration_minutes} min</p>}
              </div>
              <span style={{fontSize:'1.2rem'}}>🔒</span>
            </div>
          ))}
          {classes.length === 0 && <div style={{padding:'40px',textAlign:'center',color:'var(--text-muted)'}}>Curriculum coming soon</div>}
        </div>
      </div>
    </div>
  );
}
