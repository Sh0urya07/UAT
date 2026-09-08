'use client';

import React, { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import { Header } from '@/components/Header';
import { HeroAuditInput } from '@/components/HeroAuditInput';
import { AuditDashboard } from '@/components/AuditDashboard';
import { ThreeCanvasBackground } from '@/components/ThreeCanvasBackground';
import { DEMO_PRESETS } from '@/lib/audit/presets';
import { AuditReport, CrawlScope } from '@/lib/audit/types';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HomePage() {
  const [report, setReport] = useState<AuditReport>(DEMO_PRESETS['unova-benchmark'] || DEMO_PRESETS['nextjs-saas']);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Cinematic page entrance choreography inspired by reference video
  useEffect(() => {
    const tl = anime.timeline({
      easing: 'easeOutCubic',
    });

    tl.add({
      targets: 'header',
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 650,
    })
      .add(
        {
          targets: ['.hero-title', '.hero-subtitle'],
          translateY: [20, 0],
          opacity: [0, 1],
          delay: anime.stagger(100),
          duration: 700,
        },
        '-=350'
      )
      .add(
        {
          targets: '.hero-search',
          scale: [0.96, 1],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutElastic(1, .8)',
        },
        '-=300'
      )
      .add(
        {
          targets: '.hero-presets button',
          scale: [0.85, 1],
          opacity: [0, 1],
          delay: anime.stagger(60),
          duration: 500,
          easing: 'easeOutBack',
        },
        '-=300'
      )
      .add(
        {
          targets: dashboardRef.current,
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 600,
        },
        '-=200'
      );
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRunAudit = async (
    url: string,
    throttlingProfile: 'desktop' | 'mid-mobile' | 'budget-2gb',
    crawlScope: CrawlScope = 'multi-page-spider'
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, throttlingProfile, crawlScope }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Audit scan failed');
      }

      const newReport: AuditReport = await res.json();
      setReport(newReport);
      showToast(`Audit completed for ${newReport.targetUrl}!`);

      if (newReport.overallScore >= 80) {
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#b193c7', '#7d598f', '#f2612d', '#faebd7'],
        });
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (presetKey: string) => {
    if (DEMO_PRESETS[presetKey]) {
      setReport(DEMO_PRESETS[presetKey]);
      showToast(`Loaded scenario: ${presetKey}`);
    }
  };

  const handleExportSarif = async () => {
    try {
      showToast('Generating OASIS SARIF 2.1.0 report...');
      const res = await fetch('/api/export-sarif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (!res.ok) throw new Error('SARIF export failed');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `unova-uat-${new URL(report.targetUrl).hostname}-${Date.now()}.sarif`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast('SARIF 2.1.0 downloaded successfully!');
    } catch (err: any) {
      showToast(`Export error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative text-stone-900 selection:bg-gengar-bright-violet selection:text-white">
      {/* Interactive Three.js WebGL Particle & Violet Aura Background */}
      <ThreeCanvasBackground isAuditing={isLoading} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/95 border border-stone-300 text-stone-900 text-xs font-mono shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Official Unova Top Navbar with Animated Robot Mascot */}
      <Header
        currentReport={report}
        onExportSarif={handleExportSarif}
        onSelectPreset={handleSelectPreset}
        isAuditing={isLoading}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Command Search Bar */}
        <HeroAuditInput
          onRunAudit={handleRunAudit}
          isLoading={isLoading}
          onSelectPreset={handleSelectPreset}
        />

        {/* Audit Dashboard with Animated Container */}
        <div ref={dashboardRef}>
          <AuditDashboard report={report} onExportSarif={handleExportSarif} />
        </div>
      </main>

      {/* Enterprise Footer */}
      <footer className="w-full border-t border-stone-300/80 bg-white/80 backdrop-blur-md py-8 text-center text-xs font-mono text-stone-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-stone-900 font-bold">UNOVA // SPIDER ENGINE</span>
            <span className="text-stone-400">•</span>
            <a
              href="https://spider.unova.co.in"
              target="_blank"
              rel="noreferrer"
              className="text-gengar-bright-violet font-semibold hover:underline flex items-center gap-1"
            >
              <span>spider.unova.co.in</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>Google Search Essentials</span>
            <span>•</span>
            <span>Core Web Vitals v2024</span>
            <span>•</span>
            <span>OWASP ASVS 4.0</span>
            <span>•</span>
            <span>OASIS SARIF 2.1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
