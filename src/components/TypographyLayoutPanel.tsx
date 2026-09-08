'use client';

import React from 'react';
import { FrontendDiagnosticsReport } from '@/lib/audit/types';
import {
  Type,
  Maximize2,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Move,
  Film,
  ShieldCheck,
  MousePointerClick,
} from 'lucide-react';

interface TypographyLayoutPanelProps {
  diagnostics?: FrontendDiagnosticsReport;
}

export function TypographyLayoutPanel({ diagnostics }: TypographyLayoutPanelProps) {
  if (!diagnostics) {
    return (
      <div className="p-8 rounded-xl bg-white/90 border border-stone-200 text-center space-y-3 backdrop-blur-md">
        <Type className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="text-base font-bold text-stone-800">Typography & Ergonomics Data Pending</h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto">
          Run an audit to analyze typography scales, reading line measure, Fitts's law touch targets, and motion hygiene.
        </p>
      </div>
    );
  }

  const { typography, layoutAndMobile, animationAndMotion } = diagnostics;

  return (
    <div className="space-y-6">
      {/* 3 Metric Score Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Typography Score */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Typography Architecture</span>
            <Type className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{typography.score}/100</span>
            <span className="text-xs text-stone-500 font-mono">Hierarchy & Scale</span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            {typography.fontCount} font families detected. Line measure: {typography.lineMeasureCh}ch (target: 45–75ch).
          </div>
        </div>

        {/* Layout & Mobile Ergonomics */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Mobile & Fitts's Law</span>
            <Smartphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{layoutAndMobile.score}/100</span>
            <span className="text-xs text-stone-500 font-mono">Touch Ergonomics</span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            {layoutAndMobile.touchTargetsPassed} compliant touch targets (≥48px). {layoutAndMobile.touchTargetsSubstandard} substandard.
          </div>
        </div>

        {/* Animation & Vestibular Safety */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Motion Hygiene</span>
            <Film className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{animationAndMotion.score}/100</span>
            <span className="text-xs text-stone-500 font-mono">Vestibular Safe</span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            Avg duration: {animationAndMotion.averageDurationMs}ms. prefers-reduced-motion: {animationAndMotion.prefersReducedMotionSupported ? 'Supported' : 'Missing'}.
          </div>
        </div>
      </div>

      {/* Typography Deep Details */}
      <div className="rounded-xl bg-white/90 border border-stone-200 shadow-sm p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-violet-700" />
            <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              Reading Ergonomics & Typographic Scale Analysis
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-500">UI/UX Pro Max Spec</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
            <div className="text-xs font-mono text-stone-500 uppercase">Font Stack Diversity</div>
            <div className="text-sm font-bold text-stone-900 font-mono">
              {typography.fonts.join(', ') || 'System Default'}
            </div>
            <p className="text-xs text-stone-600 pt-1">
              Maintains optimal 2–3 maximum typeface limit to prevent cognitive friction.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
            <div className="text-xs font-mono text-stone-500 uppercase">Line-Height Ratio</div>
            <div className="text-sm font-bold text-stone-900 font-mono">
              {typography.lineHeightRatio}:1 (Ideal: 1.4–1.65)
            </div>
            <p className="text-xs text-stone-600 pt-1">
              Ensures optimal vertical saccadic tracking between line returns.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
            <div className="text-xs font-mono text-stone-500 uppercase">Reading Measure</div>
            <div className="text-sm font-bold text-stone-900 font-mono">
              {typography.lineMeasureCh} characters per line
            </div>
            <p className="text-xs text-stone-600 pt-1">
              Comfortably positioned within the 45–75 character typographic comfort corridor.
            </p>
          </div>
        </div>

        {/* Typography Issues List */}
        {typography.issues.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Typographic Opportunities:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-stone-700">
              {typography.issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Spatial Layout & Fitts's Law + Motion Safety Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Layout & Touch Targets */}
        <div className="rounded-xl bg-white/90 border border-stone-200 shadow-sm p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              Touch Target Ergonomics (Fitts's Law)
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200 font-mono">
              <span className="text-stone-700">Compliant Targets (≥48px):</span>
              <span className="font-bold text-emerald-700">{layoutAndMobile.touchTargetsPassed}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200 font-mono">
              <span className="text-stone-700">Substandard Targets (&lt;48px):</span>
              <span className={`font-bold ${layoutAndMobile.touchTargetsSubstandard === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {layoutAndMobile.touchTargetsSubstandard}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200 font-mono">
              <span className="text-stone-700">Horizontal Viewport Overflow:</span>
              <span className={`font-bold ${!layoutAndMobile.horizontalOverflow ? 'text-emerald-700' : 'text-red-600'}`}>
                {layoutAndMobile.horizontalOverflow ? 'FAIL (Horizontal Scroll)' : 'PASS (Clean Viewport)'}
              </span>
            </div>
          </div>
        </div>

        {/* Motion & Vestibular Hygiene */}
        <div className="rounded-xl bg-white/90 border border-stone-200 shadow-sm p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-orange-700" />
            <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              Motion & Vestibular Hygiene
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200 font-mono">
              <span className="text-stone-700">prefers-reduced-motion:</span>
              <span className={`font-bold ${animationAndMotion.prefersReducedMotionSupported ? 'text-emerald-700' : 'text-amber-700'}`}>
                {animationAndMotion.prefersReducedMotionSupported ? 'Active (@media query)' : 'Missing Media Query'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200 font-mono">
              <span className="text-stone-700">Average Animation Duration:</span>
              <span className="font-bold text-stone-900">{animationAndMotion.averageDurationMs}ms (Ideal: 100–400ms)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200 font-mono">
              <span className="text-stone-700">Hardware GPU Acceleration:</span>
              <span className="font-bold text-emerald-700">
                {animationAndMotion.hardwareAccelerated ? 'transform / opacity (60fps)' : 'paint triggering properties'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
