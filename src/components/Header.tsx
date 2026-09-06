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
    <header className="sticky top-0 z-50 w-full border-b border-gengar-bright-violet/15 bg-gengar-ink-black/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Mascot with High-Contrast Badge Container */}
        <a href="/" className="flex items-center gap-3.5 group focus:outline-none select-none">
          <UnovaMascot size={38} isAuditing={isAuditing} withContainerBadge={true} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-parchment-cream group-hover:text-white transition-colors">
                Unova <span className="text-gengar-bright-violet font-normal">//</span> UAT Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gengar-deep-purple/70 text-aura-light-lavender border border-gengar-bright-violet/30 shadow-sm">
                uat.unova.co.in
              </span>
            </div>
            <span className="text-[10px] text-smoke-taupe hidden sm:block tracking-wide font-sans">
              Autonomous Diagnostic Suite
            </span>
          </div>
        </a>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {currentReport && onExportSarif && (
            <button
              onClick={onExportSarif}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-gengar-deep-purple/40 hover:bg-gengar-deep-purple/80 text-aura-light-lavender border border-gengar-bright-violet/20 transition-all hover:border-aura-light-lavender/50"
              title="Export SARIF 2.1.0 report"
            >
              <Download className="w-3.5 h-3.5 text-eye-glow-orange" />
              <span>Export SARIF</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gengar-deep-purple/30 border border-gengar-bright-violet/20 text-aura-light-lavender text-[11px] font-mono">
            <Activity className="w-3 h-3 text-eye-glow-orange animate-pulse" />
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
