import * as cheerio from 'cheerio';
import { SecurityFinding, Severity } from './types';

export function analyzeSecurity(
  headers: Record<string, string>,
  targetUrl: string,
  html: string
): {
  score: number;
  findings: SecurityFinding[];
  headersInspected: Record<string, string>;
  tlsStatus: {
    isHttps: boolean;
    hstsPreloaded: boolean;
    mixedContentDetected: boolean;
  };
} {
  const findings: SecurityFinding[] = [];
  const normalizedHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers || {})) {
    normalizedHeaders[k.toLowerCase()] = v;
  }

  const isHttps = targetUrl.startsWith('https://');

  // 1. Content-Security-Policy (CSP)
  const csp = normalizedHeaders['content-security-policy'];
  if (!csp) {
    findings.push({
      id: 'missing-csp',
      title: 'Content-Security-Policy (CSP) Header Missing',
      severity: 'high',
      category: 'A05:2021 Security Misconfiguration',
      cvss: 6.5,
      evidence: 'No Content-Security-Policy HTTP response header found on the page.',
      remediation: "Deploy a Content-Security-Policy with default-src 'self' and strict script controls to mitigate Cross-Site Scripting (XSS) and data injection.",
      remediationCode: {
        nextConfig: `// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'nonce-...'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
          }
        ]
      }
    ];
  }
};`,
        nginx: `add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';" always;`,
        apache: `Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';"`
      }
    });
  } else {
    const weaknesses: string[] = [];
    if (/unsafe-inline/i.test(csp)) weaknesses.push("'unsafe-inline'");
    if (/unsafe-eval/i.test(csp)) weaknesses.push("'unsafe-eval'");
    if (/(^|\s)(default-src|script-src)[^;]*\*/i.test(csp)) weaknesses.push('wildcard domain (*)');

    if (weaknesses.length > 0) {
      findings.push({
        id: 'weak-csp',
        title: 'Content-Security-Policy Weaknesses Detected',
        severity: 'medium',
        category: 'A05:2021 Security Misconfiguration',
        cvss: 4.8,
        evidence: `CSP directive contains high-risk exceptions: ${weaknesses.join(', ')}.`,
        remediation: 'Eliminate unsafe-inline and unsafe-eval by migrating inline event handlers to external modules and utilizing cryptographic nonces (CSP Level 3).',
        remediationCode: {
          nginx: `add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'strict-dynamic'; object-src 'none';" always;`
        }
      });
    }
  }

  // 2. Strict-Transport-Security (HSTS)
  const hsts = normalizedHeaders['strict-transport-security'];
  let hstsPreloaded = false;
  if (isHttps) {
    if (!hsts) {
      findings.push({
        id: 'missing-hsts',
        title: 'HTTP Strict Transport Security (HSTS) Missing',
        severity: 'high',
        category: 'A05:2021 Security Misconfiguration',
        cvss: 5.9,
        evidence: 'HTTPS connection established without a Strict-Transport-Security response header.',
        remediation: 'Configure HSTS with at least 1 year (31536000 seconds) max-age, includeSubDomains, and preload.',
        remediationCode: {
          nextConfig: `// next.config.js
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
}`,
          nginx: `add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;`,
          apache: `Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"`
        }
      });
    } else {
      hstsPreloaded = /preload/i.test(hsts);
      if (!/includeSubDomains/i.test(hsts)) {
        findings.push({
          id: 'hsts-missing-subdomains',
          title: 'HSTS Missing includeSubDomains Directive',
          severity: 'low',
          category: 'A05:2021 Security Misconfiguration',
          cvss: 3.5,
          evidence: `Current header: "${hsts}". Subdomains are unprotected against SSL stripping.`,
          remediation: 'Append "; includeSubDomains" to your Strict-Transport-Security header.',
        });
      }
    }
  }

  // 3. X-Content-Type-Options
  const xcto = normalizedHeaders['x-content-type-options'];
  if (!xcto || xcto.toLowerCase() !== 'nosniff') {
    findings.push({
      id: 'missing-nosniff',
      title: 'MIME-Type Sniffing Protection Missing (X-Content-Type-Options)',
      severity: 'low',
      category: 'A05:2021 Security Misconfiguration',
      cvss: 3.4,
      evidence: xcto ? `Value is "${xcto}", expected "nosniff"` : 'Header is absent.',
      remediation: 'Set X-Content-Type-Options to nosniff to prevent browsers from MIME-sniffing away from declared content-type.',
      remediationCode: {
        nextConfig: `{ key: 'X-Content-Type-Options', value: 'nosniff' }`,
        nginx: `add_header X-Content-Type-Options "nosniff" always;`,
        apache: `Header always set X-Content-Type-Options "nosniff"`
      }
    });
  }

  // 4. Clickjacking Protection (X-Frame-Options / frame-ancestors)
  const xfo = normalizedHeaders['x-frame-options'];
  const hasFrameAncestors = csp && /frame-ancestors/i.test(csp);
  if (!xfo && !hasFrameAncestors) {
    findings.push({
      id: 'clickjacking-vulnerability',
      title: 'Clickjacking Protection Missing',
      severity: 'medium',
      category: 'A05:2021 Security Misconfiguration',
      cvss: 5.4,
      evidence: 'Neither X-Frame-Options nor Content-Security-Policy frame-ancestors directive is defined.',
      remediation: "Add X-Frame-Options: DENY (or SAMEORIGIN) and CSP: frame-ancestors 'none' to block unauthorized framing inside iframes.",
      remediationCode: {
        nextConfig: `{ key: 'X-Frame-Options', value: 'DENY' }`,
        nginx: `add_header X-Frame-Options "DENY" always;\nadd_header Content-Security-Policy "frame-ancestors 'none';" always;`,
        apache: `Header always set X-Frame-Options "DENY"`
      }
    });
  }

  // 5. Referrer-Policy
  const refPol = normalizedHeaders['referrer-policy'];
  if (!refPol) {
    findings.push({
      id: 'missing-referrer-policy',
      title: 'Referrer-Policy Header Missing',
      severity: 'low',
      category: 'A05:2021 Security Misconfiguration',
      cvss: 2.8,
      evidence: 'No Referrer-Policy header specified; sensitive URL paths or tokens may leak to third parties.',
      remediation: 'Define Referrer-Policy: strict-origin-when-cross-origin.',
      remediationCode: {
        nextConfig: `{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }`,
        nginx: `add_header Referrer-Policy "strict-origin-when-cross-origin" always;`
      }
    });
  }

  // 6. Permissions-Policy
  const permPol = normalizedHeaders['permissions-policy'] || normalizedHeaders['feature-policy'];
  if (!permPol) {
    findings.push({
      id: 'missing-permissions-policy',
      title: 'Permissions-Policy Header Missing',
      severity: 'info',
      category: 'A05:2021 Security Misconfiguration',
      cvss: null,
      evidence: 'No Permissions-Policy header found to explicitly control browser hardware capabilities (camera, microphone, geolocation).',
      remediation: 'Define Permissions-Policy to disable unnecessary browser features: camera=(), microphone=(), geolocation=().',
      remediationCode: {
        nextConfig: `{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }`,
        nginx: `add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;`
      }
    });
  }

  // 7. Technology Disclosure
  const serverHeader = normalizedHeaders['server'];
  const xPoweredBy = normalizedHeaders['x-powered-by'];
  if (serverHeader && /[0-9]+\.[0-9]+/i.test(serverHeader)) {
    findings.push({
      id: 'server-version-disclosure',
      title: 'Server Version Disclosure',
      severity: 'low',
      category: 'A05:2021 Security Misconfiguration',
      cvss: 2.5,
      evidence: `Server header exposes explicit version: "${serverHeader}".`,
      remediation: 'Strip specific version tokens from the Server header in your reverse proxy config (e.g., server_tokens off in Nginx).',
    });
  }
  if (xPoweredBy) {
    findings.push({
      id: 'x-powered-by-leak',
      title: 'Framework Information Leakage (X-Powered-By)',
      severity: 'low',
      category: 'A05:2021 Security Misconfiguration',
      cvss: 2.1,
      evidence: `X-Powered-By header is visible: "${xPoweredBy}".`,
      remediation: 'Disable X-Powered-By in framework configuration (e.g., poweredByHeader: false in Next.js).',
    });
  }

  // 8. Mixed Content Detection (if HTTPS)
  let mixedContentDetected = false;
  if (isHttps && html) {
    const $ = cheerio.load(html);
    const mixedResources: string[] = [];
    $('script[src^="http://"], link[href^="http://"], img[src^="http://"], iframe[src^="http://"]').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('href') || '';
      mixedResources.push(src);
    });

    if (mixedResources.length > 0) {
      mixedContentDetected = true;
      findings.push({
        id: 'mixed-content-detected',
        title: 'Active / Passive Mixed Content Insecurity',
        severity: 'high',
        category: 'A02:2021 Cryptographic Failures',
        cvss: 6.8,
        evidence: `Found ${mixedResources.length} unencrypted HTTP assets referenced on an HTTPS page (e.g. ${mixedResources[0]}).`,
        remediation: 'Upgrade all subresource URLs to HTTPS or use Content-Security-Policy: upgrade-insecure-requests.',
      });
    }
  }

  // 9. Calculate Security Posture Score
  let score = 100;
  const weights: Record<Severity, number> = {
    critical: 35,
    high: 20,
    medium: 10,
    low: 4,
    info: 0,
  };

  for (const f of findings) {
    score -= weights[f.severity] || 0;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    findings,
    headersInspected: normalizedHeaders,
    tlsStatus: {
      isHttps,
      hstsPreloaded,
      mixedContentDetected,
    },
  };
}
