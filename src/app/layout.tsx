import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#faebd7',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Unova // UAT Engine - Autonomous Diagnostic Suite (uat.unova.co.in)',
    template: '%s | Unova UAT Engine',
  },
  description:
    'Official Unova UAT Diagnostic Suite: Autonomous deep-level website audit engine evaluating Google Search Essentials, Core Web Vitals, crawlable link compliance, React hydration bugs, and defensive security posture.',
  applicationName: 'Unova UAT Engine',
  authors: [{ name: 'Unova Engineering', url: 'https://uat.unova.co.in' }],
  generator: 'Next.js',
  keywords: [
    'Unova',
    'UAT Engine',
    'uat.unova.co.in',
    'Google Search Essentials',
    'Core Web Vitals',
    'INP',
    'LCP',
    'CLS',
    'Link Compliance',
    'SARIF 2.1.0',
    'React Hydration Bugs',
    'Web Security Auditor',
  ],
  metadataBase: new URL('https://uat.unova.co.in'),
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
    title: 'Unova // UAT Engine - Autonomous Diagnostic Suite',
    description:
      'Official Unova UAT Diagnostic Suite: Deep-level automated website auditing for Google Search Essentials, Core Web Vitals, link compliance, React hydration issues, and defensive security.',
    url: 'https://uat.unova.co.in',
    siteName: 'Unova UAT Engine',
    images: [
      {
        url: '/unova-logo.png',
        width: 512,
        height: 512,
        alt: 'Unova UAT Engine Robot Mascot',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unova // UAT Engine - Autonomous Diagnostic Suite',
    description: 'Autonomous deep-level website auditing engine by Unova (uat.unova.co.in).',
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

