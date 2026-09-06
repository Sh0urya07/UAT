import { NextRequest, NextResponse } from 'next/server';
import { generateSarifReport } from '@/lib/audit/sarif';
import { AuditReport } from '@/lib/audit/types';

export async function POST(req: NextRequest) {
  try {
    const report = (await req.json()) as AuditReport;
    if (!report || !report.targetUrl) {
      return NextResponse.json({ error: 'Valid audit report is required.' }, { status: 400 });
    }

    const sarif = generateSarifReport(report);
    return new NextResponse(JSON.stringify(sarif, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="unova-uat-${Date.now()}.sarif"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
