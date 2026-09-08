'use client';

import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import {
  Globe,
  Cpu,
  Smartphone,
  ShieldAlert,
  FileCheck,
  Compass,
  CheckCircle2,
  Sparkles,
  Layers,
  Activity,
  Server,
  Terminal,
} from 'lucide-react';
import { TerminalLogEntry } from './SpiderTerminalConsole';

interface AuditWaitingAnimationProps {
  targetUrl: string;
  logs: TerminalLogEntry[];
  currentBatch?: {
    batchSize: number;
    dispatched: number;
    total: number;
    queueLength: number;
  };
  mobileProfile?: {
    loadTime: string;
    fcp: string;
    status: string;
  };
  recentPagesCount: number;
}

const AUDIT_STAGES = [
  { id: 'connect', label: 'Domain Discovery & TLS Handshake', icon: Globe, detail: 'Sanitizing base origin and checking defensive headers' },
  { id: 'mobile', label: 'Hardware Throttling Simulation', icon: Smartphone, detail: 'Testing 2GB RAM / 6x CPU device starvation under Slow 4G' },
  { id: 'crawler', label: 'Parallel BFS Route Spider', icon: Compass, detail: 'Crawling internal anchor links within strict domain boundaries' },
  { id: 'settle', label: 'Visual Settle & Font Resolution', icon: Layers, detail: 'Auto-scrolling, forcing eager image decoding & WebFont ready' },
  { id: 'journeys', label: 'End-to-End User Journey Simulation', icon: Activity, detail: 'Validating value proposition, navigation transit & conversion CTAs' },
  { id: 'defects', label: 'Zero-Tolerance Defect & Link Audit', icon: ShieldAlert, detail: 'Inspecting console exceptions, failed API requests & broken links' },
  { id: 'uat', label: 'Compiling UAT Production Sign-Off', icon: FileCheck, detail: 'Synthesizing stakeholder matrix and Go / No-Go readiness score' },
];

export function AuditWaitingAnimation({
  targetUrl,
  logs,
  currentBatch,
  mobileProfile,
  recentPagesCount,
}: AuditWaitingAnimationProps) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const radarRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);

  // Latest log message
  const latestLog = logs.length > 0 ? logs[logs.length - 1].message : 'Initializing Spider Engine...';

  // Automatically advance or detect stage based on log signals
  useEffect(() => {
    const text = latestLog.toLowerCase();
    if (text.includes('mobile profiling') || mobileProfile) {
      setActiveStageIdx(1);
    } else if (text.includes('worker') || text.includes('batch') || currentBatch || recentPagesCount > 0) {
      if (text.includes('screenshot') || text.includes('settle')) {
        setActiveStageIdx(3);
      } else {
        setActiveStageIdx(2);
      }
    } else if (text.includes('journey') || text.includes('user story')) {
      setActiveStageIdx(4);
    } else if (text.includes('security') || text.includes('header')) {
      setActiveStageIdx(5);
    } else if (text.includes('compiling') || text.includes('complete')) {
      setActiveStageIdx(6);
    }
  }, [latestLog, mobileProfile, currentBatch, recentPagesCount]);

  // Orbit & pulse animation
  useEffect(() => {
    if (radarRef.current) {
      anime({
        targets: radarRef.current,
        rotate: '1turn',
        duration: 8000,
        easing: 'linear',
        loop: true,
      });
    }

    if (coreRef.current) {
      anime({
        targets: coreRef.current,
        scale: [0.94, 1.06],
        opacity: [0.85, 1],
        duration: 1600,
        direction: 'alternate',
        easing: 'easeInOutQuad',
        loop: true,
      });
    }

    if (ringsRef.current) {
      anime({
        targets: ringsRef.current.children,
        scale: [0.8, 1.25],
        opacity: [0.6, 0],
        delay: anime.stagger(600),
        duration: 2400,
        easing: 'easeOutCubic',
        loop: true,
      });
    }
  }, []);

  return (
    <div className="w-full rounded-2xl bg-white/95 border border-stone-200/90 shadow-xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-200/30 via-pink-100/20 to-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Info */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-300 text-violet-900 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
          <span>AUTONOMOUS UAT AUDIT IN PROGRESS</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-sans">
          Deep Technical & Functional Verification
        </h2>
        <p className="text-xs sm:text-sm font-mono text-stone-600 max-w-xl mx-auto truncate">
          Auditing target route: <strong className="text-stone-900">{targetUrl}</strong>
        </p>
      </div>

      {/* Centerpiece Scanner / Radar Animation */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Animated Expanding Rings */}
          <div ref={ringsRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-violet-400/40" />
            <div className="w-56 h-56 rounded-full border border-pink-400/30" />
            <div className="w-64 h-64 rounded-full border border-amber-400/20" />
          </div>

          {/* Rotating Radar Sweeper Line */}
          <div
            ref={radarRef}
            className="absolute inset-0 rounded-full border border-stone-300/80 pointer-events-none overflow-hidden"
          >
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-violet-500/25 to-transparent origin-bottom-right rounded-tl-full" />
          </div>

          {/* Central Glowing Spider Engine Core */}
          <div
            ref={coreRef}
            className="w-24 h-24 rounded-2xl bg-stone-900 shadow-2xl border-2 border-stone-800 flex flex-col items-center justify-center text-white z-10 select-none p-2 text-center"
          >
            <Sparkles className="w-6 h-6 text-violet-400 mb-1" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-violet-200">SPIDER</span>
            <span className="text-[9px] font-mono text-stone-400">ENGINE</span>
          </div>

          {/* Orbiting Satellite Badges */}
          <div className="absolute -top-2 px-3 py-1 rounded-full bg-white border border-stone-300 shadow-md text-[10px] font-mono text-stone-700 font-bold flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-blue-600" />
            <span>Routes: {recentPagesCount}</span>
          </div>

          {mobileProfile && (
            <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-white border border-stone-300 shadow-md text-[10px] font-mono text-stone-700 font-bold flex items-center gap-1.5">
              <Smartphone className="w-3 h-3 text-orange-600" />
              <span>{mobileProfile.loadTime}s (6x CPU)</span>
            </div>
          )}
        </div>

        {/* Live Milestone Status Box */}
        <div className="mt-6 max-w-lg w-full bg-stone-100/90 rounded-xl p-3 border border-stone-300 text-center font-mono">
          <div className="text-[11px] text-stone-500 uppercase tracking-wider font-bold mb-1">Live Worker Telemetry</div>
          <div className="text-xs text-stone-900 truncate font-semibold">
            {latestLog}
          </div>
        </div>
      </div>

      {/* Sequential UAT Pipeline Stages Checklist */}
      <div className="mt-8 border-t border-stone-200 pt-6">
        <div className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider mb-4 text-center sm:text-left">
          Pipeline Execution Progression:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AUDIT_STAGES.slice(0, 4).map((stage, sIdx) => {
            const isDone = activeStageIdx > sIdx;
            const isCurrent = activeStageIdx === sIdx;
            const IconComp = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-violet-50/80 border-violet-300 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-stone-50/50 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <IconComp className={`w-4 h-4 ${isCurrent ? 'text-violet-600 animate-spin' : isDone ? 'text-emerald-600' : 'text-stone-400'}`} />
                    <span className="text-xs font-bold text-stone-900">{stage.label}</span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                  ) : null}
                </div>
                <p className="text-[11px] text-stone-600 font-mono leading-tight">{stage.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          {AUDIT_STAGES.slice(4).map((stage, sIdx) => {
            const actualIdx = sIdx + 4;
            const isDone = activeStageIdx > actualIdx;
            const isCurrent = activeStageIdx === actualIdx;
            const IconComp = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-violet-50/80 border-violet-300 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-stone-50/50 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <IconComp className={`w-4 h-4 ${isCurrent ? 'text-violet-600 animate-spin' : isDone ? 'text-emerald-600' : 'text-stone-400'}`} />
                    <span className="text-xs font-bold text-stone-900">{stage.label}</span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                  ) : null}
                </div>
                <p className="text-[11px] text-stone-600 font-mono leading-tight">{stage.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="mt-6 pt-4 border-t border-stone-200 text-center text-[11px] font-mono text-stone-500">
        ✨ The platform will automatically transition to the full UAT Acceptance Dashboard as soon as the crawl and sign-off compilation settles.
      </div>
    </div>
  );
}
