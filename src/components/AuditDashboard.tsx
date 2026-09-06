'use client';

import React, { useState } from 'react';
import { ScoreRing } from './ScoreRing';
import { CoreWebVitalsPanel } from './CoreWebVitalsPanel';
import { LinkValidationPanel } from './LinkValidationPanel';
import { PerformanceThrottler } from './PerformanceThrottler';
import { VulnerabilityTree } from './VulnerabilityTree';
import { AuditReport } from '@/lib/audit/types';
import {
  Layers,
  Link2,
  Cpu,
  ShieldAlert,
  Download,
  Globe,
  Clock,
} from 'lucide-react';

interface AuditDashboardProps {
  report: AuditReport;
  onExportSarif: () => void;
}

export function AuditDashboard({ report, onExportSarif }: AuditDashboardProps) {
  const [activeTab, setActiveTab] = useState<'cwv' | 'links' | 'throttler' | 'bugs'>('cwv');

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `unova-uat-${new URL(report.targetUrl).hostname}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Target Summary Ribbon */}
      <div className="rounded-xl bg-gengar-calligraphy-black/80 border border-gengar-bright-violet/20 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-aura-light-lavender shrink-0" />
          <div className="flex items-center gap-2 truncate">
            <span className="text-sm font-mono font-bold text-parchment-cream truncate">
              {report.targetUrl}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gengar-deep-purple/60 text-aura-light-lavender border border-gengar-bright-violet/30">
              AUDITED
            </span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadJson}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-gengar-deep-purple/30 hover:bg-gengar-deep-purple/60 text-smoke-taupe hover:text-parchment-pale border border-gengar-bright-violet/20 transition-colors"
          >
            <Download className="w-3 h-3 text-sun-warm-ochre" />
            <span>JSON</span>
          </button>
          <button
            onClick={onExportSarif}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-gengar-deep-purple/50 hover:bg-gengar-deep-purple text-aura-light-lavender border border-gengar-bright-violet/30 transition-colors"
          >
            <Download className="w-3 h-3 text-eye-glow-orange" />
            <span>SARIF 2.1.0</span>
          </button>
        </div>
      </div>

      {/* Primary Score Meters Bar - Clean & Balanced */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-xl bg-gengar-calligraphy-black/75 border border-gengar-bright-violet/20 p-4 backdrop-blur-md">
        <ScoreRing
          score={report.overallScore}
          label="Overall Score"
          subtitle="Health Matrix"
          size={120}
          strokeWidth={8}
        />
        <ScoreRing
          score={report.scores.coreWebVitals}
          label="Core Web Vitals"
          subtitle="LCP, INP, CLS"
          size={120}
          strokeWidth={8}
        />
        <ScoreRing
          score={report.scores.seoAndIndexability}
          label="Search Essentials"
          subtitle="SEO & Indexing"
          size={120}
          strokeWidth={8}
        />
        <ScoreRing
          score={report.scores.linkCompliance}
          label="Link Quality"
          subtitle="Crawlable Anchors"
          size={120}
          strokeWidth={8}
        />
        <ScoreRing
          score={report.scores.securityPosture}
          label="Security Posture"
          subtitle="CSP, HSTS, Framing"
          size={120}
          strokeWidth={8}
        />
      </div>

      {/* Clean Navigation Tabs */}
      <div className="flex border-b border-gengar-bright-violet/15 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('cwv')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
            activeTab === 'cwv'
              ? 'bg-gengar-deep-purple/80 text-parchment-cream border border-gengar-bright-violet/40'
              : 'text-smoke-taupe hover:text-parchment-pale hover:bg-gengar-deep-purple/20'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-aura-light-lavender" />
          <span>Core Web Vitals & SEO</span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
            activeTab === 'links'
              ? 'bg-gengar-deep-purple/80 text-parchment-cream border border-gengar-bright-violet/40'
              : 'text-smoke-taupe hover:text-parchment-pale hover:bg-gengar-deep-purple/20'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-aura-light-lavender" />
          <span>Link Validation ({linkCount(report)})</span>
        </button>

        <button
          onClick={() => setActiveTab('throttler')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
            activeTab === 'throttler'
              ? 'bg-gengar-deep-purple/80 text-sun-muted-tan border border-sun-warm-ochre/40'
              : 'text-smoke-taupe hover:text-parchment-pale hover:bg-gengar-deep-purple/20'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-eye-glow-orange" />
          <span>Hardware Simulation</span>
        </button>

        <button
          onClick={() => setActiveTab('bugs')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
            activeTab === 'bugs'
              ? 'bg-gengar-deep-purple/80 text-eye-glow-orange border border-eye-flame-red/40'
              : 'text-smoke-taupe hover:text-parchment-pale hover:bg-gengar-deep-purple/20'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-eye-flame-red" />
          <span>Bugs & Security ({report.security.findings.length + report.deepBugs.hydrationMismatches.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'cwv' && <CoreWebVitalsPanel report={report} />}
        {activeTab === 'links' && <LinkValidationPanel report={report} />}
        {activeTab === 'throttler' && <PerformanceThrottler report={report} />}
        {activeTab === 'bugs' && <VulnerabilityTree report={report} />}
      </div>
    </div>
  );
}

function linkCount(report: AuditReport): number {
  return report.linkAudit ? report.linkAudit.totalLinks : 0;
}
