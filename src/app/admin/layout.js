'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import { NAV_ADMIN } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import '../student/student.css';

const ICONS = {
  dashboard: '📊', courses: '📚', students: '👥', enrollments: '📝',
  attendance: '📅', teachers: '👨‍🏫', testimonials: '💬', settings: '⚙️',
};

export default function AdminLayout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        setUser(profile);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="dashboard-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link href="/" className="logo-icon">P</Link>
          <span>Plan10 <span style={{fontSize:'0.65rem',color:'var(--accent-primary)',fontWeight:700}}>ADMIN</span></span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ADMIN.map((item) => (
            <Link key={item.href} href={item.href}
              className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">{ICONS[item.icon]}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{getInitials(user?.full_name)}</div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.full_name || 'Admin'}</p>
              <p className="sidebar-user-role">Administrator</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{width:'100%',marginTop:'8px'}}>🚪 Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="mobile-header">
          <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">☰</button>
          <span className="logo-text">Plan10 Admin</span>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" style={{width:'36px',height:'36px',fontSize:'1rem'}}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
