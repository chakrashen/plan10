'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

// Dummy courses to fall back to if not in DB
const DUMMY_COURSES = [
  { id: '1', title: 'Full-Stack Web Development', category: 'Web Development', price: 14999 },
  { id: '2', title: 'Python & Data Science', category: 'Data Science', price: 12999 },
  { id: '3', title: 'UI/UX Design Mastery', category: 'Design', price: 9999 },
  { id: '4', title: 'Digital Marketing Pro', category: 'Marketing', price: 7999 },
  { id: '5', title: 'Advanced React & Next.js', category: 'Programming', price: 11999 },
  { id: '6', title: 'Mobile App Development', category: 'Programming', price: 13999 },
];

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      
      // Check auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        // Redirect to login but remember where to return
        router.push(`/login?next=/checkout/${id}`);
        return;
      }
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      setUser(profile || authUser);

      // Fetch course from DB
      const { data: dbCourse } = await supabase.from('courses').select('*').eq('id', id).single();
      
      if (dbCourse) {
        setCourse(dbCourse);
      } else {
        // Fallback to dummy data
        const dummy = DUMMY_COURSES.find(c => c.id === id);
        setCourse(dummy || null);
      }
      
      setLoading(false);
    }
    init();
  }, [id, router]);

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Attempt to enroll in DB
    const supabase = createClient();
    
    // Note: If course is from DUMMY_COURSES (not a UUID), this will fail due to foreign key constraint
    const { error: enrollError } = await supabase.from('enrollments').insert({
      student_id: user.id || user.sub,
      course_id: id,
      status: 'active',
      payment_status: 'paid',
      payment_amount: course.price
    });

    if (enrollError) {
      if (enrollError.code === '22P02' || enrollError.code === '23503') {
        // Invalid UUID format or Foreign key violation
        setError('Enrollment failed because this is a dummy course. Please ask your administrator to create a real course in the Admin Dashboard, and then enroll in that one.');
      } else {
        setError(`Failed to enroll: ${enrollError.message}`);
      }
      setProcessing(false);
    } else {
      // Success
      router.push('/student/dashboard?enrolled=success');
    }
  };

  if (loading) {
    return (
      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
        <nav className="landing-nav"><div className="nav-container"><Link href="/" className="nav-logo"><span className="logo-mark">P</span><span className="logo-text">Plan10</span></Link></div></nav>
        <div className="page-loader" style={{flex: 1}}><div className="spinner spinner-lg"></div></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{padding:'200px 24px',textAlign:'center'}}>
        <h2>Course Not Found</h2>
        <Link href="/courses" className="btn btn-primary" style={{marginTop:'16px'}}>Browse Courses</Link>
      </div>
    );
  }

  const tax = course.price * 0.18; // 18% GST example
  const total = course.price + tax;

  return (
    <div className="fade-in" style={{minHeight:'100vh', background:'var(--bg-primary)'}}>
      <nav className="landing-nav">
        <div className="nav-container">
          <Link href="/" className="nav-logo"><span className="logo-mark">P</span><span className="logo-text">Plan10</span></Link>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} suppressHydrationWarning>{theme==='dark'?'☀️':'🌙'}</button>
            <div className="avatar avatar-sm" style={{background:'var(--accent-primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:'bold'}}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:'800px', margin:'0 auto', padding:'100px 24px 60px'}}>
        <Link href={`/courses/${id}`} className="btn btn-ghost btn-sm" style={{marginBottom:'20px'}}>← Back to Course</Link>
        
        <div className="page-header" style={{marginBottom:'32px'}}>
          <div>
            <h1 style={{fontSize:'2rem', marginBottom:'8px'}}>Checkout</h1>
            <p>Complete your enrollment for {course.title}</p>
          </div>
        </div>

        {error && (
          <div className="card fade-in" style={{background:'var(--danger-light)', borderLeft:'4px solid var(--danger)', marginBottom:'24px'}}>
            <p style={{color:'var(--danger)', fontWeight:500}}>{error}</p>
          </div>
        )}

        <div className="grid-2" style={{alignItems:'start'}}>
          {/* Left Column: Order Summary */}
          <div className="card" style={{padding:'32px'}}>
            <h2 style={{fontSize:'1.2rem', marginBottom:'24px', borderBottom:'1px solid var(--border-color)', paddingBottom:'16px'}}>Order Summary</h2>
            
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
              <div>
                <h3 style={{fontSize:'1rem', marginBottom:'4px'}}>{course.title}</h3>
                <span className="badge badge-accent">{course.category || 'Course'}</span>
              </div>
              <div style={{fontWeight:600}}>{formatCurrency(course.price)}</div>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px', color:'var(--text-secondary)', fontSize:'0.9rem'}}>
              <span>Estimated Tax (18% GST)</span>
              <span>{formatCurrency(tax)}</span>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', marginTop:'24px', paddingTop:'24px', borderTop:'1px dashed var(--border-color)', fontSize:'1.2rem', fontWeight:800}}>
              <span>Total Payable</span>
              <span style={{color:'var(--accent-primary)'}}>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Right Column: Payment Actions */}
          <div className="card" style={{padding:'32px', background:'var(--bg-secondary)'}}>
            <h2 style={{fontSize:'1.2rem', marginBottom:'24px'}}>Payment Method</h2>
            
            <div style={{padding:'16px', border:'2px solid var(--accent-primary)', borderRadius:'var(--radius-md)', marginBottom:'24px', display:'flex', alignItems:'center', gap:'12px', background:'var(--bg-primary)'}}>
              <div style={{width:'24px', height:'24px', borderRadius:'50%', border:'6px solid var(--accent-primary)'}}></div>
              <div style={{fontWeight:600}}>Simulated Payment Gateway</div>
            </div>

            <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'24px', lineHeight:1.6}}>
              By clicking the button below, you agree to our Terms of Service and Privacy Policy. Your payment will be processed securely.
            </p>

            <button 
              className="btn btn-primary btn-lg" 
              style={{width:'100%', justifyContent:'center', fontSize:'1.1rem'}}
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="spinner spinner-sm" style={{marginRight:'8px'}}></div>
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(total)} & Enroll`
              )}
            </button>
            <p style={{textAlign:'center', fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'12px'}}>
              🔒 256-bit SSL encrypted checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
