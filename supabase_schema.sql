-- =============================================
-- Plan10 LMS — Supabase Database Schema
-- Run this ENTIRE script in the Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STEP 1: CREATE ALL TABLES FIRST
-- =============================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  profile_photo_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  specialization TEXT,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COURSES
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  thumbnail_url TEXT,
  price NUMERIC DEFAULT 0,
  duration_weeks INTEGER DEFAULT 0,
  total_classes INTEGER DEFAULT 0,
  category TEXT,
  difficulty TEXT DEFAULT 'Beginner',
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENROLLMENTS (must be before classes RLS)
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'rejected')),
  enrolled_by TEXT DEFAULT 'student' CHECK (enrolled_by IN ('student', 'admin')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'waived')),
  payment_amount NUMERIC DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- 5. CLASSES
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  class_date DATE,
  day_number INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 1,
  duration_minutes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  marked_by UUID REFERENCES profiles(id),
  UNIQUE(student_id, class_id)
);

-- 7. PROGRESS
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, class_id)
);

-- 8. TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT,
  student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  photo_url TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INSTITUTE INFO
CREATE TABLE IF NOT EXISTS institute_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STEP 2: AUTO-CREATE PROFILE TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_info ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 4: CREATE ALL RLS POLICIES
-- =============================================

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- TEACHERS policies
CREATE POLICY "Anyone can view active teachers" ON teachers FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins full access teachers" ON teachers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- COURSES policies
CREATE POLICY "Anyone can view active courses" ON courses FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins full access courses" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ENROLLMENTS policies
CREATE POLICY "Students can view own enrollments" ON enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can request enrollment" ON enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admins full access enrollments" ON enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- CLASSES policies (now enrollments table exists)
CREATE POLICY "Students can view published classes of enrolled courses" ON classes
  FOR SELECT USING (
    is_published = TRUE AND EXISTS (
      SELECT 1 FROM enrollments WHERE student_id = auth.uid() AND course_id = classes.course_id AND status = 'active'
    )
  );
CREATE POLICY "Admins full access classes" ON classes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public can view published classes" ON classes FOR SELECT USING (is_published = TRUE);

-- ATTENDANCE policies
CREATE POLICY "Students can view own attendance" ON attendance FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins full access attendance" ON attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PROGRESS policies
CREATE POLICY "Students can view own progress" ON progress FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can update own progress" ON progress FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can modify own progress" ON progress FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Admins can view all progress" ON progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- TESTIMONIALS policies
CREATE POLICY "Anyone can view featured testimonials" ON testimonials FOR SELECT USING (is_featured = TRUE);
CREATE POLICY "Admins full access testimonials" ON testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- INSTITUTE INFO policies
CREATE POLICY "Anyone can view institute info" ON institute_info FOR SELECT USING (TRUE);
CREATE POLICY "Admins full access institute_info" ON institute_info FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- STEP 5: SEED DEFAULT DATA
-- =============================================
INSERT INTO institute_info (key, value) VALUES
  ('institute_name', 'Plan10'),
  ('tagline', 'Empowering Minds, Transforming Futures'),
  ('about_text', 'Plan10 is a premier learning institute offering world-class courses with expert instructors.'),
  ('mission', 'To democratize quality education and empower every learner with skills that matter.'),
  ('vision', 'To become the most trusted learning platform recognized for transforming lives.'),
  ('phone', '+91 98765 43210'),
  ('email', 'hello@plan10.edu'),
  ('address', '123 Education Lane, Knowledge City, India 400001'),
  ('hours', 'Mon - Sat: 9:00 AM - 7:00 PM')
ON CONFLICT (key) DO NOTHING;
