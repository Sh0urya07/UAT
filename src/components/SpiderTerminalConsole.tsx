'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal, Network, Smartphone, CheckCircle2, Loader2, Maximize2, Sparkles, ExternalLink } from 'lucide-react';
import { SpiderPageNode } from '@/lib/audit/types';

export interface TerminalLogEntry {
  id: string;
  message: string;
  timestamp: string;
}

interface SpiderTerminalConsoleProps {
  logs: TerminalLogEntry[];
  currentBatch?: {
    batchSize: number;
    dispatched: number;
    total: number;
    queueLength: number;
  };
  mobileProfile?: {
    loadTime: string;
    fcp: string;
    status: string;
  };
  recentPages: SpiderPageNode[];
  onSelectSnapshot?: (page: SpiderPageNode) => void;
  isAuditing: boolean;
}

export function SpiderTerminalConsole({
  logs,
  currentBatch,
  mobileProfile,
  recentPages,
  onSelectSnapshot,
  isAuditing,
}: SpiderTerminalConsoleProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const progressPercent = currentBatch
    ? Math.min(100, Math.round((currentBatch.dispatched / currentBatch.total) * 100))
    : isAuditing
    ? 25
    : 100;

  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl bg-stone-900 border border-stone-800 shadow-xl overflow-hidden font-mono text-xs text-stone-300 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      {/* Terminal Title Bar */}
      <div className="px-4 py-2.5 bg-stone-950 border-b border-stone-800/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-[11px] text-stone-400 font-semibold ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-violet-400" />
            <span>Spider Engine // Live Execution Telemetry</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-stone-400">
          {isAuditing && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
              <span>CRAWLING (BFS POOL)</span>
            </span>
          )}
          {currentBatch && (
            <span className="text-stone-400">
              Queue: <strong className="text-stone-200">{currentBatch.queueLength}</strong> | Dispatched:{' '}
              <strong className="text-stone-200">
                {currentBatch.dispatched}/{currentBatch.total}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar Ribbon */}
      <div className="w-full bg-stone-950/60 px-4 py-2 border-b border-stone-800 flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-stone-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] text-stone-400 font-bold">{progressPercent}%</span>
      </div>

      {/* Main Terminal Body */}
      <div className="p-4 h-72 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-stone-700 bg-stone-900/95 font-mono">
        {logs.map((log) => {
          let lineClass = 'text-stone-300';
          if (log.message.includes('📱')) lineClass = 'text-orange-300 font-medium';
          else if (log.message.includes('🚀')) lineClass = 'text-violet-300 font-semibold';
          else if (log.message.includes('✅')) lineClass = 'text-emerald-300';
          else if (log.message.includes('🕸️')) lineClass = 'text-cyan-300';
          else if (log.message.includes('⚠️')) lineClass = 'text-amber-300';
          else if (log.message.includes('❌')) lineClass = 'text-red-400 font-bold';
          else if (log.message.includes('✨')) lineClass = 'text-amber-200 font-bold';

          return (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-[10px] text-stone-500 select-none shrink-0">{log.timestamp}</span>
              <span className={`break-all ${lineClass}`}>{log.message}</span>
            </div>
          );
        })}
        {isAuditing && (
          <div className="flex items-center gap-2 pt-1 text-stone-400">
            <span className="w-1.5 h-3.5 bg-violet-400 animate-pulse inline-block" />
            <span className="text-stone-400 italic">processing batch workers...</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Live Route Snapshot Strip (when pages have screenshots) */}
      {recentPages.length > 0 && (
        <div className="px-4 py-3 bg-stone-950 border-t border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Live Visual Snapshots ({recentPages.length} routes settled)</span>
            </span>
            <span className="text-[10px] text-stone-400">Click to enlarge</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {recentPages.map((p, idx) => (
              <div
                key={idx}
                onClick={() => onSelectSnapshot && onSelectSnapshot(p)}
                className="group relative shrink-0 w-32 rounded-lg border border-stone-700/80 bg-stone-900 overflow-hidden cursor-pointer hover:border-violet-400 hover:ring-2 hover:ring-violet-400/20 transition-all"
              >
                {p.screenshot ? (
                  <div className="w-full h-20 bg-stone-800 overflow-hidden">
                    <img
                      src={p.screenshot}
                      alt={p.path}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ) : (
                  <div className="w-full h-20 bg-stone-800/80 flex items-center justify-center text-[10px] text-stone-400">
                    No preview
                  </div>
                )}
                <div className="p-1.5 bg-stone-950/90 text-[10px] truncate flex items-center justify-between">
                  <span className="font-bold text-stone-300 truncate">{p.path}</span>
                  <span
                    className={`text-[9px] px-1 rounded font-bold ${
                      p.status === 200 ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
