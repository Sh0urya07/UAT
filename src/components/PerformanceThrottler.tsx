'use client';

import React, { useState, useMemo } from 'react';
import { Smartphone, Monitor, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AuditReport } from '@/lib/audit/types';
import { simulateDeviceThrottling } from '@/lib/audit/mobileSimulator';

interface PerformanceThrottlerProps {
  report: AuditReport;
}

export function PerformanceThrottler({ report }: PerformanceThrottlerProps) {
  const [activeProfileId, setActiveProfileId] = useState<'desktop' | 'mid-mobile' | 'budget-2gb'>('budget-2gb');

  const throttledProfile = useMemo(() => {
    return simulateDeviceThrottling(
      activeProfileId,
      report.coreWebVitals.lcp.value,
      report.coreWebVitals.inp.value,
      report.deepBugs.memoryLeakHeuristics.domNodeCount
    );
  }, [activeProfileId, report.coreWebVitals.lcp.value, report.coreWebVitals.inp.value, report.deepBugs.memoryLeakHeuristics.domNodeCount]);

  const { simulation } = throttledProfile;
  const throttledLcp = Number((report.coreWebVitals.lcp.value * simulation.lcpMultiplier).toFixed(2));
  const throttledInp = Math.round(report.coreWebVitals.inp.value * simulation.inpMultiplier);

  return (
    <div className="rounded-xl bg-gengar-calligraphy-black/80 border border-gengar-bright-violet/20 p-5 backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gengar-bright-violet/15">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-eye-glow-orange" />
            <h3 className="text-sm font-bold text-parchment-cream">
              Hardware Performance Simulation
            </h3>
          </div>
          <p className="text-xs text-smoke-taupe mt-0.5">
            Simulate real client constraints (2GB RAM, 6x CPU slowdown, slow network).
          </p>
        </div>

        <div className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
          simulation.status === 'Good'
            ? 'bg-gengar-deep-purple text-aura-light-lavender border-gengar-bright-violet/40'
            : 'bg-gengar-deep-purple text-eye-glow-orange border-eye-glow-orange/40'
        }`}>
          {simulation.status}
        </div>
      </div>

      {/* Device Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { id: 'desktop' as const, name: 'Desktop (Unthrottled)', sub: '1x CPU • 16GB RAM', icon: Monitor },
          { id: 'mid-mobile' as const, name: 'Standard Mobile', sub: '2.5x CPU • 6GB RAM', icon: Smartphone },
          { id: 'budget-2gb' as const, name: 'Budget 2GB Phone', sub: '6x CPU • 2GB RAM • Slow 4G', icon: Smartphone },
        ].map((device) => {
          const isSelected = activeProfileId === device.id;
          const Icon = device.icon;
          return (
            <button
              key={device.id}
              onClick={() => setActiveProfileId(device.id)}
              className={`p-3 rounded-lg border text-left transition-all flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-gengar-deep-purple/80 border-gengar-bright-violet/60 text-parchment-cream shadow-glow-violet'
                  : 'bg-gengar-deep-purple/20 border-gengar-bright-violet/10 text-smoke-taupe hover:text-parchment-pale hover:bg-gengar-deep-purple/30'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-eye-glow-orange' : 'text-smoke-taupe'}`} />
              <div>
                <div className="text-xs font-bold font-mono">{device.name}</div>
                <div className="text-[10px] text-smoke-sepia">{device.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3 Clean Metric Readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-gengar-deep-purple/20 border border-gengar-bright-violet/10">
          <span className="text-[10px] font-mono text-smoke-taupe uppercase">TOTAL LOAD TIME</span>
          <div className="text-xl font-bold font-mono text-parchment-cream mt-1">
            {simulation.totalLoadTimeSec}s
          </div>
          <div className="text-[10px] text-smoke-sepia mt-0.5">
            Baseline: {report.coreWebVitals.lcp.value}s
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-gengar-deep-purple/20 border border-gengar-bright-violet/10">
          <span className="text-[10px] font-mono text-smoke-taupe uppercase">DEGRADED LCP</span>
          <div className="text-xl font-bold font-mono text-aura-light-lavender mt-1">
            {throttledLcp}s
          </div>
          <div className="text-[10px] text-smoke-sepia mt-0.5">
            &times;{simulation.lcpMultiplier} latency penalty
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-gengar-deep-purple/20 border border-gengar-bright-violet/10">
          <span className="text-[10px] font-mono text-smoke-taupe uppercase">DEGRADED INP</span>
          <div className="text-xl font-bold font-mono text-sun-warm-ochre mt-1">
            {throttledInp}ms
          </div>
          <div className="text-[10px] text-smoke-sepia mt-0.5">
            &times;{simulation.inpMultiplier} CPU touch latency
          </div>
        </div>
      </div>
    </div>
  );
}
