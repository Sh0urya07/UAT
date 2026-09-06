'use client';

import React, { useState } from 'react';
import { Link2, AlertTriangle, CheckCircle2, XCircle, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { AuditReport } from '@/lib/audit/types';

interface LinkValidationPanelProps {
  report: AuditReport;
}

export function LinkValidationPanel({ report }: LinkValidationPanelProps) {
  const { linkAudit } = report;
  const [activeTab, setActiveTab] = useState<'violations' | 'all-links'>('violations');
  const [filterType, setFilterType] = useState<'all' | 'internal' | 'external'>('all');

  const filteredLinks = linkAudit.links.filter((l) => {
    if (filterType === 'all') return true;
    return l.type === filterType;
  });

  return (
    <div className="space-y-5">
      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white/90 border border-stone-200/90 shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">TOTAL LINKS</span>
          <div className="text-xl font-bold font-mono text-stone-900 mt-1">
            {linkAudit.totalLinks}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/90 border border-stone-200/90 shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">CRAWLABLE</span>
          <div className="text-xl font-bold font-mono text-violet-700 mt-1">
            {linkAudit.crawlableLinksCount} / {linkAudit.totalLinks}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/90 border border-stone-200/90 shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">TOPOLOGY</span>
          <div className="text-xs font-bold font-mono text-stone-900 mt-1.5 flex items-center gap-1.5">
            <span className="text-violet-700">{linkAudit.internalLinksCount} int</span>
            <span className="text-stone-400">/</span>
            <span className="text-amber-700">{linkAudit.externalLinksCount} ext</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/90 border border-stone-200/90 shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">GENERIC ANCHORS</span>
          <div className={`text-xl font-bold font-mono mt-1 ${
            linkAudit.genericAnchorCount === 0 ? 'text-emerald-600' : 'text-orange-600'
          }`}>
            {linkAudit.genericAnchorCount}
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="rounded-xl bg-white/90 border border-stone-200/90 shadow-sm p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gengar-bright-violet" />
            <h3 className="text-sm font-bold text-stone-900">
              Google-Compliant Link Validation
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('violations')}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                activeTab === 'violations'
                  ? 'bg-stone-900 text-white font-semibold shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Violations ({linkAudit.genericAnchorViolations.length + linkAudit.nonCrawlableViolations.length})
            </button>
            <button
              onClick={() => setActiveTab('all-links')}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                activeTab === 'all-links'
                  ? 'bg-stone-900 text-white font-semibold shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              All Links ({linkAudit.links.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Violations */}
        {activeTab === 'violations' && (
          <div className="mt-4 space-y-3">
            {linkAudit.genericAnchorViolations.length === 0 && linkAudit.nonCrawlableViolations.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero anchor violations detected. All document hyperlinks adhere to Google SEO crawlability standards.</span>
              </div>
            ) : (
              linkAudit.genericAnchorViolations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-300 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-amber-900">
                      Vague Anchor: &quot;{v.anchorText}&quot;
                    </span>
                    <span className="text-[10px] font-mono text-stone-600 truncate max-w-xs">
                      {v.href}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{v.flaggedReason}</p>
                  <div className="text-xs font-mono text-violet-800 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                    <span>{v.suggestion}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: All Links */}
        {activeTab === 'all-links' && (
          <div className="mt-4 space-y-3">
            <div className="overflow-x-auto rounded-lg border border-stone-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-100 text-stone-700 border-b border-stone-200">
                  <tr>
                    <th className="p-2.5 font-semibold">Type</th>
                    <th className="p-2.5 font-semibold">Anchor Text</th>
                    <th className="p-2.5 font-semibold">Target Destination</th>
                    <th className="p-2.5 font-semibold">Crawlable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredLinks.map((l, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/80">
                      <td className="p-2.5">
                        <span className="text-[10px] uppercase font-bold text-violet-700">
                          {l.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-stone-900 max-w-[160px] truncate">
                        {l.text || '(empty)'}
                      </td>
                      <td className="p-2.5 text-stone-600 max-w-[240px] truncate">
                        {l.href}
                      </td>
                      <td className="p-2.5">
                        {l.isCrawlable ? (
                          <span className="text-emerald-700 font-bold">Yes</span>
                        ) : (
                          <span className="text-rose-700 font-bold">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
