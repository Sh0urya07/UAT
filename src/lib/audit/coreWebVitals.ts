import * as cheerio from 'cheerio';
import { CoreWebVitalsMetric, GoogleSearchEssentials, MetricRating } from './types';

function calculateRating(value: number, goodLimit: number, poorLimit: number): MetricRating {
  if (value <= goodLimit) return 'good';
  if (value <= poorLimit) return 'needs-improvement';
  return 'poor';
}

export function analyzeCoreWebVitals(
  html: string,
  ttfbMs: number,
  totalLoadTimeMs: number
): {
  lcp: CoreWebVitalsMetric;
  inp: CoreWebVitalsMetric;
  cls: CoreWebVitalsMetric;
  fcp: CoreWebVitalsMetric;
  ttfb: CoreWebVitalsMetric;
} {
  const $ = cheerio.load(html);

  // 1. TTFB Calculation
  const ttfbSec = Number((ttfbMs / 1000).toFixed(2));
  const ttfbRating = calculateRating(ttfbMs, 800, 1800);
  const ttfbMetric: CoreWebVitalsMetric = {
    value: ttfbSec,
    unit: 's',
    rating: ttfbRating,
    threshold: { good: 0.8, poor: 1.8 },
    breakdown: {
      dnsLookupMs: Math.round(ttfbMs * 0.15),
      tcpHandshakeMs: Math.round(ttfbMs * 0.25),
      sslNegotiationMs: Math.round(ttfbMs * 0.3),
      serverExecutionMs: Math.round(ttfbMs * 0.3),
    },
    details: ttfbRating === 'good'
      ? 'Fast server response time ensures browser can immediately begin receiving and parsing the document.'
      : 'High server latency delays document rendering and initial DOM construction.',
  };

  // 2. FCP Calculation (First Contentful Paint)
  // Dependent on TTFB + render-blocking stylesheets + head scripts
  const renderBlockingStyles = $('head link[rel="stylesheet"]:not([media="print"])').length;
  const renderBlockingScripts = $('head script:not([async]):not([defer]):not([type="module"])').length;
  const fcpEstMs = Math.round(ttfbMs + 200 + renderBlockingStyles * 90 + renderBlockingScripts * 140);
  const fcpSec = Number((fcpEstMs / 1000).toFixed(2));
  const fcpMetric: CoreWebVitalsMetric = {
    value: fcpSec,
    unit: 's',
    rating: calculateRating(fcpSec, 1.8, 3.0),
    threshold: { good: 1.8, poor: 3.0 },
    breakdown: {
      renderBlockingStyles,
      renderBlockingScripts,
      fontParsingDelayMs: Math.round(fcpEstMs * 0.15),
    },
    details: `Estimated FCP based on ${renderBlockingStyles} render-blocking stylesheets and ${renderBlockingScripts} synchronous scripts.`,
  };

  // 3. LCP Calculation (Largest Contentful Paint)
  // Scan for LCP candidate: hero image, large banner, first H1, or video poster
  let lcpCandidate = '<h1> tag in primary viewport';
  let candidateSizeEst = 0;
  const heroImg = $('img').first();
  if (heroImg.length > 0) {
    const src = heroImg.attr('src') || '';
    lcpCandidate = `Hero Image: <img src="${src.slice(0, 45)}${src.length > 45 ? '...' : ''}">`;
    candidateSizeEst = 350; // estimated KB
  } else if ($('h1').length > 0) {
    lcpCandidate = `Header Element: <h1> "${$('h1').first().text().trim().slice(0, 40)}"`;
  }

  const scriptsCount = $('script').length;
  const resourceLoadDelayMs = Math.max(120, Math.round(ttfbMs * 0.4));
  const resourceLoadTimeMs = Math.round(candidateSizeEst > 0 ? 400 + candidateSizeEst * 1.5 : 150);
  const elementRenderDelayMs = Math.round(scriptsCount * 18 + 100);
  const lcpEstMs = ttfbMs + resourceLoadDelayMs + resourceLoadTimeMs + elementRenderDelayMs;
  const lcpSec = Number((lcpEstMs / 1000).toFixed(2));
  const lcpRating = calculateRating(lcpSec, 2.5, 4.0);

  const lcpMetric: CoreWebVitalsMetric = {
    value: lcpSec,
    unit: 's',
    rating: lcpRating,
    threshold: { good: 2.5, poor: 4.0 },
    breakdown: {
      ttfbMs: Math.round(ttfbMs),
      resourceLoadDelayMs,
      resourceLoadTimeMs,
      elementRenderDelayMs,
    },
    candidateElement: lcpCandidate,
    details: lcpRating === 'good'
      ? `LCP is within Google's optimal threshold (<= 2.5s). Main content loads quickly.`
      : `LCP exceeds recommended 2.5s. High resource load duration and element render delay are the primary bottlenecks.`,
  };

  // 4. INP Calculation (Interaction to Next Paint)
  // Estimated from DOM complexity, heavy script tags, inline event handlers
  const totalDomNodes = $('*').length;
  const inlineEventHandlers = $('[onclick], [onkeydown], [onchange], [onmouseover]').length;
  const longTaskEstimatedCount = Math.max(0, Math.floor(scriptsCount / 4) + Math.floor(totalDomNodes / 800));
  
  const inputDelayMs = 25 + Math.min(100, Math.floor(totalDomNodes / 50));
  const processingDurationMs = 40 + Math.min(250, scriptsCount * 12 + inlineEventHandlers * 8);
  const presentationDelayMs = 20 + Math.min(80, Math.floor(totalDomNodes / 100));
  const inpEstMs = Math.round(inputDelayMs + processingDurationMs + presentationDelayMs);
  const inpRating = calculateRating(inpEstMs, 200, 500);

  const inpMetric: CoreWebVitalsMetric = {
    value: inpEstMs,
    unit: 'ms',
    rating: inpRating,
    threshold: { good: 200, poor: 500 },
    breakdown: {
      inputDelayMs,
      processingDurationMs,
      presentationDelayMs,
      longTaskEstimatedCount,
      totalDomNodes,
    },
    details: inpRating === 'good'
      ? 'Low input latency across typical user interaction events. Main thread remains responsive.'
      : `High main-thread load detected (${totalDomNodes} DOM nodes, ${scriptsCount} scripts) risking interaction jank above 200ms.`,
  };

  // 5. CLS Calculation (Cumulative Layout Shift)
  // Scans for images without width/height attributes, dynamic iframes, unsized ads
  const unsizedImages = $('img:not([width]):not([height])').length;
  const unsizedIframes = $('iframe:not([width]):not([height])').length;
  const customFonts = $('link[href*="fonts.googleapis.com"], style:contains("@font-face")').length;

  let clsScore = 0.01;
  clsScore += unsizedImages * 0.04;
  clsScore += unsizedIframes * 0.06;
  if (customFonts > 0) clsScore += 0.02; // potential FOIT/FOUT shift
  clsScore = Number(Math.min(1.0, clsScore).toFixed(3));
  const clsRating = calculateRating(clsScore, 0.1, 0.25);

  const clsMetric: CoreWebVitalsMetric = {
    value: clsScore,
    unit: 'score',
    rating: clsRating,
    threshold: { good: 0.1, poor: 0.25 },
    breakdown: {
      unsizedImagesCount: unsizedImages,
      unsizedIframesCount: unsizedIframes,
      webFontsShiftRisk: customFonts > 0 ? 'Present (FOUT/FOIT)' : 'Low',
    },
    details: clsRating === 'good'
      ? 'Layout stability is optimal. Viewport elements maintain predictable geometric coordinates during page lifecycle.'
      : `Detected ${unsizedImages} unsized images and ${unsizedIframes} unsized iframes causing dynamic reflow shifts during rendering.`,
  };

  return { lcp: lcpMetric, inp: inpMetric, cls: clsMetric, fcp: fcpMetric, ttfb: ttfbMetric };
}

export function analyzeGoogleSearchEssentials(
  html: string,
  targetUrl: string,
  status: number,
  robotsTxtBody?: string
): GoogleSearchEssentials {
  const $ = cheerio.load(html);
  const parsedTarget = new URL(targetUrl);

  // 1. Meta Robots
  const metaRobotsTag = $('meta[name="robots"], meta[name="googlebot"]').attr('content') || null;
  const isNoIndex = metaRobotsTag ? /noindex/i.test(metaRobotsTag) : false;

  // 2. Canonical URL
  const canonicalHref = $('link[rel="canonical"]').attr('href') || null;
  let canonicalStatus: 'valid' | 'mismatch' | 'missing' = 'missing';
  let isCanonicalSelfReferencing = false;

  if (canonicalHref) {
    try {
      const canonicalObj = new URL(canonicalHref, targetUrl);
      isCanonicalSelfReferencing = canonicalObj.origin + canonicalObj.pathname.replace(/\/$/, '') ===
        parsedTarget.origin + parsedTarget.pathname.replace(/\/$/, '');
      canonicalStatus = isCanonicalSelfReferencing ? 'valid' : 'mismatch';
    } catch {
      canonicalStatus = 'mismatch';
    }
  }

  // 3. Robots.txt directives
  const disallowRules: string[] = [];
  const allowRules: string[] = [];
  const sitemaps: string[] = [];
  let hasRobotsTxt = false;

  if (robotsTxtBody && robotsTxtBody.length > 5 && !robotsTxtBody.includes('<!DOCTYPE html>')) {
    hasRobotsTxt = true;
    const lines = robotsTxtBody.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^Disallow:\s*(.*)/i.test(trimmed)) {
        const path = trimmed.replace(/^Disallow:\s*/i, '').trim();
        if (path) disallowRules.push(path);
      } else if (/^Allow:\s*(.*)/i.test(trimmed)) {
        const path = trimmed.replace(/^Allow:\s*/i, '').trim();
        if (path) allowRules.push(path);
      } else if (/^Sitemap:\s*(.*)/i.test(trimmed)) {
        const s = trimmed.replace(/^Sitemap:\s*/i, '').trim();
        if (s) sitemaps.push(s);
      }
    }
  }

  // 4. Headings Structure
  const h1Elements = $('h1');
  const h1Texts = h1Elements.map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  const hierarchyWarnings: string[] = [];
  if (h1Texts.length === 0) hierarchyWarnings.push('Missing <h1> heading tag. Google requires a primary document heading.');
  if (h1Texts.length > 1) hierarchyWarnings.push(`Multiple <h1> tags detected (${h1Texts.length}). Consider using a single top-level heading.`);
  if (h1Texts.length === 0 && (h2Count > 0 || h3Count > 0)) {
    hierarchyWarnings.push('Skipped primary heading: <h2> or <h3> exists without a preceding <h1>.');
  }

  // 5. Structured Data (JSON-LD)
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const jsonLdTypes: string[] = [];
  const jsonLdErrors: string[] = [];

  jsonLdScripts.each((_, el) => {
    try {
      const rawText = $(el).html() || '';
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => item['@type'] && jsonLdTypes.push(String(item['@type'])));
      } else if (parsed['@type']) {
        jsonLdTypes.push(String(parsed['@type']));
      } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        parsed['@graph'].forEach(item => item['@type'] && jsonLdTypes.push(String(item['@type'])));
      }
    } catch (e: any) {
      jsonLdErrors.push(`JSON-LD Syntax Error: ${e.message}`);
    }
  });

  // 6. Mobile Viewport
  const viewportContent = $('meta[name="viewport"]').attr('content') || null;
  const hasViewport = !!viewportContent;
  const isCompliantViewport = hasViewport && viewportContent.includes('width=device-width');

  // 7. Open Graph
  const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || undefined;
  const ogDescription = $('meta[property="og:description"], meta[name="description"]').attr('content') || undefined;
  const ogImage = $('meta[property="og:image"]').attr('content') || undefined;

  // 8. Hreflang
  const hreflangList: Array<{ lang: string; href: string }> = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const lang = $(el).attr('hreflang') || '';
    const href = $(el).attr('href') || '';
    if (lang && href) hreflangList.push({ lang, href });
  });

  const isIndexable = status === 200 && !isNoIndex && disallowRules.indexOf('/') === -1;

  return {
    status,
    isIndexable,
    hasRobotsTxt,
    robotsTxtUrl: hasRobotsTxt ? `${parsedTarget.origin}/robots.txt` : undefined,
    robotsDirectives: {
      userAgent: '*',
      disallow: disallowRules,
      allow: allowRules,
      sitemaps,
    },
    metaRobots: metaRobotsTag,
    canonicalUrl: canonicalHref,
    isCanonicalSelfReferencing,
    canonicalStatus,
    hasSitemap: sitemaps.length > 0,
    sitemapUrl: sitemaps[0] || `${parsedTarget.origin}/sitemap.xml`,
    headingStructure: {
      h1Count: h1Texts.length,
      h1Texts,
      h2Count,
      hasHierarchyIssues: hierarchyWarnings.length > 0,
      hierarchyWarnings,
    },
    structuredData: {
      hasJsonLd: jsonLdTypes.length > 0,
      types: Array.from(new Set(jsonLdTypes)),
      validSyntax: jsonLdErrors.length === 0,
      errors: jsonLdErrors,
    },
    mobileViewport: {
      hasTag: hasViewport,
      content: viewportContent,
      isCompliant: isCompliantViewport,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
    },
    hreflang: hreflangList,
  };
}
