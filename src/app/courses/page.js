'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { formatCurrency } from '@/lib/utils';
import './courses-public.css';

const COURSES = [
  { id: '1', title: 'Full-Stack Web Development', short_description: 'Master HTML, CSS, JavaScript, React, Node.js and build real-world projects.', category: 'Web Development', difficulty: 'Intermediate', duration_weeks: 12, price: 14999, image: '/image1.webp', teachers: {name: 'Dr. Anika Sharma'} },
  { id: '2', title: 'Python & Data Science', short_description: 'Learn Python, Pandas, Machine Learning and data visualization from scratch.', category: 'Data Science', difficulty: 'Beginner', duration_weeks: 10, price: 12999, image: '/image2.webp', teachers: {name: 'Prof. Rajesh Kumar'} },
  { id: '3', title: 'UI/UX Design Mastery', short_description: 'Design stunning interfaces using Figma, Adobe XD with design thinking.', category: 'Design', difficulty: 'Beginner', duration_weeks: 8, price: 9999, image: '/image3.webp', teachers: {name: 'Priya Mehta'} },
  { id: '4', title: 'Digital Marketing Pro', short_description: 'SEO, social media marketing, Google Ads, and analytics for business growth.', category: 'Marketing', difficulty: 'Beginner', duration_weeks: 6, price: 7999, image: '/image4.webp', teachers: {name: 'Arjun Patel'} },
  { id: '5', title: 'Advanced React & Next.js', short_description: 'Build production-grade apps with React 19, Next.js 15, and modern patterns.', category: 'Programming', difficulty: 'Advanced', duration_weeks: 8, price: 11999, image: '/image5.webp', teachers: {name: 'Dr. Anika Sharma'} },
  { id: '6', title: 'Mobile App Development', short_description: 'Create cross-platform apps with React Native and deploy to App Store & Play Store.', category: 'Programming', difficulty: 'Intermediate', duration_weeks: 10, price: 13999, image: '/image6.webp', teachers: {name: 'Dr. Anika Sharma'} },
];

export default function CoursesPage() {
  const { theme, toggleTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setCourses(COURSES);
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
                <div style={{height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '16px'}}>
                  <img src={c.image} alt={c.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} loading="lazy" />
                </div>
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
