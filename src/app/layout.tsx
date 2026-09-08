import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#faebd7',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Unova // Spider Engine - UI/UX, Cognitive Frontend & Multi-Page Auditor (spider.unova.co.in)',
    template: '%s | Unova Spider Engine',
  },
  description:
    'Official Unova Spider Diagnostic Suite: High-performance cognitive frontend & multi-page site architecture auditor evaluating UI/UX aesthetics, color psychology (WCAG & APCA), typography hierarchy, mobile ergonomics, Core Web Vitals, and systemic web security.',
  applicationName: 'Unova Spider Engine',
  authors: [{ name: 'Unova Engineering', url: 'https://spider.unova.co.in' }],
  generator: 'Next.js',
  keywords: [
    'Unova',
    'Spider Engine',
    'spider.unova.co.in',
    'UI/UX Auditor',
    'Color Psychology',
    'APCA Contrast',
    'Kobayashi Image Scale',
    'Typography Hierarchy',
    'Google Search Essentials',
    'Core Web Vitals',
    'Multi-Page Spider Crawl',
    'Web Architecture Health',
    'SARIF 2.1.0',
    'React Hydration Bugs',
    'Web Security Auditor',
  ],
  metadataBase: new URL('https://spider.unova.co.in'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/unova-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/unova-logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/unova-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/unova-logo.png',
    apple: '/unova-logo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Unova // Spider Engine - Cognitive Frontend & Multi-Page Auditor',
    description:
      'Official Unova Spider Diagnostic Suite: Automated multi-page site architecture crawler and frontend diagnostic suite evaluating UI/UX aesthetics, color psychology, typography, Core Web Vitals, and systemic security posture.',
    url: 'https://spider.unova.co.in',
    siteName: 'Unova Spider Engine',
    images: [
      {
        url: '/unova-logo.png',
        width: 512,
        height: 512,
        alt: 'Unova Spider Engine Robot Mascot',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unova // Spider Engine - Cognitive Frontend & Multi-Page Auditor',
    description: 'Autonomous multi-page architecture and frontend UI/UX diagnostic suite by Unova (spider.unova.co.in).',
    images: ['/unova-logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-parchment-pale text-stone-900 min-h-screen selection:bg-gengar-bright-violet selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}

