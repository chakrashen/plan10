'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import '../login/auth.css';

const STEPS = ['Account', 'Personal', 'Address', 'Complete'];

export default function RegisterPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', role: 'student',
    full_name: '', phone: '', date_of_birth: '', gender: '',
    address: '', city: '', state: '', pincode: '',
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!form.email || !form.password || !form.confirmPassword) return setError('All fields are required.') || false;
      if (form.password.length < 6) return setError('Password must be at least 6 characters.') || false;
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.') || false;
    }
    if (step === 1) {
      if (!form.full_name || !form.phone) return setError('Name and Phone are required.') || false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => s + 1); };
  const prevStep = () => setStep((s) => s - 1);

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // 1. Sign up with Supabase Auth
      const { data, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authErr) throw authErr;

      if (!data || !data.user) {
        throw new Error('This email is already registered. Please use a different email or sign in.');
      }

      // 2. Create profile
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.full_name,
        phone: form.phone,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        pincode: form.pincode || null,
        role: form.role,
      });
      if (profileErr) throw profileErr;

      // Save credentials for pre-filling on the login page
      if (typeof window !== 'undefined') {
        localStorage.setItem('registered_email', form.email);
        localStorage.setItem('registered_password', form.password);
        localStorage.setItem('registered_role', form.role);
      }

      // 3. Move to success step
      setStep(3);
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
        <div className="auth-card glass-card" style={{ maxWidth: '520px' }}>
          <div className="auth-header">
            <Link href="/" className="nav-logo">
              <span className="logo-mark">P</span>
              <span className="logo-text">Plan10</span>
            </Link>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" suppressHydrationWarning>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Plan10 and start your learning journey</p>

          {/* Progress Steps */}
          <div className="register-steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`step-item ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="step-dot">{i < step ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>

          {error && <div className="auth-error">{error}</div>}

          {/* Step 0: Account */}
          {step === 0 && (
            <div className="auth-form fade-in">
              <div className="form-group">
                <label>I am a</label>
                <div className="tabs" style={{ width: '100%' }}>
                  <button className={`tab ${form.role === 'student' ? 'active' : ''}`} onClick={() => update('role', 'student')} style={{ flex: 1 }} type="button">🎓 Student</button>
                  <button className={`tab ${form.role === 'admin' ? 'active' : ''}`} onClick={() => update('role', 'admin')} style={{ flex: 1 }} type="button">🛡️ Admin</button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <input id="reg-email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input id="reg-password" type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <input id="reg-confirm" type="password" className="input" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={nextStep}>Continue →</button>
            </div>
          )}

          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="auth-form fade-in">
              <div className="form-group">
                <label htmlFor="reg-name">Full Name *</label>
                <input id="reg-name" className="input" placeholder="Your full name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="reg-phone">Phone Number *</label>
                <input id="reg-phone" className="input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="reg-dob">Date of Birth</label>
                <input id="reg-dob" type="date" className="input" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <div className="flex gap-sm">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button key={g} type="button" className={`btn btn-sm ${form.gender === g.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`} onClick={() => update('gender', g.toLowerCase())}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-sm" style={{marginTop: '8px'}}>
                <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={prevStep}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={nextStep}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="auth-form fade-in">
              <div className="form-group">
                <label htmlFor="reg-address">Address</label>
                <textarea id="reg-address" className="input" placeholder="Your address" rows={2} value={form.address} onChange={(e) => update('address', e.target.value)}></textarea>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="reg-city">City</label>
                  <input id="reg-city" className="input" placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-state">State</label>
                  <input id="reg-state" className="input" placeholder="State" value={form.state} onChange={(e) => update('state', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-pincode">Pincode</label>
                <input id="reg-pincode" className="input" placeholder="400001" value={form.pincode} onChange={(e) => update('pincode', e.target.value)} />
              </div>
              <div className="flex gap-sm" style={{marginTop: '8px'}}>
                <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={prevStep}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={handleRegister} disabled={loading}>
                  {loading ? <span className="flex items-center gap-sm"><span className="spinner"></span> Creating...</span> : 'Create Account →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="auth-form fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ marginBottom: '8px' }}>Account Created!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Your Plan10 account is ready. Please check your email to verify your account, then log in.
              </p>
              <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Go to Login →
              </Link>
            </div>
          )}

          {step < 3 && (
            <p className="auth-footer-text">
              Already have an account? <Link href="/login" className="auth-link">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
