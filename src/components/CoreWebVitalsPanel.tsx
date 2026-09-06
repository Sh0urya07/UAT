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
    ? 'bg-gengar-deep-purple text-aura-light-lavender border-gengar-bright-violet/40'
    : isNeedsImprovement
    ? 'bg-gengar-deep-purple text-sun-warm-ochre border-sun-warm-ochre/40'
    : 'bg-gengar-deep-purple text-eye-flame-red border-eye-flame-red/40';

  return (
    <div className="rounded-xl bg-gengar-calligraphy-black/80 border border-gengar-bright-violet/20 p-5 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gengar-deep-purple/40 text-aura-light-lavender">
            <Icon className="w-4 h-4 text-eye-glow-orange" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-parchment-cream">{name}</h4>
            <span className="text-[10px] font-mono text-smoke-taupe">{subtext}</span>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${badgeColor}`}>
          {metric.rating.replace('-', ' ')}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black font-mono text-parchment-cream">
          {metric.value}
        </span>
        <span className="text-xs font-mono text-smoke-taupe">{metric.unit}</span>
      </div>

      {metric.candidateElement && (
        <div className="p-2 rounded bg-gengar-deep-purple/20 text-[11px] font-mono text-aura-light-lavender truncate border border-gengar-bright-violet/10">
          <span className="text-smoke-taupe mr-1">Target:</span>
          {metric.candidateElement}
        </div>
      )}

      <div className="pt-2 border-t border-gengar-bright-violet/10 space-y-1 text-xs font-mono">
        {Object.entries(metric.breakdown).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-smoke-taupe capitalize">
              {key.replace(/([A-Z])/g, ' $1').replace('Ms', ' (ms)')}:
            </span>
            <span className="text-parchment-pale">{String(val)}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-smoke-taupe leading-relaxed pt-1">
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
      <div className="rounded-xl bg-gengar-calligraphy-black/80 border border-gengar-bright-violet/20 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-gengar-bright-violet/15">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-aura-light-lavender" />
            <h3 className="text-sm font-bold text-parchment-cream">
              Google Search Essentials Matrix
            </h3>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
            searchEssentials.isIndexable
              ? 'bg-gengar-deep-purple text-aura-light-lavender border-gengar-bright-violet/40'
              : 'bg-gengar-deep-purple text-eye-flame-red border-eye-flame-red/40'
          }`}>
            {searchEssentials.isIndexable ? 'INDEXABLE' : 'BLOCKED'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-gengar-deep-purple/20 border border-gengar-bright-violet/10">
            <div className="flex items-center justify-between text-xs font-mono text-smoke-taupe">
              <span>ROBOTS.TXT</span>
              {searchEssentials.hasRobotsTxt ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-aura-light-lavender" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-eye-glow-orange" />
              )}
            </div>
            <div className="mt-1 text-xs font-bold text-parchment-cream">
              {searchEssentials.hasRobotsTxt ? 'Configured' : 'Missing'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gengar-deep-purple/20 border border-gengar-bright-violet/10">
            <div className="flex items-center justify-between text-xs font-mono text-smoke-taupe">
              <span>CANONICAL</span>
              {searchEssentials.canonicalStatus === 'valid' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-aura-light-lavender" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-eye-glow-orange" />
              )}
            </div>
            <div className="mt-1 text-xs font-bold text-parchment-cream capitalize">
              {searchEssentials.canonicalStatus}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gengar-deep-purple/20 border border-gengar-bright-violet/10">
            <div className="flex items-center justify-between text-xs font-mono text-smoke-taupe">
              <span>STRUCTURED DATA</span>
              {searchEssentials.structuredData.hasJsonLd ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-aura-light-lavender" />
              ) : (
                <span className="text-[10px] text-smoke-taupe">None</span>
              )}
            </div>
            <div className="mt-1 text-xs font-bold text-parchment-cream">
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
