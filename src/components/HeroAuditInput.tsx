'use client';

import React, { useState, useRef } from 'react';
import { Globe, ArrowRight, Loader2, Sparkles, Shield } from 'lucide-react';
import anime from 'animejs';

interface HeroAuditInputProps {
  onRunAudit: (url: string, throttlingProfile: 'desktop' | 'mid-mobile' | 'budget-2gb') => void;
  isLoading: boolean;
  onSelectPreset: (presetKey: string) => void;
}

export function HeroAuditInput({ onRunAudit, isLoading, onSelectPreset }: HeroAuditInputProps) {
  const [urlInput, setUrlInput] = useState('');
  const [loadingStep, setLoadingStep] = useState('Initializing Unova edge probe...');
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

    const steps = [
      'Measuring server TTFB & TLS latency...',
      'Analyzing Google Core Web Vitals (LCP, INP, CLS)...',
      'Validating link crawlability & generic anchor text...',
      'Auditing defensive security headers & hydration...',
      'Synthesizing diagnostic report & SARIF...',
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingStep(steps[stepIdx]);
    }, 1000);

    onRunAudit(urlInput.trim(), 'budget-2gb');
    setTimeout(() => clearInterval(interval), 10000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-10 pb-8 px-4 text-center">
      {/* Title */}
      <h1 className="hero-title text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 select-none">
        Unova Diagnostic Suite
      </h1>
      <p className="hero-subtitle text-sm text-stone-600 max-w-lg mx-auto mb-6">
        Automated site auditing for Core Web Vitals, link compliance, React hydration, and defensive security.
      </p>

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
                placeholder="Enter target URL (e.g. unova.co.in or stripe.com)"
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
                  <span className="font-mono">Auditing</span>
                </>
              ) : (
                <>
                  <span>Run Audit</span>
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
              <span className="text-[10px] text-stone-500 uppercase tracking-wider">Live Probe</span>
            </div>
            {/* Animated Gradient Progress Track */}
            <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-gengar-bright-violet via-eye-glow-orange to-aura-light-lavender animate-pulse w-full rounded-full" />
            </div>
          </div>
        )}
      </form>

      {/* Quick Select Presets Bar */}
      <div className="hero-presets mt-4 flex items-center justify-center gap-2 text-xs font-mono">
        <span className="text-stone-500">Presets:</span>
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
