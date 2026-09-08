'use client';

import React from 'react';
import { FrontendDiagnosticsReport } from '@/lib/audit/types';
import { Palette, HeartPulse, Eye, Sparkles, CheckCircle2, XCircle, Info, Compass } from 'lucide-react';

interface ColorPsychologyPanelProps {
  diagnostics?: FrontendDiagnosticsReport;
}

export function ColorPsychologyPanel({ diagnostics }: ColorPsychologyPanelProps) {
  if (!diagnostics) {
    return (
      <div className="p-8 rounded-xl bg-white/90 border border-stone-200 text-center space-y-3 backdrop-blur-md">
        <Palette className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="text-base font-bold text-stone-800">Color Psychology Data Pending</h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto">
          Run an audit to extract the 60-30-10 palette distribution, Bourne (2026) autonomic valences, and APCA contrast scores.
        </p>
      </div>
    );
  }

  const { colorPsychology } = diagnostics;
  const { palette, apcaContrast, saliencyVsComfort, kobayashiMood } = colorPsychology;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Color Score */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Color Harmony</span>
            <Palette className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900">{colorPsychology.score}/100</span>
            <span className="text-xs text-stone-500 font-mono">Cognitive Index</span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            Assessed against 60-30-10 balance, emotional resonance, and perceptual comfort.
          </div>
        </div>

        {/* Kobayashi Emotional Scale Mood */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Kobayashi Mood</span>
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-stone-900">{kobayashiMood}</span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            IRI Adjective Image Scale classification based on dominant tonal coordinates.
          </div>
        </div>

        {/* Saliency vs Comfort Congruence */}
        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">Saliency vs Comfort</span>
            <Eye className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold font-mono text-stone-900">{saliencyVsComfort.congruenceRating}</span>
          </div>
          <div className="mt-2 text-xs text-stone-600">
            {saliencyVsComfort.insight}
          </div>
        </div>
      </div>

      {/* 60-30-10 Palette Proportions & Bourne Autonomic Effects */}
      <div className="rounded-xl bg-white/90 border border-stone-200 shadow-sm p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-700" />
            <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              60-30-10 Color Architecture & Autonomic Impact (Bourne 2026 / Elliot 2015)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-500">Perceptual Ergonomics</span>
        </div>

        {/* Visual Stacked Bar */}
        <div className="w-full h-8 rounded-lg overflow-hidden flex shadow-inner border border-stone-300">
          {palette.map((node, i) => (
            <div
              key={i}
              style={{
                width: `${node.percentage}%`,
                backgroundColor: node.hex,
              }}
              title={`${node.role}: ${node.hex} (${node.percentage}%)`}
              className="h-full relative group transition-all duration-300 flex items-center justify-center"
            >
              <span className="text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {node.hex} ({node.percentage}%)
              </span>
            </div>
          ))}
        </div>

        {/* Node Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {palette.map((node, i) => (
            <div key={i} className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-stone-300 shadow-xs"
                    style={{ backgroundColor: node.hex }}
                  />
                  <span className="text-xs font-mono font-bold text-stone-900">{node.hex}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-bold uppercase">
                  {node.role.replace('-', ' ')} ({node.percentage}%)
                </span>
              </div>

              <div className="text-xs text-stone-700 space-y-1">
                <div>
                  <span className="font-semibold text-stone-800">Psychological Resonance:</span>{' '}
                  <span className="text-stone-600">{node.emotion}</span>
                </div>
                <div>
                  <span className="font-semibold text-stone-800">Autonomic Effect:</span>{' '}
                  <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    node.autonomicEffect === 'Parasympathetic Restorative'
                      ? 'bg-emerald-100 text-emerald-800'
                      : node.autonomicEffect === 'Sympathetic Arousal'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-stone-200 text-stone-800'
                  }`}>
                    {node.autonomicEffect}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 italic">
                  Archetype: {node.archetype}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* APCA Contrast Compliance Table */}
      <div className="rounded-xl bg-white/90 border border-stone-200 shadow-sm overflow-hidden backdrop-blur-md">
        <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              APCA (Advanced Perceptual Contrast Algorithm) & WCAG 2.2 Compliance
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            Score: {apcaContrast.score}/100 • {apcaContrast.passingCount} Passing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-100/70 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="px-4 py-2.5">Element Sample</th>
                <th className="px-3 py-2.5">Foreground</th>
                <th className="px-3 py-2.5">Background</th>
                <th className="px-3 py-2.5">WCAG Ratio</th>
                <th className="px-3 py-2.5">APCA Lightness (Lc)</th>
                <th className="px-3 py-2.5">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {apcaContrast.samples.map((sample, idx) => (
                <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div
                      className="px-3 py-1.5 rounded text-xs font-medium inline-block border border-stone-300/60 shadow-xs"
                      style={{ color: sample.fg, backgroundColor: sample.bg }}
                    >
                      {sample.textSample}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full border border-stone-300" style={{ backgroundColor: sample.fg }} />
                      <span>{sample.fg}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full border border-stone-300" style={{ backgroundColor: sample.bg }} />
                      <span>{sample.bg}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-bold">
                    <span className={sample.ratio >= 4.5 ? 'text-emerald-700' : 'text-red-600'}>
                      {sample.ratio}:1
                    </span>
                  </td>
                  <td className="px-3 py-3 font-bold text-stone-900">
                    {sample.apcaLc} Lc
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sample.status === 'AAA'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : sample.status === 'AA'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {sample.status}
                    </span>
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
