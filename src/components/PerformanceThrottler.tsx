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
    <div className="rounded-xl bg-white/90 border border-stone-200/90 shadow-sm p-5 backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Hardware Performance Simulation
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Simulate real client constraints (2GB RAM, 6x CPU slowdown, slow network).
          </p>
        </div>

        <div className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
          simulation.status === 'Good'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-amber-50 text-amber-800 border-amber-300'
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
                  ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                  : 'bg-stone-50/80 border-stone-200/80 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-orange-400' : 'text-stone-400'}`} />
              <div>
                <div className="text-xs font-bold font-mono">{device.name}</div>
                <div className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>{device.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3 Clean Metric Readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-stone-50/80 border border-stone-200/90">
          <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">TOTAL LOAD TIME</span>
          <div className="text-xl font-bold font-mono text-stone-900 mt-1">
            {simulation.totalLoadTimeSec}s
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">
            Baseline: {report.coreWebVitals.lcp.value}s
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-stone-50/80 border border-stone-200/90">
          <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">DEGRADED LCP</span>
          <div className="text-xl font-bold font-mono text-violet-700 mt-1">
            {throttledLcp}s
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">
            &times;{simulation.lcpMultiplier} latency penalty
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-stone-50/80 border border-stone-200/90">
          <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">DEGRADED INP</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            {throttledInp}ms
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">
            &times;{simulation.inpMultiplier} CPU touch latency
          </div>
        </div>
      </div>
    </div>
  );
}
