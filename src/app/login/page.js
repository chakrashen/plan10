'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import './auth.css';

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('registered_email');
      const savedPassword = localStorage.getItem('registered_password');
      const savedRole = localStorage.getItem('registered_role');
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      if (savedRole) setActiveTab(savedRole);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Fetch profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== activeTab) {
        await supabase.auth.signOut();
        setError(`This account is not registered as ${activeTab}. Please use the correct login.`);
        return;
      }

      router.push(activeTab === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-grid"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <Link href="/" className="nav-logo">
              <span className="logo-mark">P</span>
              <span className="logo-text">Plan10</span>
            </Link>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" suppressHydrationWarning>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your learning journey</p>

          {/* Role Toggle */}
          <div className="tabs" style={{ width: '100%', marginBottom: '24px' }}>
            <button
              className={`tab ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => setActiveTab('student')}
              style={{ flex: 1 }}
            >
              🎓 Student
            </button>
            <button
              className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{ flex: 1 }}
            >
              🛡️ Admin
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-sm"><span className="spinner"></span> Signing in...</span>
              ) : (
                `Sign in as ${activeTab === 'admin' ? 'Admin' : 'Student'} →`
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Don&apos;t have an account? <Link href="/register" className="auth-link">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
