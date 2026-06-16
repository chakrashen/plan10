'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import { NAV_STUDENT } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import './student.css';

const ICONS = {
  dashboard: '📊', courses: '📚', attendance: '📅', progress: '📈', profile: '👤', settings: '⚙️',
};

export default function StudentLayout({ children }) {
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
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
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link href="/" className="logo-icon">P</Link>
          <span>Plan10</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_STUDENT.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{ICONS[item.icon]}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">


          <div className="sidebar-user">
            <div className="avatar">
              {user?.profile_photo_url ? (
                <img src={user.profile_photo_url} alt={user.full_name} />
              ) : (
                getInitials(user?.full_name)
              )}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.full_name || 'Student'}</p>
              <p className="sidebar-user-role">Student</p>
            </div>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{width: '100%', marginTop: '8px'}}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile header */}
        <div className="mobile-header">
          <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">☰</button>
          <span className="logo-text">Plan10</span>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" style={{width: '36px', height: '36px', fontSize: '1rem'}}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
