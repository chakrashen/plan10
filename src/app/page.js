'use client';
import { useTheme } from '@/components/ThemeProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import './landing.css';

/* ===== Dummy Data ===== */
const COURSES = [
  { id: 1, title: 'Full-Stack Web Development', desc: 'Master HTML, CSS, JavaScript, React, Node.js and build real-world projects.', category: 'Web Development', difficulty: 'Intermediate', duration: '12 Weeks', price: '₹14,999', image: '/image1.webp', students: 342 },
  { id: 2, title: 'Python & Data Science', desc: 'Learn Python, Pandas, Machine Learning and data visualization from scratch.', category: 'Data Science', difficulty: 'Beginner', duration: '10 Weeks', price: '₹12,999', image: '/image2.webp', students: 289 },
  { id: 3, title: 'UI/UX Design Mastery', desc: 'Design stunning interfaces using Figma, Adobe XD with design thinking.', category: 'Design', difficulty: 'Beginner', duration: '8 Weeks', price: '₹9,999', image: '/image3.webp', students: 198 },
  { id: 4, title: 'Digital Marketing Pro', desc: 'SEO, social media marketing, Google Ads, and analytics for business growth.', category: 'Marketing', difficulty: 'Beginner', duration: '6 Weeks', price: '₹7,999', image: '/image4.webp', students: 456 },
  { id: 5, title: 'Advanced React & Next.js', desc: 'Build production-grade apps with React 19, Next.js 15, and modern patterns.', category: 'Programming', difficulty: 'Advanced', duration: '8 Weeks', price: '₹11,999', image: '/image5.webp', students: 167 },
  { id: 6, title: 'Mobile App Development', desc: 'Create cross-platform apps with React Native and deploy to App Store & Play Store.', category: 'Programming', difficulty: 'Intermediate', duration: '10 Weeks', price: '₹13,999', image: '/image6.webp', students: 223 },
];

const TEACHERS = [
  { id: 1, name: 'Dr. Anika Sharma', role: 'Lead Instructor — Web Development', bio: '10+ years building scalable web applications at top tech companies.', specialization: 'React, Node.js, System Design', avatar: '/image13.webp' },
  { id: 2, name: 'Prof. Rajesh Kumar', role: 'Senior Instructor — Data Science', bio: 'PhD in Machine Learning. Published 20+ research papers in AI.', specialization: 'Python, ML, Deep Learning', avatar: '/image14.webp' },
  { id: 3, name: 'Priya Mehta', role: 'Design Lead', bio: 'Former design lead at a Fortune 500. Passionate about user experience.', specialization: 'UI/UX, Figma, Design Systems', avatar: '/iamge15.webp' },
  { id: 4, name: 'Arjun Patel', role: 'Marketing Strategist', bio: '8 years of digital marketing experience. Helped 100+ businesses scale.', specialization: 'SEO, Google Ads, Analytics', avatar: '/image16.webp' },
];

const TESTIMONIALS = [
  { id: 1, name: 'Sneha Gupta', course: 'Full-Stack Web Development', text: 'Plan10 completely transformed my career. The hands-on projects and mentorship are unmatched. Landed my dream job within 2 months!', rating: 5, avatar: '👩' },
  { id: 2, name: 'Amit Singh', course: 'Python & Data Science', text: 'The best learning experience I have ever had. The instructors are incredibly knowledgeable and patient. Worth every penny!', rating: 5, avatar: '👨' },
  { id: 3, name: 'Riya Desai', course: 'UI/UX Design Mastery', text: 'From zero design skills to getting hired as a UX designer. Plan10 made it possible with their structured curriculum.', rating: 5, avatar: '👩' },
  { id: 4, name: 'Vikram Joshi', course: 'Digital Marketing Pro', text: 'I tripled my freelance income after completing the Digital Marketing course. The real-world case studies were game-changers.', rating: 4, avatar: '👨' },
];

const TESTIMONIAL_BG_IMAGES = [
  '/Screenshot 2026-05-31 153635.webp',
  '/Screenshot 2026-05-31 153654.webp',
  '/Screenshot 2026-05-31 153722.webp',
  '/Screenshot 2026-05-31 153733.webp',
];

const STATS = [
  { number: '1000+', label: 'Active Students', icon: '/image7.webp' },
  { number: '50+', label: 'Expert Courses', icon: '/image8.webp' },
  { number: '25+', label: 'Top Instructors', icon: '/image9.webp' },
  { number: '95%', label: 'Success Rate', icon: '/image10.webp' },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);
  const [contactStatus, setContactStatus] = useState({ loading: false, success: null, error: null });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value;
    const email = document.getElementById('contact-email')?.value;
    const message = document.getElementById('contact-message')?.value;

    if (!name || !email || !message) {
      setContactStatus({ loading: false, success: false, error: 'Please fill in all fields.' });
      return;
    }

    setContactStatus({ loading: true, success: null, error: null });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (data.success) {
        setContactStatus({ loading: false, success: true, error: null });
        if (document.getElementById('contact-name')) document.getElementById('contact-name').value = '';
        if (document.getElementById('contact-email')) document.getElementById('contact-email').value = '';
        if (document.getElementById('contact-message')) document.getElementById('contact-message').value = '';
      } else {
        setContactStatus({ loading: false, success: false, error: data.error || 'Something went wrong.' });
      }
    } catch (err) {
      console.error(err);
      setContactStatus({ loading: false, success: false, error: 'Failed to submit. Please try again.' });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-page">
      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">Plan10</span>
          </Link>
          <div className={`nav-links ${mobileNav ? 'open' : ''}`}>
            <a href="#courses">Courses</a>
            <a href="#about">About</a>
            <a href="#teachers">Teachers</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" suppressHydrationWarning>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link href="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
            <button className="mobile-toggle" onClick={() => setMobileNav(!mobileNav)} aria-label="Menu">
              {mobileNav ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="hero-video"
            src="/background.mp4"
          />
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="hero-grid"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">🚀 #1 Learning Platform</div>
          <h1 className="hero-title">
            Empowering Minds,<br />
            <span className="gradient-text">Transforming Futures</span>
          </h1>
          <p className="hero-subtitle">
            Join 1000+ students mastering in-demand skills with expert-led courses,
            hands-on projects, and personalized mentorship at Plan10.
          </p>
          <div className="hero-cta">
            <Link href="/register" className="btn btn-primary btn-lg">
              Start Learning Today →
            </Link>
            <Link href="#courses" className="btn btn-secondary btn-lg">
              Explore Courses
            </Link>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              {['😊', '😄', '🤩', '😎', '🥳'].map((e, i) => (
                <span key={i} className="trust-avatar">{e}</span>
              ))}
            </div>
            <p><strong>1,000+</strong> students already enrolled</p>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-section">
        <div className="stats-grid">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-item">
              <img src={stat.icon} alt={stat.label} className="stat-full-image" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section id="courses" className="section courses-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Our Courses</span>
            <h2>Master In-Demand Skills</h2>
            <p>Choose from our curated collection of industry-relevant courses designed by experts.</p>
          </div>
          <div className="courses-grid">
            {COURSES.map((course) => (
              <div key={course.id} className="course-card glass-card">
                <div className="course-image-container">
                  <img src={course.image} alt={course.title} className="course-image" loading="lazy" />
                </div>
                <div className="course-meta">
                  <span className="badge badge-accent">{course.category}</span>
                  <span className="badge badge-default">{course.difficulty}</span>
                </div>
                <h3>{course.title}</h3>
                <p>{course.desc}</p>
                <div className="course-footer">
                  <div className="course-info">
                    <span>⏱ {course.duration}</span>
                    <span>👥 {course.students} students</span>
                  </div>
                  <div className="course-price">{course.price}</div>
                </div>
                <Link href={`/courses/${course.id}`} className="btn btn-primary" style={{width:'100%', marginTop: '12px'}}>
                  View Course →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="section about-section">
        <div className="section-container about-grid">
          <div className="about-content">
            <span className="section-tag">About Plan10</span>
            <h2>Where Passion Meets Excellence</h2>
            <p>
              Plan10 is more than an institute — it is a launchpad for your career. Founded with the mission
              to bridge the gap between education and industry, we offer cutting-edge courses taught by
              professionals who have walked the path.
            </p>
            <div className="about-features">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <div>
                  <h4>Industry-Aligned Curriculum</h4>
                  <p>Courses designed with real-world projects and case studies.</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👨‍🏫</span>
                <div>
                  <h4>Expert Mentorship</h4>
                  <p>Learn directly from industry veterans with decades of experience.</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💼</span>
                <div>
                  <h4>Career Support</h4>
                  <p>Resume building, mock interviews, and placement assistance.</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <div>
                  <h4>Flexible Learning</h4>
                  <p>Access recorded lectures, attend live classes, learn at your pace.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-visual">
            <div className="about-card">
              <img src="/image11.webp" alt="Our Mission" className="about-full-image" loading="lazy" />
            </div>
            <div className="about-card">
              <img src="/image12.webp" alt="Our Vision" className="about-full-image" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== TEACHERS ===== */}
      <section id="teachers" className="section teachers-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Our Instructors</span>
            <h2>Learn From The Best</h2>
            <p>Our instructors are industry veterans committed to your success.</p>
          </div>
          <div className="teachers-grid">
            {TEACHERS.map((teacher) => (
              <div key={teacher.id} className="teacher-card glass-card">
                <div className="teacher-avatar-container">
                  <img src={teacher.avatar} alt={teacher.name} className="teacher-image" loading="lazy" />
                </div>
                <h3>{teacher.name}</h3>
                <p className="teacher-role">{teacher.role}</p>
                <p className="teacher-bio">{teacher.bio}</p>
                <div className="teacher-spec">
                  {teacher.specialization.split(', ').map((s, i) => (
                    <span key={i} className="badge badge-accent">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="section testimonials-section">
        <div className="testimonials-bg-slider">
          <div 
            className="testimonials-bg-track" 
            style={{ transform: `translateX(-${currentTestimonial * 25}%)` }}
          >
            {TESTIMONIAL_BG_IMAGES.map((img, i) => (
              <div 
                key={i} 
                className="testimonials-bg-slide"
                style={{ backgroundImage: `url('${encodeURI(img)}')` }}
              />
            ))}
          </div>
          <div className="testimonials-overlay"></div>
        </div>
        <div className="section-container" style={{ minHeight: '560px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div className="testimonial-dots" style={{ zIndex: 10, marginBottom: '20px' }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} className={`dot ${i === currentTestimonial ? 'active' : ''}`} onClick={() => setCurrentTestimonial(i)} aria-label={`Slide ${i+1}`} suppressHydrationWarning />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="section contact-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Get In Touch</span>
            <h2>Contact Us</h2>
            <p>Have questions? We would love to hear from you.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info glass-card">
              <div className="contact-item">
                <span>📍</span>
                <div>
                  <h4>Address</h4>
                  <p>Pal Rd, Subhash Nagar, Jodhpur, Rajasthan 342008</p>
                </div>
              </div>
              <div className="contact-item">
                <span>📧</span>
                <div>
                  <h4>Email</h4>
                  <p>hello@plan10.edu</p>
                </div>
              </div>
              <div className="contact-item">
                <span>📞</span>
                <div>
                  <h4>Phone</h4>
                  <p>9462703651, 7073783355</p>
                </div>
              </div>
              <div className="contact-item">
                <span>🕐</span>
                <div>
                  <h4>Hours</h4>
                  <p>Mon – Sat: 9:00 AM – 7:00 PM</p>
                </div>
              </div>
            </div>
            <form className="contact-form glass-card" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label htmlFor="contact-name">Full Name</label>
                <input id="contact-name" className="input" placeholder="Your name" required suppressHydrationWarning />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" className="input" type="email" placeholder="your@email.com" required suppressHydrationWarning />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" className="input" placeholder="Your message..." rows={4} required suppressHydrationWarning></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={contactStatus.loading} suppressHydrationWarning>
                {contactStatus.loading ? 'Sending...' : 'Send Message →'}
              </button>
              {contactStatus.success && (
                <div style={{ color: '#10b981', fontSize: '0.88rem', textAlign: 'center', marginTop: '12px', background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p style={{ fontWeight: '600' }}>✓ Message sent successfully!</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '4px' }}>Your message has been received and synced to Google Sheets.</p>
                </div>
              )}
              {contactStatus.error && (
                <div style={{ color: '#ef4444', fontSize: '0.88rem', textAlign: 'center', marginTop: '12px', background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ✗ {contactStatus.error}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo">
                <span className="logo-mark">P</span>
                <span className="logo-text">Plan10</span>
              </div>
              <p>Empowering minds and transforming futures through world-class education and expert mentorship.</p>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <a href="#courses">Courses</a>
              <a href="#about">About Us</a>
              <a href="#teachers">Instructors</a>
              <a href="#testimonials">Testimonials</a>
            </div>
            <div className="footer-links">
              <h4>Portal</h4>
              <Link href="/login">Student Login</Link>
              <Link href="/login">Admin Login</Link>
              <Link href="/register">Register</Link>
            </div>
            <div className="footer-links">
              <h4>Contact</h4>
              <a href="mailto:hello@plan10.edu">hello@plan10.edu</a>
              <a href="tel:+919462703651">9462703651, 7073783355</a>
              <p>Jodhpur, Rajasthan</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Plan10. All rights reserved.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
