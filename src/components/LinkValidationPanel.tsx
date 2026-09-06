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
        <div className="p-3.5 rounded-xl bg-gengar-calligraphy-black/80 border border-gengar-bright-violet/20 backdrop-blur-md">
          <span className="text-[10px] font-mono text-smoke-taupe uppercase">TOTAL LINKS</span>
          <div className="text-xl font-bold font-mono text-parchment-cream mt-1">
            {linkAudit.totalLinks}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gengar-calligraphy-black/80 border border-gengar-bright-violet/20 backdrop-blur-md">
          <span className="text-[10px] font-mono text-smoke-taupe uppercase">CRAWLABLE</span>
          <div className="text-xl font-bold font-mono text-aura-light-lavender mt-1">
            {linkAudit.crawlableLinksCount} / {linkAudit.totalLinks}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gengar-calligraphy-black/80 border border-gengar-bright-violet/20 backdrop-blur-md">
          <span className="text-[10px] font-mono text-smoke-taupe uppercase">TOPOLOGY</span>
          <div className="text-xs font-bold font-mono text-parchment-cream mt-1.5 flex items-center gap-1.5">
            <span className="text-aura-light-lavender">{linkAudit.internalLinksCount} int</span>
            <span className="text-smoke-sepia">/</span>
            <span className="text-sun-warm-ochre">{linkAudit.externalLinksCount} ext</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-gengar-calligraphy-black/80 border border-gengar-bright-violet/20 backdrop-blur-md">
          <span className="text-[10px] font-mono text-smoke-taupe uppercase">GENERIC ANCHORS</span>
          <div className={`text-xl font-bold font-mono mt-1 ${
            linkAudit.genericAnchorCount === 0 ? 'text-aura-light-lavender' : 'text-eye-glow-orange'
          }`}>
            {linkAudit.genericAnchorCount}
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="rounded-xl bg-gengar-calligraphy-black/80 border border-gengar-bright-violet/20 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-gengar-bright-violet/15">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-aura-light-lavender" />
            <h3 className="text-sm font-bold text-parchment-cream">
              Google-Compliant Link Validation
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('violations')}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                activeTab === 'violations'
                  ? 'bg-gengar-deep-purple text-aura-light-lavender border border-gengar-bright-violet/40'
                  : 'text-smoke-taupe hover:text-parchment-pale'
              }`}
            >
              Violations ({linkAudit.genericAnchorViolations.length + linkAudit.nonCrawlableViolations.length})
            </button>
            <button
              onClick={() => setActiveTab('all-links')}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                activeTab === 'all-links'
                  ? 'bg-gengar-deep-purple text-aura-light-lavender border border-gengar-bright-violet/40'
                  : 'text-smoke-taupe hover:text-parchment-pale'
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
              <div className="p-4 rounded-lg bg-gengar-deep-purple/20 border border-gengar-bright-violet/20 text-xs font-mono text-aura-light-lavender flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-aura-light-lavender shrink-0" />
                <span>Zero anchor violations detected. All document hyperlinks adhere to Google SEO crawlability standards.</span>
              </div>
            ) : (
              linkAudit.genericAnchorViolations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-gengar-deep-purple/20 border border-eye-glow-orange/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-eye-glow-orange">
                      Vague Anchor: &quot;{v.anchorText}&quot;
                    </span>
                    <span className="text-[10px] font-mono text-smoke-taupe truncate max-w-xs">
                      {v.href}
                    </span>
                  </div>
                  <p className="text-xs text-smoke-sepia">{v.flaggedReason}</p>
                  <div className="text-xs font-mono text-aura-light-lavender flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3 h-3 text-eye-glow-orange shrink-0" />
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
            <div className="overflow-x-auto rounded-lg border border-gengar-bright-violet/15">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-gengar-deep-purple/40 text-smoke-taupe border-b border-gengar-bright-violet/15">
                  <tr>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Anchor Text</th>
                    <th className="p-2.5">Target Destination</th>
                    <th className="p-2.5">Crawlable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gengar-bright-violet/10">
                  {filteredLinks.map((l, idx) => (
                    <tr key={idx} className="hover:bg-gengar-deep-purple/20">
                      <td className="p-2.5">
                        <span className="text-[10px] uppercase font-bold text-aura-light-lavender">
                          {l.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-parchment-pale max-w-[160px] truncate">
                        {l.text || '(empty)'}
                      </td>
                      <td className="p-2.5 text-smoke-taupe max-w-[240px] truncate">
                        {l.href}
                      </td>
                      <td className="p-2.5">
                        {l.isCrawlable ? (
                          <span className="text-aura-light-lavender">Yes</span>
                        ) : (
                          <span className="text-eye-flame-red">No</span>
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
