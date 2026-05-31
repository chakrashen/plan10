'use client';
import { useTheme } from '@/components/ThemeProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import './landing.css';

/* ===== Dummy Data ===== */
const COURSES = [
  { id: 1, title: 'Full-Stack Web Development', desc: 'Master HTML, CSS, JavaScript, React, Node.js and build real-world projects.', category: 'Web Development', difficulty: 'Intermediate', duration: '12 Weeks', price: '₹14,999', image: '🌐', students: 342 },
  { id: 2, title: 'Python & Data Science', desc: 'Learn Python, Pandas, Machine Learning and data visualization from scratch.', category: 'Data Science', difficulty: 'Beginner', duration: '10 Weeks', price: '₹12,999', image: '📊', students: 289 },
  { id: 3, title: 'UI/UX Design Mastery', desc: 'Design stunning interfaces using Figma, Adobe XD with design thinking.', category: 'Design', difficulty: 'Beginner', duration: '8 Weeks', price: '₹9,999', image: '🎨', students: 198 },
  { id: 4, title: 'Digital Marketing Pro', desc: 'SEO, social media marketing, Google Ads, and analytics for business growth.', category: 'Marketing', difficulty: 'Beginner', duration: '6 Weeks', price: '₹7,999', image: '📈', students: 456 },
  { id: 5, title: 'Advanced React & Next.js', desc: 'Build production-grade apps with React 19, Next.js 15, and modern patterns.', category: 'Programming', difficulty: 'Advanced', duration: '8 Weeks', price: '₹11,999', image: '⚛️', students: 167 },
  { id: 6, title: 'Mobile App Development', desc: 'Create cross-platform apps with React Native and deploy to App Store & Play Store.', category: 'Programming', difficulty: 'Intermediate', duration: '10 Weeks', price: '₹13,999', image: '📱', students: 223 },
];

const TEACHERS = [
  { id: 1, name: 'Dr. Anika Sharma', role: 'Lead Instructor — Web Development', bio: '10+ years building scalable web applications at top tech companies.', specialization: 'React, Node.js, System Design', avatar: '👩‍💻' },
  { id: 2, name: 'Prof. Rajesh Kumar', role: 'Senior Instructor — Data Science', bio: 'PhD in Machine Learning. Published 20+ research papers in AI.', specialization: 'Python, ML, Deep Learning', avatar: '👨‍🔬' },
  { id: 3, name: 'Priya Mehta', role: 'Design Lead', bio: 'Former design lead at a Fortune 500. Passionate about user experience.', specialization: 'UI/UX, Figma, Design Systems', avatar: '👩‍🎨' },
  { id: 4, name: 'Arjun Patel', role: 'Marketing Strategist', bio: '8 years of digital marketing experience. Helped 100+ businesses scale.', specialization: 'SEO, Google Ads, Analytics', avatar: '👨‍💼' },
];

const TESTIMONIALS = [
  { id: 1, name: 'Sneha Gupta', course: 'Full-Stack Web Development', text: 'Plan10 completely transformed my career. The hands-on projects and mentorship are unmatched. Landed my dream job within 2 months!', rating: 5, avatar: '👩' },
  { id: 2, name: 'Amit Singh', course: 'Python & Data Science', text: 'The best learning experience I have ever had. The instructors are incredibly knowledgeable and patient. Worth every penny!', rating: 5, avatar: '👨' },
  { id: 3, name: 'Riya Desai', course: 'UI/UX Design Mastery', text: 'From zero design skills to getting hired as a UX designer. Plan10 made it possible with their structured curriculum.', rating: 5, avatar: '👩' },
  { id: 4, name: 'Vikram Joshi', course: 'Digital Marketing Pro', text: 'I tripled my freelance income after completing the Digital Marketing course. The real-world case studies were game-changers.', rating: 4, avatar: '👨' },
];

const STATS = [
  { number: '1000+', label: 'Active Students', icon: '🎓' },
  { number: '50+', label: 'Expert Courses', icon: '📚' },
  { number: '25+', label: 'Top Instructors', icon: '👨‍🏫' },
  { number: '95%', label: 'Success Rate', icon: '🏆' },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);

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
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
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
              <span className="stat-emoji">{stat.icon}</span>
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
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
                <div className="course-emoji">{course.image}</div>
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
            <div className="about-card glass-card">
              <div className="about-card-icon">🎓</div>
              <h3>Our Mission</h3>
              <p>To democratize quality education and empower every learner with skills that matter in the modern world.</p>
            </div>
            <div className="about-card glass-card">
              <div className="about-card-icon">🌟</div>
              <h3>Our Vision</h3>
              <p>To become the most trusted learning platform recognized for transforming lives through education.</p>
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
                <div className="teacher-avatar">{teacher.avatar}</div>
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
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2>What Our Students Say</h2>
            <p>Real stories from real students who transformed their careers.</p>
          </div>
          <div className="testimonial-carousel">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.id} className={`testimonial-card glass-card ${i === currentTestimonial ? 'active' : ''}`}>
                <div className="testimonial-stars">
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                </div>
                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testimonial-author">
                  <span className="testimonial-avatar">{t.avatar}</span>
                  <div>
                    <h4>{t.name}</h4>
                    <p>{t.course}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonial-dots">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} className={`dot ${i === currentTestimonial ? 'active' : ''}`} onClick={() => setCurrentTestimonial(i)} aria-label={`Testimonial ${i+1}`} />
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
                  <p>123 Education Lane, Knowledge City, India 400001</p>
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
                  <p>+91 98765 43210</p>
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
            <form className="contact-form glass-card" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="contact-name">Full Name</label>
                <input id="contact-name" className="input" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" className="input" type="email" placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" className="input" placeholder="Your message..." rows={4}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Send Message →</button>
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
              <a href="tel:+919876543210">+91 98765 43210</a>
              <p>Knowledge City, India</p>
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
