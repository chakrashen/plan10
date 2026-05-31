import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'Plan10 — Empowering Minds, Transforming Futures',
  description: 'Plan10 is a premier learning institute offering world-class courses with expert instructors. Join 1000+ students on their journey to success.',
  keywords: 'Plan10, LMS, learning, courses, education, online classes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
