import { NextRequest, NextResponse } from 'next/server';
import { runCompleteAudit } from '@/lib/audit/runner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, throttlingProfile, crawlScope, maxPages } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Target URL is required.' },
        { status: 400 }
      );
    }

    const report = await runCompleteAudit(url, {
      throttlingProfile,
      crawlScope,
      maxPages: typeof maxPages === 'number' ? maxPages : 20,
    });
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[API /api/audit] Execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Audit execution failed.' },
      { status: 500 }
    );
  }
}
