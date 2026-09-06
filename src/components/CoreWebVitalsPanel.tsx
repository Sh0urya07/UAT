'use client';

import React from 'react';
import { Clock, Eye, Layers, Search, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { AuditReport, CoreWebVitalsMetric } from '@/lib/audit/types';

interface CoreWebVitalsPanelProps {
  report: AuditReport;
}

function MetricCard({
  name,
  metric,
  subtext,
  icon: Icon,
}: {
  name: string;
  metric: CoreWebVitalsMetric;
  subtext: string;
  icon: React.ElementType;
}) {
  const isGood = metric.rating === 'good';
  const isNeedsImprovement = metric.rating === 'needs-improvement';

  const badgeColor = isGood
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
    : isNeedsImprovement
    ? 'bg-amber-50 text-amber-800 border-amber-300'
    : 'bg-rose-50 text-rose-800 border-rose-300';

  return (
    <div className="rounded-xl bg-white/90 border border-stone-200/90 shadow-sm p-5 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-stone-100 text-stone-800">
            <Icon className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">{name}</h4>
            <span className="text-[10px] font-mono text-stone-500">{subtext}</span>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badgeColor}`}>
          {metric.rating.replace('-', ' ')}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black font-mono text-stone-900">
          {metric.value}
        </span>
        <span className="text-xs font-mono text-stone-500">{metric.unit}</span>
      </div>

      {metric.candidateElement && (
        <div className="p-2 rounded bg-stone-50 text-[11px] font-mono text-stone-700 truncate border border-stone-200">
          <span className="text-stone-400 mr-1">Target:</span>
          {metric.candidateElement}
        </div>
      )}

      <div className="pt-2 border-t border-stone-200 space-y-1 text-xs font-mono">
        {Object.entries(metric.breakdown).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-stone-500 capitalize">
              {key.replace(/([A-Z])/g, ' $1').replace('Ms', ' (ms)')}:
            </span>
            <span className="text-stone-800 font-semibold">{String(val)}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-stone-600 leading-relaxed pt-1">
        {metric.details}
      </p>
    </div>
  );
}

export function CoreWebVitalsPanel({ report }: CoreWebVitalsPanelProps) {
  const { coreWebVitals, searchEssentials } = report;

  return (
    <div className="space-y-5">
      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          name="Largest Contentful Paint"
          metric={coreWebVitals.lcp}
          subtext="Load Speed (<= 2.5s)"
          icon={Clock}
        />
        <MetricCard
          name="Interaction to Next Paint"
          metric={coreWebVitals.inp}
          subtext="Responsiveness (<= 200ms)"
          icon={Layers}
        />
        <MetricCard
          name="Cumulative Layout Shift"
          metric={coreWebVitals.cls}
          subtext="Visual Stability (<= 0.1)"
          icon={Eye}
        />
      </div>

      {/* Indexability Matrix */}
      <div className="rounded-xl bg-white/90 border border-stone-200/90 shadow-sm p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gengar-bright-violet" />
            <h3 className="text-sm font-bold text-stone-900">
              Google Search Essentials Matrix
            </h3>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
            searchEssentials.isIndexable
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}>
            {searchEssentials.isIndexable ? 'INDEXABLE' : 'BLOCKED'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-stone-50/80 border border-stone-200/90">
            <div className="flex items-center justify-between text-xs font-mono text-stone-500">
              <span>ROBOTS.TXT</span>
              {searchEssentials.hasRobotsTxt ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>
            <div className="mt-1 text-xs font-bold text-stone-900">
              {searchEssentials.hasRobotsTxt ? 'Configured' : 'Missing'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-50/80 border border-stone-200/90">
            <div className="flex items-center justify-between text-xs font-mono text-stone-500">
              <span>CANONICAL</span>
              {searchEssentials.canonicalStatus === 'valid' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>
            <div className="mt-1 text-xs font-bold text-stone-900 capitalize">
              {searchEssentials.canonicalStatus}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-50/80 border border-stone-200/90">
            <div className="flex items-center justify-between text-xs font-mono text-stone-500">
              <span>STRUCTURED DATA</span>
              {searchEssentials.structuredData.hasJsonLd ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="text-[10px] text-stone-400">None</span>
              )}
            </div>
            <div className="mt-1 text-xs font-bold text-stone-900">
              {searchEssentials.structuredData.hasJsonLd
                ? searchEssentials.structuredData.types.join(', ')
                : 'No JSON-LD'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
