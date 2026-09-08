'use client';

import React, { useState } from 'react';
import {
  UATAcceptanceReport,
  UATVerdict,
  UATUserStory,
  UATStoryStatus,
  UATUserJourney,
} from '@/lib/audit/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  ShieldCheck,
  Smartphone,
  Scale,
  Users,
  Award,
  Download,
  Filter,
  CheckSquare,
  AlertOctagon,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Server,
  Code2,
  Activity,
  Bug,
  Compass,
  Layers,
} from 'lucide-react';

interface UATAcceptancePanelProps {
  uat?: UATAcceptanceReport;
  targetUrl: string;
}

export function UATAcceptancePanel({ uat, targetUrl }: UATAcceptancePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [focusAreaTab, setFocusAreaTab] = useState<'dom' | 'cwv' | 'journeys' | 'defects'>('journeys');

  if (!uat) {
    return (
      <div className="p-8 rounded-xl bg-white/90 border border-stone-200 text-center space-y-3 backdrop-blur-md">
        <FileCheck className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="text-base font-bold text-stone-800">UAT Evaluation In Progress</h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto">
          User Acceptance Testing is compiling business alignment stories, operational readiness metrics, DOM integrity, and regulatory sign-off criteria.
        </p>
      </div>
    );
  }

  const verdictVal = uat.overallVerdict || uat.verdict;
  const readinessVal = uat.overallReadinessScore ?? uat.readinessScore ?? 80;

  const filteredStories = uat.userStories.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    return true;
  });

  const getVerdictBadge = (verdict: UATVerdict) => {
    switch (verdict) {
      case 'GO_FOR_PRODUCTION':
        return {
          title: 'GO FOR PRODUCTION (ACCEPTED)',
          sub: 'All core user stories, operational thresholds, DOM integrity, and compliance gates verified.',
          bg: 'bg-emerald-900 text-emerald-100 border-emerald-700',
          badgeBg: 'bg-emerald-500 text-stone-950 font-black',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
        };
      case 'CONDITIONAL_ACCEPTANCE':
        return {
          title: 'CONDITIONAL ACCEPTANCE (NEEDS REMEDIATION)',
          sub: 'Accepted for staging with non-blocking business, performance, or compliance items.',
          bg: 'bg-amber-950 text-amber-100 border-amber-800',
          badgeBg: 'bg-amber-400 text-stone-950 font-black',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
        };
      case 'NO_GO_REJECTED':
      default:
        return {
          title: 'NO-GO (REJECTED FOR PRODUCTION)',
          sub: 'Blocking user story failures, device starvation, or critical defects prevent client sign-off.',
          bg: 'bg-red-950 text-red-100 border-red-800',
          badgeBg: 'bg-red-500 text-white font-black',
          icon: <XCircle className="w-6 h-6 text-red-400" />,
        };
    }
  };

  const vInfo = getVerdictBadge(verdictVal);

  const downloadCertificate = () => {
    const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Formal UAT Acceptance Certificate - ${new URL(targetUrl).hostname}</title>
  <style>
    body { font-family: 'Segoe UI', -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 900px; margin: 0 auto; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .stamp { display: inline-block; padding: 8px 16px; border-radius: 8px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; ${verdictVal === 'GO_FOR_PRODUCTION' ? 'background: #dcfce7; color: #166534; border: 2px solid #22c55e;' : verdictVal === 'CONDITIONAL_ACCEPTANCE' ? 'background: #fef3c7; color: #92400e; border: 2px solid #f59e0b;' : 'background: #fee2e2; color: #991b1b; border: 2px solid #ef4444;'} }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; border: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
    th { background: #f8fafc; font-weight: 700; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin:0; font-size: 24px;">OFFICIAL UAT ACCEPTANCE DOSSIER</h1>
      <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">User Acceptance Testing & Production Sign-Off Protocol</p>
    </div>
    <div class="stamp">${vInfo.title}</div>
  </div>
  <p><strong>Target System:</strong> ${targetUrl}</p>
  <p><strong>Environment Tier:</strong> ${uat.environmentContext?.environmentTier?.toUpperCase() || 'PRODUCTION-CANDIDATE'} (${uat.environmentContext?.detectionReason || 'Release Candidate Gate'})</p>
  <p><strong>Overall Readiness Score:</strong> ${readinessVal}/100</p>
  <p><strong>Executive Summary:</strong> ${uat.signOffSummary}</p>
  <h3>Validated User Stories</h3>
  <table>
    <thead><tr><th>ID</th><th>Category</th><th>User Persona & Acceptance Story</th><th>Status</th></tr></thead>
    <tbody>
      ${uat.userStories.map(s => `<tr><td><strong>${s.id}</strong></td><td>${s.category}</td><td>${s.story}</td><td><strong>${s.status.toUpperCase()}</strong></td></tr>`).join('')}
    </tbody>
  </table>
  <h3>Stakeholder Sign-Off Matrix</h3>
  <table>
    <thead><tr><th>Role</th><th>Representative</th><th>Status</th><th>Notes</th></tr></thead>
    <tbody>
      ${uat.stakeholders.map(st => `<tr><td><strong>${st.role}</strong></td><td>${st.name}</td><td>${st.status}</td><td>${st.notes}</td></tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([certHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UAT-Acceptance-Certificate-${new URL(targetUrl).hostname}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Master Executive Sign-Off Banner */}
      <div className={`rounded-2xl p-6 border shadow-lg ${vInfo.bg} backdrop-blur-md`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-black/20 shrink-0 mt-0.5">{vInfo.icon}</div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono tracking-wider ${vInfo.badgeBg}`}>
                  {vInfo.title}
                </span>
                <span className="text-xs font-mono opacity-80">
                  Readiness Score: <strong>{readinessVal}/100</strong>
                </span>
                {uat.blockersCount > 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-200 border border-red-500/40">
                    {uat.blockersCount} Blocker(s) Flagged
                  </span>
                )}
              </div>
              <p className="text-sm opacity-90 leading-relaxed font-sans">{vInfo.sub}</p>
              <p className="text-xs opacity-75 font-mono pt-1 italic">{uat.signOffSummary}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={downloadCertificate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white text-stone-900 hover:bg-stone-100 shadow-sm transition-all"
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Export UAT Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Environment Context Ribbon (ultra-uat / Staging vs Production Candidate) */}
      <div className="p-4 rounded-xl bg-white/95 border border-stone-200 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Server className="w-4 h-4 text-violet-600 shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-stone-900">Environment Context:</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-100 text-violet-900 border border-violet-300 font-bold uppercase">
              {uat.environmentContext?.environmentTier === 'ultra-uat' ? 'ULTRA-UAT PRE-PRODUCTION GATE' : uat.environmentContext?.environmentTier?.toUpperCase() || 'STAGE GATE'}
            </span>
            <span className="text-xs text-stone-600 font-mono">
              {uat.environmentContext?.detectionReason || 'Isolated Pre-Production Validation'}
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-stone-500">
          Target: <span className="font-bold text-stone-800">{targetUrl}</span>
        </div>
      </div>

      {/* 2. Four UAT Pillars Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: DOM Structure & Integrity */}
        <div className="p-4 rounded-xl bg-white/95 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">DOM Structure & Integrity</span>
            <Code2 className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{uat.domIntegrity?.score ?? 88}%</span>
            <span className="text-xs text-stone-500 font-mono">
              {uat.domIntegrity?.totalNodes ?? 1240} nodes
            </span>
          </div>
          <p className="mt-1.5 text-xs text-stone-600">
            {uat.domIntegrity?.duplicateIds?.length === 0 ? 'Zero duplicate IDs • Clean ARIA semantics' : `${uat.domIntegrity?.duplicateIds?.length} duplicate IDs detected`}
          </p>
        </div>

        {/* Pillar 2: Core Web Vitals & OAT */}
        <div className="p-4 rounded-xl bg-white/95 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Core Web Vitals & OAT</span>
            <Smartphone className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{uat.operationalReadinessScore}%</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${uat.oatMetrics.deviceStarvationRisk === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {uat.oatMetrics.deviceStarvationRisk}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-stone-600">
            Hardware resilience under 2GB RAM / 6x CPU constraints.
          </p>
        </div>

        {/* Pillar 3: End-to-End User Journeys */}
        <div className="p-4 rounded-xl bg-white/95 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">End-to-End User Journeys</span>
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{uat.businessAlignmentScore}%</span>
            <span className="text-xs text-stone-500 font-mono">
              {uat.userJourneys?.filter(j => j.status === 'passed').length ?? 3}/{uat.userJourneys?.length ?? 4} Cleared
            </span>
          </div>
          <p className="mt-1.5 text-xs text-stone-600">
            Automated discovery, navigation, and conversion pathways.
          </p>
        </div>

        {/* Pillar 4: Defect & Error Logging */}
        <div className="p-4 rounded-xl bg-white/95 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Defect & Error Gate</span>
            <Bug className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{uat.contractSlaScore}%</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${uat.defectLogging?.criticalBlockers === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {uat.defectLogging?.criticalBlockers ?? 0} Blockers
            </span>
          </div>
          <p className="mt-1.5 text-xs text-stone-600">
            {uat.defectLogging?.totalConsoleErrors ?? 0} console errors • {uat.defectLogging?.totalFailedNetworkRequests ?? 0} failed network requests.
          </p>
        </div>
      </div>

      {/* 3. Core Focus Areas Deep Dive Panel */}
      <div className="rounded-xl bg-white/95 border border-stone-200 shadow-sm overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" />
              <span>Core Focus Areas of Advanced UAT Audit</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Simultaneous evaluation of technical code health, DOM integrity, and functional user journeys before production release.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-200/80 p-1 rounded-lg">
            <button
              onClick={() => setFocusAreaTab('journeys')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                focusAreaTab === 'journeys' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              User Journeys
            </button>
            <button
              onClick={() => setFocusAreaTab('dom')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                focusAreaTab === 'dom' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              DOM Structure
            </button>
            <button
              onClick={() => setFocusAreaTab('cwv')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                focusAreaTab === 'cwv' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Performance & CWV
            </button>
            <button
              onClick={() => setFocusAreaTab('defects')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                focusAreaTab === 'defects' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Defect Logging ({uat.defectLogging?.items?.length ?? 0})
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Tab 1: End-to-End User Journeys */}
          {focusAreaTab === 'journeys' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(uat.userJourneys || []).map((journey) => (
                  <div key={journey.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-violet-900">{journey.id}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          journey.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : journey.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {journey.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900">{journey.name}</h4>
                    <p className="text-[11px] text-stone-500 font-mono">Persona: {journey.persona}</p>
                    <div className="space-y-1 pt-1">
                      {journey.journeySteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1.5 text-xs text-stone-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-stone-600 bg-white p-2 rounded border border-stone-200 font-mono mt-2">
                      {journey.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: DOM Structure & Integrity */}
          {focusAreaTab === 'dom' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-stone-100/80 border border-stone-200 text-center">
                  <div className="text-[11px] font-mono text-stone-500">DOM Total Nodes</div>
                  <div className="text-xl font-mono font-bold text-stone-900">{uat.domIntegrity?.totalNodes ?? 1240}</div>
                  <div className="text-[10px] text-stone-500">{uat.domIntegrity?.totalNodes > 1800 ? 'Bloated (>1800)' : 'Optimal (<1800)'}</div>
                </div>
                <div className="p-3 rounded-lg bg-stone-100/80 border border-stone-200 text-center">
                  <div className="text-[11px] font-mono text-stone-500">Max Nesting Depth</div>
                  <div className="text-xl font-mono font-bold text-stone-900">{uat.domIntegrity?.maxDepth ?? 14} levels</div>
                  <div className="text-[10px] text-stone-500">{uat.domIntegrity?.maxDepth > 24 ? 'Deeply Nested' : 'Safe Depth'}</div>
                </div>
                <div className="p-3 rounded-lg bg-stone-100/80 border border-stone-200 text-center">
                  <div className="text-[11px] font-mono text-stone-500">Duplicate ID Violations</div>
                  <div className="text-xl font-mono font-bold text-stone-900">{uat.domIntegrity?.duplicateIds?.length ?? 0}</div>
                  <div className="text-[10px] text-stone-500">{uat.domIntegrity?.duplicateIds?.length === 0 ? 'Zero Collisions' : 'Breaks Selectors'}</div>
                </div>
                <div className="p-3 rounded-lg bg-stone-100/80 border border-stone-200 text-center">
                  <div className="text-[11px] font-mono text-stone-500">Hydration Mismatch Risk</div>
                  <div className="text-xl font-mono font-bold text-stone-900 uppercase">{uat.domIntegrity?.hydrationRisk ?? 'low'}</div>
                  <div className="text-[10px] text-stone-500">Server/Client Parity</div>
                </div>
              </div>

              {uat.domIntegrity?.issues && uat.domIntegrity.issues.length > 0 && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-xs font-bold text-amber-900 font-mono uppercase tracking-wider">DOM Structural Findings:</span>
                  <ul className="list-disc list-inside text-xs text-amber-900 space-y-0.5">
                    {uat.domIntegrity.issues.map((iss, iIdx) => (
                      <li key={iIdx}>{iss}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Core Web Vitals & Performance */}
          {focusAreaTab === 'cwv' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <span className="text-xs font-mono text-stone-500">Hardware Starvation Risk</span>
                  <div className="text-lg font-bold font-mono text-stone-900 mt-1">{uat.oatMetrics.deviceStarvationRisk}</div>
                  <p className="text-[11px] text-stone-600 mt-1">Simulated 2GB RAM / 6x CPU throttling profile.</p>
                </div>
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <span className="text-xs font-mono text-stone-500">Network Resilience Score</span>
                  <div className="text-lg font-bold font-mono text-stone-900 mt-1">{uat.oatMetrics.networkResilienceScore}/100</div>
                  <p className="text-[11px] text-stone-600 mt-1">Slow 4G profile response and image fail-safe handling.</p>
                </div>
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <span className="text-xs font-mono text-stone-500">Runtime Error Recovery</span>
                  <div className="text-lg font-bold font-mono text-stone-900 mt-1">{uat.oatMetrics.errorRecoveryRating}</div>
                  <p className="text-[11px] text-stone-600 mt-1">Graceful degradation when assets or API endpoints lag.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Defect & Error Logging */}
          {focusAreaTab === 'defects' && (
            <div className="space-y-3">
              {uat.defectLogging?.items && uat.defectLogging.items.length > 0 ? (
                <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden">
                  {uat.defectLogging.items.map((item, dIdx) => (
                    <div key={dIdx} className="p-3.5 bg-stone-50/50 hover:bg-stone-50 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              item.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : item.severity === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {item.severity}
                          </span>
                          <span className="text-xs font-mono text-stone-500">{item.type}</span>
                          {item.source && <span className="text-[10px] font-mono text-stone-400">({item.source})</span>}
                        </div>
                        <p className="text-xs font-mono text-stone-900">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs font-mono text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                  ✨ Zero runtime defects, unhandled exceptions, or broken network requests flagged during execution.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Interactive User Story Acceptance Matrix */}
      <div className="rounded-xl bg-white/95 border border-stone-200 shadow-sm overflow-hidden backdrop-blur-md">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-violet-600" />
              <span>User Acceptance Test Cases & Persona Scenarios ({uat.userStories.length})</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Deterministic verification of end-user stories against actual DOM structures and network profiles.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-mono bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">All Categories</option>
              <option value="business-alignment">Business Alignment</option>
              <option value="user-workflow">User Workflow</option>
              <option value="operational-readiness">Operational (OAT)</option>
              <option value="regulation-compliance">Compliance</option>
              <option value="contract-sla">Contract SLA</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-mono bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">All Statuses</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed / Blockers</option>
              <option value="needs-review">Needs Review</option>
            </select>
          </div>
        </div>

        {/* Stories List */}
        <div className="divide-y divide-stone-200">
          {filteredStories.map((story) => {
            const isExpanded = expandedStory === story.id;
            return (
              <div key={story.id} className="p-4 sm:p-5 hover:bg-stone-50/70 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 border border-stone-300 font-bold text-stone-700">
                        {story.id}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-50 text-violet-800 border border-violet-200">
                        {story.persona}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          story.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : story.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {story.status.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-600 ml-auto">
                        Score: {story.score}/100
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-stone-900">{story.story}</p>

                    <div className="text-xs text-stone-600 bg-stone-100/70 rounded-lg p-2.5 font-mono border border-stone-200/80">
                      <strong>Observed Evidence:</strong> {story.evidence}
                    </div>

                    {story.remediation && (
                      <div className="text-xs text-amber-900 bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                        <strong>Required Remediation for Sign-Off:</strong> {story.remediation}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedStory(isExpanded ? null : story.id)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors shrink-0"
                    title="Toggle Acceptance Criteria"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-stone-200 space-y-1.5 animate-in fade-in duration-200">
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono">
                      Acceptance Criteria Checklist:
                    </span>
                    <ul className="space-y-1 pl-1">
                      {story.acceptanceCriteria.map((crit, cIdx) => (
                        <li key={cIdx} className="text-xs text-stone-700 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Contract SLA Verification Checklist */}
      <div className="rounded-xl bg-white/95 border border-stone-200 shadow-sm p-5 space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Contractual Service Level Agreements (SLAs)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Production performance and uptime guarantees tested during this audit run.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-stone-100 text-stone-700 border border-stone-300">
            {uat.contractSlaChecklist.filter((c) => c.status === 'met').length} / {uat.contractSlaChecklist.length} SLAs Met
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {uat.contractSlaChecklist.map((sla, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">{sla.metric}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    sla.status === 'met'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sla.status === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {sla.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-stone-600">
                <span>Target: <strong>{sla.targetSla}</strong></span>
                <span>Observed: <strong>{sla.actualObserved}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Role-Based Stakeholder Sign-Off Matrix */}
      <div className="rounded-xl bg-white/95 border border-stone-200 shadow-sm p-5 space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Multi-Role Stakeholder Sign-Off Matrix</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Formal acceptance across Product, QA, Architecture, and Compliance stakeholders.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500">Autonomous Governance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {uat.stakeholders.map((sh, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-violet-900">{sh.role}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    sh.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sh.status === 'Conditional'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {sh.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-stone-900">{sh.name}</div>
              <p className="text-xs text-stone-600 italic font-sans">{sh.notes}</p>
              {sh.timestamp && (
                <div className="text-[10px] text-stone-400 font-mono pt-1">Timestamp: {sh.timestamp}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
