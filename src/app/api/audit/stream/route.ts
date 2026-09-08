import { NextRequest } from 'next/server';
import { runSpiderEngineAudit } from '@/lib/audit/spiderEngine';
import { DEMO_PRESETS } from '@/lib/audit/presets';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, maxPages, concurrency, throttlingProfile } = body;

    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Target URL is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let trimmedUrl = url.trim();
    let effectiveMaxPages = typeof maxPages === 'number' && !isNaN(maxPages) ? maxPages : undefined;

    // Auto-parse input patterns like "https://amazon.com 5000"
    if (trimmedUrl.includes(' ')) {
      const parts = trimmedUrl.split(/\s+/);
      trimmedUrl = parts[0];
      const parsedNum = parseInt(parts[1], 10);
      if (!isNaN(parsedNum) && !effectiveMaxPages) {
        effectiveMaxPages = parsedNum;
      }
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          try {
            const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch (e) {
            // Client closed connection
          }
        };

        // If target matches a preset exactly, provide an accelerated realistic stream
        if (DEMO_PRESETS[trimmedUrl] || trimmedUrl === 'unova-benchmark') {
          const presetReport = DEMO_PRESETS[trimmedUrl] || DEMO_PRESETS['unova-benchmark'];
          sendEvent('log', { message: `🌌 Initializing Spider Engine starting at: ${trimmedUrl}` });
          await new Promise((r) => setTimeout(r, 400));
          sendEvent('log', { message: `🔍 Scanning ${trimmedUrl} for internal routes...` });
          await new Promise((r) => setTimeout(r, 600));
          sendEvent('log', { message: `🤖 Adaptive Mode Active: Standard Architecture Detected. Crawl budget: 13 pages.` });
          await new Promise((r) => setTimeout(r, 500));
          sendEvent('log', { message: `📱 Initiating Budget Mobile (2GB RAM / Slow 4G) Simulation on Root Domain...` });
          await new Promise((r) => setTimeout(r, 700));
          sendEvent('mobile', { loadTime: '10.22', fcp: '3120', status: 'Critical (Too Heavy)' });
          sendEvent('log', { message: `📱 Mobile Profiling Complete | Load: 10.22s | FCP: 3120ms | Status: Critical (Too Heavy)\n` });
          await new Promise((r) => setTimeout(r, 600));
          sendEvent('log', { message: `⚙️  Spinning up 4 parallel worker(s) | budget: 13 pages\n` });

          if (presetReport.spiderArchitecture) {
            const pages = presetReport.spiderArchitecture.pages;
            const batchSize = 4;
            for (let i = 0; i < pages.length; i += batchSize) {
              const batch = pages.slice(i, i + batchSize);
              sendEvent('log', { message: `--------------------------------------------------` });
              sendEvent('log', { message: `🚀 Batch ${batch.length} page(s) [${Math.min(i + batchSize, pages.length)}/13] | queue: 48` });
              sendEvent('batch', {
                batchSize: batch.length,
                dispatched: Math.min(i + batchSize, pages.length),
                total: 13,
                queueLength: 48,
              });
              await new Promise((r) => setTimeout(r, 500));

              for (const p of batch) {
                sendEvent('page', p);
                sendEvent('log', { message: `   ✅ ${p.url} | health ${p.healthScore || 80} | sec 66 | ${(p.loadTimeMs / 1000).toFixed(2)}s` });
              }
              sendEvent('log', { message: `   🕸️ +${Math.max(2, 8 - i)} new internal link(s) (queue: 48)` });
              await new Promise((r) => setTimeout(r, 400));
            }
          }

          sendEvent('log', { message: `✨ Spider Engine Crawl Complete! Overall Score: ${presetReport.overallScore}/100.` });
          sendEvent('complete', { report: presetReport });
          controller.close();
          return;
        }

        // Real live spider crawl execution via Playwright
        try {
          const report = await runSpiderEngineAudit(
            trimmedUrl,
            { maxPages: effectiveMaxPages, concurrency, throttlingProfile },
            (milestone) => {
              sendEvent(milestone.type, milestone.data || { message: milestone.message });
            }
          );
          sendEvent('complete', { report });
          controller.close();
        } catch (err: any) {
          sendEvent('error', { error: err.message || 'Spider crawl failed' });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Stream initiation failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
