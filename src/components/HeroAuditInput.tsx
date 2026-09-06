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
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-parchment-cream mb-2">
        Unova Diagnostic Suite
      </h1>
      <p className="text-sm text-smoke-taupe max-w-lg mx-auto mb-6">
        Automated site auditing for Core Web Vitals, link compliance, React hydration, and defensive security.
      </p>

      {/* Clean Input Command Bar */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="flex items-center rounded-xl bg-gengar-calligraphy-black/90 border border-gengar-bright-violet/30 p-1.5 shadow-unova-glass backdrop-blur-md focus-within:border-aura-light-lavender focus-within:shadow-glow-lavender transition-all">
          <div className="flex items-center flex-1 px-3 py-1">
            <Globe className="w-4 h-4 text-aura-light-lavender shrink-0 mr-2.5" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter target URL (e.g. unova.co.in or stripe.com)"
              className="w-full bg-transparent text-sm text-parchment-pale placeholder-smoke-taupe focus:outline-none font-mono"
              disabled={isLoading}
            />
          </div>

          <button
            ref={buttonRef}
            type="submit"
            disabled={isLoading || !urlInput.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gengar-base-purple to-gengar-bright-violet hover:from-gengar-bright-violet hover:to-aura-light-lavender text-parchment-cream font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

        {/* Loading status ticker */}
        {isLoading && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono text-aura-light-lavender animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-eye-glow-orange" />
            <span>{loadingStep}</span>
          </div>
        )}
      </form>

      {/* Quick Select Presets Bar */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono">
        <span className="text-smoke-taupe">Presets:</span>
        <button
          type="button"
          onClick={() => onSelectPreset('nextjs-saas')}
          className="px-2.5 py-1 rounded-md bg-gengar-deep-purple/30 hover:bg-gengar-deep-purple/60 text-aura-light-lavender border border-gengar-bright-violet/20 hover:border-gengar-bright-violet/50 transition-all flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-eye-glow-orange" />
          <span>Next.js App</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectPreset('ecommerce-heavy')}
          className="px-2.5 py-1 rounded-md bg-gengar-deep-purple/30 hover:bg-gengar-deep-purple/60 text-sun-muted-tan border border-sun-warm-ochre/20 hover:border-sun-warm-ochre/50 transition-all flex items-center gap-1"
        >
          <Shield className="w-3 h-3 text-eye-flame-red" />
          <span>E-Commerce Store</span>
        </button>
      </div>
    </div>
  );
}
