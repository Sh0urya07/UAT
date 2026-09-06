import { AuditReport, SecurityFinding } from './types';

function cvssToSarifLevel(severity: string): 'error' | 'warning' | 'note' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
    case 'info':
    default:
      return 'note';
  }
}

export function generateSarifReport(report: AuditReport): any {
  const rulesMap = new Map<string, any>();
  const results: any[] = [];

  // 1. Process Security Findings
  report.security.findings.forEach(finding => {
    if (!rulesMap.has(finding.id)) {
      rulesMap.set(finding.id, {
        id: finding.id,
        name: finding.title.replace(/[^a-zA-Z0-9]/g, ''),
        shortDescription: { text: finding.title },
        fullDescription: { text: finding.evidence },
        help: {
          text: `${finding.remediation}\n\nCategory: ${finding.category}\nCVSS Base Score: ${finding.cvss ?? 'N/A'}`
        },
        properties: {
          severity: finding.severity,
          category: finding.category,
          cvss: finding.cvss
        }
      });
    }

    results.push({
      ruleId: finding.id,
      level: cvssToSarifLevel(finding.severity),
      message: { text: `${finding.title}: ${finding.evidence}` },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: report.targetUrl },
            region: { startLine: 1 }
          }
        }
      ]
    });
  });

  // 2. Process Hydration Bugs
  report.deepBugs.hydrationMismatches.forEach(bug => {
    const ruleId = `HYDRATION-${bug.errorType}`;
    if (!rulesMap.has(ruleId)) {
      rulesMap.set(ruleId, {
        id: ruleId,
        name: 'ClientServerHydrationMismatch',
        shortDescription: { text: 'React Client/Server Hydration Mismatch' },
        fullDescription: { text: bug.description },
        help: { text: bug.suggestedFix },
        properties: { severity: 'high', category: 'Runtime Reliability' }
      });
    }

    results.push({
      ruleId,
      level: 'error',
      message: { text: `${bug.description} at element: ${bug.element}` },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: report.targetUrl }
          }
        }
      ]
    });
  });

  // 3. Process Non-Crawlable and Generic Anchor Violations
  if (report.linkAudit.genericAnchorCount > 0) {
    const ruleId = 'SEO-GENERIC-ANCHOR';
    if (!rulesMap.has(ruleId)) {
      rulesMap.set(ruleId, {
        id: ruleId,
        name: 'GenericAnchorTextViolation',
        shortDescription: { text: 'Google Search Essentials - Generic Anchor Text' },
        fullDescription: { text: 'Generic anchor text ("click here", "read more") prevents Googlebot from understanding link context.' },
        help: { text: 'Replace generic anchor text with descriptive keyword phrases.' },
        properties: { severity: 'medium', category: 'SEO & Crawlability' }
      });
    }

    results.push({
      ruleId,
      level: 'warning',
      message: { text: `Found ${report.linkAudit.genericAnchorCount} generic anchor text occurrences.` },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: report.targetUrl }
          }
        }
      ]
    });
  }

  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'Unova UAT Engine',
            version: '2.0.0',
            informationUri: 'https://uat.unova.co.in',
            rules: Array.from(rulesMap.values())
          }
        },
        invocations: [
          {
            executionSuccessful: true,
            endTimeUtc: new Date().toISOString()
          }
        ],
        results
      }
    ]
  };
}
