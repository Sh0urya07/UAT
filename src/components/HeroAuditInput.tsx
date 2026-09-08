'use client';

import React, { useState, useRef } from 'react';
import { Globe, ArrowRight, Loader2, Sparkles, Shield, Network, Zap } from 'lucide-react';
import anime from 'animejs';
import { CrawlScope } from '@/lib/audit/types';

interface HeroAuditInputProps {
  onRunAudit: (
    url: string,
    throttlingProfile: 'desktop' | 'mid-mobile' | 'budget-2gb',
    crawlScope: CrawlScope
  ) => void;
  isLoading: boolean;
  onSelectPreset: (presetKey: string) => void;
}

export function HeroAuditInput({ onRunAudit, isLoading, onSelectPreset }: HeroAuditInputProps) {
  const [urlInput, setUrlInput] = useState('');
  const [crawlScope, setCrawlScope] = useState<CrawlScope>('multi-page-spider');
  const [loadingStep, setLoadingStep] = useState('Initializing Unova Spider engine...');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || isLoading) return;

    if (buttonRef.current) {
      anime({
        targets: buttonRef.current,
        scale: [0.96, 1],
        duration: 300,
        easing: 'easeOutQuad',
      });
    }

    const steps = crawlScope === 'multi-page-spider'
      ? [
          'Initializing BFS Spider queue & route harvester...',
          'Traversing internal routes and resolving DOM tree...',
          'Extracting 60-30-10 palette & APCA contrast scores...',
          'Evaluating Bourne (2026) autonomic valence & Kobayashi image scales...',
          'Aggregating systemic security findings across routes...',
          'Simulating budget mobile 2GB RAM / 6x CPU throttling slowdown...',
          'Compiling multi-page architecture report & SARIF...',
        ]
      : [
          'Measuring server TTFB & TLS latency...',
          'Analyzing Google Core Web Vitals (LCP, INP, CLS)...',
          'Extracting color psychology, APCA contrast & typography...',
          'Auditing defensive security headers & hydration...',
          'Synthesizing diagnostic report & SARIF...',
        ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingStep(steps[stepIdx]);
    }, 1100);

    onRunAudit(urlInput.trim(), 'budget-2gb', crawlScope);
    setTimeout(() => clearInterval(interval), 14000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-8 pb-6 px-4 text-center">
      {/* Title */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-300/80 text-violet-900 text-xs font-mono mb-3 shadow-xs">
        <Network className="w-3.5 h-3.5 text-violet-700" />
        <span className="font-semibold">spider.unova.co.in</span>
        <span className="text-violet-400">•</span>
        <span className="text-stone-600">BFS Multi-Page & Cognitive Frontend Auditor</span>
      </div>

      <h1 className="hero-title text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 select-none">
        Unova // Spider Engine
      </h1>
      <p className="hero-subtitle text-xs sm:text-sm text-stone-600 max-w-xl mx-auto mb-5">
        Autonomous BFS site topology crawls, cognitive frontend & UI/UX diagnostics (APCA, Bourne &apos;26, Kobayashi scales), and systemic 2GB RAM / 6x CPU hardware throttling.
      </p>

      {/* Crawl Scope Mode Selector */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setCrawlScope('multi-page-spider')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            crawlScope === 'multi-page-spider'
              ? 'bg-stone-900 text-white shadow-sm border border-stone-900'
              : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-300'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-violet-400" />
          <span>Deep Spider Crawl (Multi-Page)</span>
        </button>

        <button
          type="button"
          onClick={() => setCrawlScope('single-page')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            crawlScope === 'single-page'
              ? 'bg-stone-900 text-white shadow-sm border border-stone-900'
              : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Fast Single-Page Probe</span>
        </button>
      </div>

      {/* Clean Input Command Bar with Holographic Scanline */}
      <form onSubmit={handleSubmit} className="hero-search max-w-xl mx-auto">
        <div className="relative overflow-hidden rounded-xl bg-white/95 border border-stone-300 p-1.5 shadow-md shadow-stone-900/5 backdrop-blur-md focus-within:border-gengar-bright-violet focus-within:ring-2 focus-within:ring-gengar-bright-violet/20 transition-all">
          {/* Animated radar scanline when auditing */}
          {isLoading && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-gengar-bright-violet/15 to-transparent animate-shimmer" />
          )}

          <div className="flex items-center">
            <div className="flex items-center flex-1 px-3 py-1">
              <Globe className="w-4 h-4 text-stone-500 shrink-0 mr-2.5" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL (e.g. unova.co.in or stripe.com)"
                className="w-full bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none font-mono"
                disabled={isLoading}
              />
            </div>

            <button
              ref={buttonRef}
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-eye-glow-orange" />
                  <span className="font-mono">Crawling</span>
                </>
              ) : (
                <>
                  <span>Launch {crawlScope === 'multi-page-spider' ? 'Spider' : 'Probe'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-eye-glow-orange" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cinematic Telemetry Status Bar */}
        {isLoading && (
          <div className="mt-4 p-3 rounded-xl bg-white/95 border border-stone-200 shadow-md backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between text-xs font-mono mb-2 px-1">
              <div className="flex items-center gap-2 text-stone-800">
                <span className="inline-block w-2 h-2 rounded-full bg-eye-glow-orange animate-ping" />
                <span className="text-stone-900 font-medium">{loadingStep}</span>
              </div>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                {crawlScope === 'multi-page-spider' ? 'Spider BFS' : 'Live Edge'}
              </span>
            </div>
            {/* Animated Gradient Progress Track */}
            <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-gengar-bright-violet via-eye-glow-orange to-aura-light-lavender animate-pulse w-full rounded-full" />
            </div>
          </div>
        )}
      </form>

      {/* Quick Select Presets Bar */}
      <div className="hero-presets mt-4 flex items-center justify-center flex-wrap gap-2 text-xs font-mono">
        <span className="text-stone-500">Benchmark Presets:</span>
        <button
          type="button"
          onClick={() => {
            setUrlInput('https://unova.co.in');
            setCrawlScope('multi-page-spider');
            onSelectPreset('unova-benchmark');
          }}
          className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-violet-600 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <Network className="w-3 h-3 text-violet-600" />
          <span>unova.co.in (13-Page Site Crawl)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setUrlInput('https://saas-dashboard.unova.co.in');
            onSelectPreset('nextjs-saas');
          }}
          className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-gengar-bright-violet transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <Sparkles className="w-3 h-3 text-gengar-bright-violet" />
          <span>Next.js App</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setUrlInput('https://store.unova.co.in/shop');
            onSelectPreset('ecommerce-heavy');
          }}
          className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-eye-flame-red transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <Shield className="w-3 h-3 text-eye-flame-red" />
          <span>E-Commerce Store</span>
        </button>
      </div>
    </div>
  );
}
