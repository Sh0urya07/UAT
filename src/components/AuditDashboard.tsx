'use client';

import React, { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
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
  const tabContentRef = useRef<HTMLDivElement>(null);
  const scoreContainerRef = useRef<HTMLDivElement>(null);

  // Tab switch crossfade animation
  useEffect(() => {
    if (tabContentRef.current) {
      anime({
        targets: tabContentRef.current,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 350,
        easing: 'easeOutQuad',
      });
    }
  }, [activeTab]);

  // Staggered reveal for score meters
  useEffect(() => {
    if (scoreContainerRef.current) {
      anime({
        targets: scoreContainerRef.current.children,
        opacity: [0, 1],
        scale: [0.94, 1],
        translateY: [10, 0],
        delay: anime.stagger(65),
        duration: 600,
        easing: 'easeOutCubic',
      });
    }
  }, [report.targetUrl, report.overallScore]);

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
      <div className="rounded-xl bg-white/90 border border-stone-200/90 shadow-sm px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-gengar-bright-violet shrink-0" />
          <div className="flex items-center gap-2 truncate">
            <span className="text-sm font-mono font-bold text-stone-900 truncate">
              {report.targetUrl}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
              AUDITED
            </span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadJson}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-300 transition-colors"
          >
            <Download className="w-3 h-3 text-amber-600" />
            <span>JSON</span>
          </button>
          <button
            onClick={onExportSarif}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-stone-900 hover:bg-stone-800 text-white border border-stone-900 shadow-sm transition-colors"
          >
            <Download className="w-3 h-3 text-orange-400" />
            <span>SARIF 2.1.0</span>
          </button>
        </div>
      </div>

      {/* Primary Score Meters Bar - Clean & Balanced */}
      <div ref={scoreContainerRef} className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-xl bg-white/85 border border-stone-200/90 shadow-sm p-4 backdrop-blur-md">
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
      <div className="flex border-b border-stone-300/80 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('cwv')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
            activeTab === 'cwv'
              ? 'bg-stone-900 text-white border border-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/80 border border-transparent'
          }`}
        >
          <Layers className={`w-3.5 h-3.5 ${activeTab === 'cwv' ? 'text-violet-300' : 'text-stone-500'}`} />
          <span>Core Web Vitals & SEO</span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
            activeTab === 'links'
              ? 'bg-stone-900 text-white border border-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/80 border border-transparent'
          }`}
        >
          <Link2 className={`w-3.5 h-3.5 ${activeTab === 'links' ? 'text-violet-300' : 'text-stone-500'}`} />
          <span>Link Validation ({linkCount(report)})</span>
        </button>

        <button
          onClick={() => setActiveTab('throttler')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
            activeTab === 'throttler'
              ? 'bg-stone-900 text-white border border-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/80 border border-transparent'
          }`}
        >
          <Cpu className={`w-3.5 h-3.5 ${activeTab === 'throttler' ? 'text-orange-400' : 'text-stone-500'}`} />
          <span>Hardware Simulation</span>
        </button>

        <button
          onClick={() => setActiveTab('bugs')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
            activeTab === 'bugs'
              ? 'bg-stone-900 text-white border border-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/80 border border-transparent'
          }`}
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${activeTab === 'bugs' ? 'text-red-400' : 'text-stone-500'}`} />
          <span>Bugs & Security ({report.security.findings.length + report.deepBugs.hydrationMismatches.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div ref={tabContentRef}>
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
