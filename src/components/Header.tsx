'use client';

import React from 'react';
import { UnovaMascot } from './UnovaMascot';
import { Download, Activity } from 'lucide-react';
import { AuditReport } from '@/lib/audit/types';

interface HeaderProps {
  currentReport?: AuditReport | null;
  onExportSarif?: () => void;
  onSelectPreset?: (key: string) => void;
  isAuditing?: boolean;
}

export function Header({ currentReport, onExportSarif, isAuditing = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Mascot with High-Contrast Badge Container */}
        <a href="/" className="flex items-center gap-3.5 group focus:outline-none select-none">
          <UnovaMascot size={38} isAuditing={isAuditing} withContainerBadge={true} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
                Unova <span className="text-gengar-bright-violet font-normal">//</span> Spider Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300 shadow-sm">
                spider.unova.co.in
              </span>
            </div>
            <span className="text-[10px] text-stone-500 hidden sm:block tracking-wide font-sans">
              Cognitive Frontend & Multi-Page Architecture Suite
            </span>
          </div>
        </a>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {currentReport && onExportSarif && (
            <button
              onClick={onExportSarif}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-all shadow-sm"
              title="Export SARIF 2.1.0 report"
            >
              <Download className="w-3.5 h-3.5 text-eye-glow-orange" />
              <span>Export SARIF</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono shadow-sm">
            <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline font-medium">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
