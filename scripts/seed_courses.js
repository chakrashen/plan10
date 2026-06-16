// require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const COURSES = [
  { id: '11111111-1111-1111-1111-111111111111', title: 'Full-Stack Web Development', description: 'Master HTML, CSS, JavaScript, React, Node.js and build real-world projects.', short_description: 'Master HTML, CSS, JavaScript, React, Node.js and build real-world projects.', category: 'Web Development', difficulty: 'Intermediate', duration_weeks: 12, price: 14999, thumbnail_url: '/image1.webp' },
  { id: '22222222-2222-2222-2222-222222222222', title: 'Python & Data Science', description: 'Learn Python, Pandas, Machine Learning and data visualization from scratch.', short_description: 'Learn Python, Pandas, Machine Learning and data visualization from scratch.', category: 'Data Science', difficulty: 'Beginner', duration_weeks: 10, price: 12999, thumbnail_url: '/image2.webp' },
  { id: '33333333-3333-3333-3333-333333333333', title: 'UI/UX Design Mastery', description: 'Design stunning interfaces using Figma, Adobe XD with design thinking.', short_description: 'Design stunning interfaces using Figma, Adobe XD with design thinking.', category: 'Design', difficulty: 'Beginner', duration_weeks: 8, price: 9999, thumbnail_url: '/image3.webp' },
  { id: '44444444-4444-4444-4444-444444444444', title: 'Digital Marketing Pro', description: 'SEO, social media marketing, Google Ads, and analytics for business growth.', short_description: 'SEO, social media marketing, Google Ads, and analytics for business growth.', category: 'Marketing', difficulty: 'Beginner', duration_weeks: 6, price: 7999, thumbnail_url: '/image4.webp' },
  { id: '55555555-5555-5555-5555-555555555555', title: 'Advanced React & Next.js', description: 'Build production-grade apps with React 19, Next.js 15, and modern patterns.', short_description: 'Build production-grade apps with React 19, Next.js 15, and modern patterns.', category: 'Programming', difficulty: 'Advanced', duration_weeks: 8, price: 11999, thumbnail_url: '/image5.webp' },
  { id: '66666666-6666-6666-6666-666666666666', title: 'Mobile App Development', description: 'Create cross-platform apps with React Native and deploy to App Store & Play Store.', short_description: 'Create cross-platform apps with React Native and deploy to App Store & Play Store.', category: 'Programming', difficulty: 'Intermediate', duration_weeks: 10, price: 13999, thumbnail_url: '/image6.webp' },
];

async function seed() {
  console.log('Seeding courses...');
  for (const course of COURSES) {
    const { error } = await supabase.from('courses').upsert(course, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting ${course.title}:`, error);
    } else {
      console.log(`Inserted ${course.title}`);
    }
  }
  console.log('Seeding complete.');
}

seed();
