// App-wide constants for Plan10 LMS

export const APP_NAME = 'Plan10';
export const APP_TAGLINE = 'Empowering Minds, Transforming Futures';
export const APP_DESCRIPTION = 'Plan10 is a premier learning institute offering world-class courses with expert instructors. Join 1000+ students on their journey to success.';

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  WAIVED: 'waived',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const COURSE_CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Design',
  'Marketing',
  'Business',
  'Photography',
  'Music',
];

export const NAV_STUDENT = [
  { label: 'Dashboard', href: '/student/dashboard', icon: 'dashboard' },
  { label: 'My Courses', href: '/student/courses', icon: 'courses' },
  { label: 'Attendance', href: '/student/attendance', icon: 'attendance' },
  { label: 'Progress', href: '/student/progress', icon: 'progress' },
  { label: 'Profile', href: '/student/profile', icon: 'profile' },
  { label: 'Settings', href: '/student/settings', icon: 'settings' },
];

export const NAV_ADMIN = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Courses', href: '/admin/courses', icon: 'courses' },
  { label: 'Students', href: '/admin/students', icon: 'students' },
  { label: 'Enrollments', href: '/admin/enrollments', icon: 'enrollments' },
  { label: 'Attendance', href: '/admin/attendance', icon: 'attendance' },
  { label: 'Teachers', href: '/admin/teachers', icon: 'teachers' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: 'testimonials' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
];
