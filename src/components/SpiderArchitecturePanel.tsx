'use client';

import React from 'react';
import { SpiderArchitectureReport } from '@/lib/audit/types';
import {
  Network,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Clock,
  Smartphone,
} from 'lucide-react';

interface SpiderArchitecturePanelProps {
  spider?: SpiderArchitectureReport;
  targetUrl: string;
}

export function SpiderArchitecturePanel({ spider, targetUrl }: SpiderArchitecturePanelProps) {
  if (!spider) {
    return (
      <div className="p-8 rounded-xl bg-white/90 border border-stone-200 text-center space-y-3 backdrop-blur-md">
        <Network className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="text-base font-bold text-stone-800">Multi-Page Spider Not Triggered</h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto">
          This audit was executed as a Fast Single-Page Probe. To crawl the internal route tree, aggregate systemic security findings across pages, and simulate multi-page 2GB RAM / 6x CPU constraints, enable <strong>Deep Multi-Page Spider Crawl</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Spider Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scope & Route Volume */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Crawl Scope</span>
            <Network className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{spider.totalPagesCrawled}</span>
            <span className="text-xs text-stone-500 font-mono">Routes Crawled</span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            {spider.routeDistribution.internal} internal links discovered across site topology.
          </div>
        </div>

        {/* Multi-Page Health Average */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Avg Health Score</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${spider.averageHealthScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {spider.averageHealthScore}/100
            </span>
            <span className="text-xs text-stone-500 font-mono">Site-Wide Mean</span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            Weighted across performance, links, and DOM health for all routes.
          </div>
        </div>

        {/* Systemic Security Findings */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Systemic Security</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-600">{spider.totalSystemicFindings}</span>
            <span className="text-xs text-stone-500 font-mono">Total Issues ({spider.systemicSecurityScore}/100)</span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            Systemic missing headers (CSP, HSTS, X-Frame) repeated across pages.
          </div>
        </div>

        {/* Aggregate Budget Mobile Load (2GB RAM / 6x CPU) */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Mobile Throttling</span>
            <Smartphone className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-orange-600">{spider.aggregateMobileLoadTimeSec}s</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-bold">
              {spider.aggregateMobileStatus}
            </span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            2GB RAM / 6x CPU slowdown benchmark (Homepage: {spider.homepagePerformance.totalLoadSec}s total, FCP {spider.homepagePerformance.fcpMs}ms).
          </div>
        </div>
      </div>

      {/* Discrepancy Insight Callout */}
      <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 shadow-sm backdrop-blur-md flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900 font-mono">
            Single-Page vs Multi-Page Architecture Variance Explained
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            A single-page probe only evaluates the root route in isolation (e.g. 88/100 score, 3.12s load time), whereas the <strong>Spider Engine</strong> audits {spider.totalPagesCrawled} routes across your entire site architecture. This surfaces systemic vulnerabilities (e.g. 78 total security findings across sub-routes) and reveals that under real-world 2GB RAM / 6x CPU hardware constraints, cumulative multi-page asset weight pushes load times to {spider.aggregateMobileLoadTimeSec}s.
          </p>
        </div>
      </div>

      {/* Crawled Route Tree Table */}
      <div className="rounded-xl bg-white/90 border border-stone-200 shadow-sm overflow-hidden backdrop-blur-md">
        <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-violet-700" />
            <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              Autonomous Spider Route Hierarchy ({spider.pages.length} Pages)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-500">Breadth-First Search (BFS)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-100/70 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="px-4 py-2.5">Path</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Depth</th>
                <th className="px-3 py-2.5">Size</th>
                <th className="px-3 py-2.5">Latency</th>
                <th className="px-3 py-2.5">Security Issues</th>
                <th className="px-4 py-2.5">Key Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {spider.pages.map((p, idx) => (
                <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-stone-900 flex items-center gap-1.5">
                    <span className="text-stone-400">{'—'.repeat(p.depth)}</span>
                    <a href={p.url} target="_blank" rel="noreferrer" className="hover:underline text-stone-900">
                      {p.path}
                    </a>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === 200 ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-300'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-stone-600">Level {p.depth}</td>
                  <td className="px-3 py-2.5 text-stone-600">{p.sizeKb} KB</td>
                  <td className="px-3 py-2.5 text-stone-600">{p.loadTimeMs} ms</td>
                  <td className="px-3 py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold border border-red-200 text-[10px]">
                      {p.securityFindingsCount} issues
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-stone-600 max-w-xs truncate">
                    {p.issues.join(' • ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
