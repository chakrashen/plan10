'use client';
import { useTheme } from '@/components/ThemeProvider';

export default function StudentSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your preferences</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '32px' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Theme</span>
        <button 
          onClick={toggleTheme} 
          suppressHydrationWarning
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'var(--text-primary)'
          }}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}
