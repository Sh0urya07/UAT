'use client';

import React, { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import { Header } from '@/components/Header';
import { HeroAuditInput } from '@/components/HeroAuditInput';
import { AuditDashboard } from '@/components/AuditDashboard';
import { ThreeCanvasBackground } from '@/components/ThreeCanvasBackground';
import { SpiderTerminalConsole, TerminalLogEntry } from '@/components/SpiderTerminalConsole';
import { AuditWaitingAnimation } from '@/components/AuditWaitingAnimation';
import { DEMO_PRESETS } from '@/lib/audit/presets';
import { AuditReport, CrawlScope, SpiderPageNode } from '@/lib/audit/types';
import { Sparkles, Shield, Cpu, ExternalLink, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HomePage() {
  const [report, setReport] = useState<AuditReport>(DEMO_PRESETS['unova-benchmark'] || DEMO_PRESETS['nextjs-saas']);
  const [isLoading, setIsLoading] = useState(false);
  const [auditingUrl, setAuditingUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([]);
  const [currentBatch, setCurrentBatch] = useState<{
    batchSize: number;
    dispatched: number;
    total: number;
    queueLength: number;
  } | undefined>(undefined);
  const [mobileProfile, setMobileProfile] = useState<{
    loadTime: string;
    fcp: string;
    status: string;
  } | undefined>(undefined);
  const [recentPages, setRecentPages] = useState<SpiderPageNode[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);

  const dashboardRef = useRef<HTMLDivElement>(null);

  // Cinematic page entrance choreography
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
          translateY: [10, 0],
          opacity: [0.8, 1],
          delay: anime.stagger(80),
          duration: 400,
          easing: 'easeOutQuad',
        },
        '-=200'
      )
      .add(
        {
          targets: '.hero-search',
          scale: [0.98, 1],
          opacity: [0.9, 1],
          duration: 400,
          easing: 'easeOutQuad',
        },
        '-=200'
      )
      .add(
        {
          targets: '.hero-presets button',
          scale: [0.95, 1],
          opacity: [0.8, 1],
          delay: anime.stagger(40),
          duration: 350,
          easing: 'easeOutQuad',
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
    crawlScope: CrawlScope = 'multi-page-spider',
    maxPages?: number
  ) => {
    const tokens = url.trim().split(/\s+/);
    const cleanUrl = tokens[0];
    const parsedBudget = tokens[1] ? parseInt(tokens[1], 10) : undefined;
    const effectiveMaxPages = maxPages || parsedBudget;

    setAuditingUrl(cleanUrl);
    setIsLoading(true);
    setShowTerminal(true);
    setRecentPages([]);
    setCurrentBatch(undefined);
    setMobileProfile(undefined);

    const nowStr = () =>
      new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTerminalLogs([
      {
        id: `init-${Date.now()}`,
        message: `🌌 Connecting to Spider Engine stream for ${cleanUrl}${effectiveMaxPages ? ` [Budget: ${effectiveMaxPages} pages]` : ''}...`,
        timestamp: nowStr(),
      },
    ]);

    try {
      const res = await fetch('/api/audit/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          throttlingProfile,
          crawlScope,
          maxPages: effectiveMaxPages,
          concurrency: 4,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to initiate live audit stream.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const eventStr of events) {
          if (!eventStr.trim()) continue;
          const lines = eventStr.split('\n');
          let eventType = 'message';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            else if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
          }

          if (!dataStr) continue;
          try {
            const parsedData = JSON.parse(dataStr);
            if (eventType === 'log') {
              setTerminalLogs((prev) => [
                ...prev,
                {
                  id: `log-${Date.now()}-${Math.random()}`,
                  message: parsedData.message,
                  timestamp: nowStr(),
                },
              ]);
            } else if (eventType === 'batch') {
              setCurrentBatch(parsedData);
            } else if (eventType === 'mobile') {
              setMobileProfile(parsedData);
            } else if (eventType === 'page') {
              setRecentPages((prev) => [...prev, parsedData]);
            } else if (eventType === 'complete') {
              if (parsedData.report) {
                setReport(parsedData.report);
                showToast(`Spider Crawl completed for ${parsedData.report.targetUrl}!`);
                if (parsedData.report.overallScore >= 80) {
                  confetti({
                    particleCount: 60,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#b193c7', '#7d598f', '#f2612d', '#faebd7'],
                  });
                }
              }
            } else if (eventType === 'error') {
              showToast(`Error: ${parsedData.error}`);
            }
          } catch (jsonErr) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message}`);
      setTerminalLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          message: `❌ Error: ${err.message}`,
          timestamp: nowStr(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (presetKey: string) => {
    if (DEMO_PRESETS[presetKey]) {
      setReport(DEMO_PRESETS[presetKey]);
      showToast(`Loaded scenario: ${presetKey}`);
      if (DEMO_PRESETS[presetKey].spiderArchitecture) {
        setRecentPages(DEMO_PRESETS[presetKey].spiderArchitecture?.pages || []);
      }
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
      a.download = `spider-engine-${new URL(report.targetUrl).hostname}-${Date.now()}.sarif`;
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

      {/* Top Navbar */}
      <Header
        currentReport={report}
        onExportSarif={handleExportSarif}
        onSelectPreset={handleSelectPreset}
        isAuditing={isLoading}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-6">
        {/* Command Search Bar */}
        <HeroAuditInput
          onRunAudit={handleRunAudit}
          isLoading={isLoading}
          onSelectPreset={handleSelectPreset}
        />

        {/* While Auditing: WAIT FOR WHOLE AUDIT TO FINISH and display the animated waiting experience */}
        {isLoading ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <AuditWaitingAnimation
              targetUrl={auditingUrl || 'Target Route'}
              logs={terminalLogs}
              currentBatch={currentBatch}
              mobileProfile={mobileProfile}
              recentPagesCount={recentPages.length}
            />

            {/* Optional Live Telemetry Strip */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowTerminal(!showTerminal)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 text-stone-200 hover:bg-stone-800 text-xs font-mono transition-all shadow-md"
              >
                <Terminal className="w-3.5 h-3.5 text-violet-400" />
                <span>{showTerminal ? 'Hide Raw Streaming Logs' : 'Show Raw Streaming Logs'}</span>
                {showTerminal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showTerminal && (
              <SpiderTerminalConsole
                logs={terminalLogs}
                currentBatch={currentBatch}
                mobileProfile={mobileProfile}
                recentPages={recentPages}
                isAuditing={true}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Spider Terminal Console Toggle Button (post-audit or preset) */}
            {terminalLogs.length > 0 && (
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 text-stone-200 hover:bg-stone-800 text-xs font-mono transition-all shadow-md"
                >
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  <span>{showTerminal ? 'Hide Execution Telemetry' : 'Show Execution Telemetry'}</span>
                  {showTerminal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {showTerminal && terminalLogs.length > 0 && (
              <SpiderTerminalConsole
                logs={terminalLogs}
                currentBatch={currentBatch}
                mobileProfile={mobileProfile}
                recentPages={recentPages}
                isAuditing={false}
              />
            )}

            {/* Final Completed Audit Dashboard with Animated Container */}
            <div ref={dashboardRef} className="animate-in fade-in duration-500">
              <AuditDashboard report={report} onExportSarif={handleExportSarif} />
            </div>
          </div>
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className="w-full border-t border-stone-300/80 bg-white/80 backdrop-blur-md py-8 text-center text-xs font-mono text-stone-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-stone-900 font-bold">SPIDER ENGINE</span>
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
