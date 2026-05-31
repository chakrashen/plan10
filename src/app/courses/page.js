'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import './courses-public.css';

export default function CoursesPage() {
  const { theme, toggleTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('courses').select('*, teachers(name)').eq('is_active', true).order('created_at', { ascending: false });
      setCourses(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];
  const filtered = courses.filter(c => {
    const matchCat = filter === 'all' || c.category === filter;
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.short_description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="courses-public-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <Link href="/" className="nav-logo"><span className="logo-mark">P</span><span className="logo-text">Plan10</span></Link>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" suppressHydrationWarning>{theme==='dark'?'☀️':'🌙'}</button>
            <Link href="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="courses-hero">
        <h1>Explore Our Courses</h1>
        <p>Discover the perfect course to accelerate your career</p>
      </div>

      <div className="courses-body">
        <div className="courses-filters">
          <div className="search-bar" style={{ maxWidth: '100%' }}>
            <span className="search-icon">🔍</span>
            <input className="input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tabs" style={{ flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} className={`tab ${filter===c?'active':''}`} onClick={() => setFilter(c)} style={{textTransform:'capitalize'}}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner spinner-lg"></div></div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state"><div className="empty-icon">📚</div><h3>No Courses Found</h3></div>
        ) : (
          <div className="courses-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
            {filtered.map(c => (
              <Link key={c.id} href={`/courses/${c.id}`} className="course-card glass-card">
                <div className="course-emoji" style={{fontSize:'2.5rem',marginBottom:'16px'}}>📘</div>
                <div className="course-meta" style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                  <span className="badge badge-accent">{c.category}</span>
                  <span className="badge badge-default">{c.difficulty}</span>
                </div>
                <h3 style={{fontSize:'1.1rem',marginBottom:'8px'}}>{c.title}</h3>
                <p style={{fontSize:'0.85rem',color:'var(--text-secondary)',flex:1}}>{c.short_description}</p>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'16px',paddingTop:'16px',borderTop:'1px solid var(--border-color)'}}>
                  <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>👨‍🏫 {c.teachers?.name || 'Instructor'} · {c.duration_weeks} wks</span>
                  <span style={{fontSize:'1.2rem',fontWeight:800,background:'var(--accent-gradient)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{formatCurrency(c.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
