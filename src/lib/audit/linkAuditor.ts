import * as cheerio from 'cheerio';
import { GenericAnchorViolation, LinkAuditReport, LinkItem, NonCrawlableLinkViolation } from './types';

const GENERIC_ANCHOR_PATTERNS = [
  /^click here$/i,
  /^click this$/i,
  /^here$/i,
  /^read more$/i,
  /^learn more$/i,
  /^more$/i,
  /^link$/i,
  /^this$/i,
  /^this page$/i,
  /^continue$/i,
  /^continue reading$/i,
  /^download$/i,
  /^view$/i,
  /^view more$/i,
  /^go$/i,
  /^details$/i,
  /^info$/i,
  /^website$/i,
  /^source$/i,
  /^check it out$/i,
];

function isGenericAnchor(text: string): boolean {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (!cleaned) return true; // empty anchor text is also generic/uninformative
  return GENERIC_ANCHOR_PATTERNS.some(pattern => pattern.test(cleaned));
}

export function analyzeDocumentLinks(html: string, baseUrl: string): LinkAuditReport {
  const $ = cheerio.load(html);
  const parsedBase = new URL(baseUrl);
  const baseOrigin = parsedBase.origin.toLowerCase();

  const links: LinkItem[] = [];
  const genericViolations: GenericAnchorViolation[] = [];
  const nonCrawlableViolations: NonCrawlableLinkViolation[] = [];

  // 1. Check true <a> anchor elements
  $('a').each((_, el) => {
    const rawHref = $(el).attr('href');
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const relStr = $(el).attr('rel') || '';
    const relList = relStr.split(/\s+/).filter(Boolean);
    const outerHtml = $.html(el);
    const snippet = outerHtml.length > 120 ? outerHtml.slice(0, 120) + '...' : outerHtml;

    // A. Check for Non-Crawlable anchor patterns
    if (rawHref === undefined || rawHref === null) {
      nonCrawlableViolations.push({
        tag: 'a',
        elementHtml: snippet,
        violation: 'missing-href',
        remediation: 'Anchor element missing href attribute. Googlebot ignores <a> elements without an href.',
      });
      links.push({
        href: '',
        text: text || '(empty)',
        type: 'non-crawlable',
        isCrawlable: false,
        isGenericText: false,
        rel: relList,
        isSecure: true,
      });
      return;
    }

    const trimmedHref = rawHref.trim();

    if (trimmedHref.startsWith('javascript:')) {
      nonCrawlableViolations.push({
        tag: 'a',
        elementHtml: snippet,
        violation: 'javascript-void',
        remediation: `Uses javascript pseudoprotocol (${trimmedHref}). Replace with a standard URL href and bind JS handlers unobtrusively.`,
      });
      links.push({
        href: trimmedHref,
        text: text || '(empty)',
        type: 'non-crawlable',
        isCrawlable: false,
        isGenericText: false,
        rel: relList,
        isSecure: true,
      });
      return;
    }

    if (trimmedHref === '#' || trimmedHref === '') {
      nonCrawlableViolations.push({
        tag: 'a',
        elementHtml: snippet,
        violation: 'hash-only',
        remediation: 'Anchor points to a lone hash (#). Googlebot treats this as a non-routable dummy link.',
      });
      links.push({
        href: trimmedHref,
        text: text || '(empty)',
        type: 'non-crawlable',
        isCrawlable: false,
        isGenericText: false,
        rel: relList,
        isSecure: true,
      });
      return;
    }

    if (trimmedHref.startsWith('mailto:') || trimmedHref.startsWith('tel:')) {
      links.push({
        href: trimmedHref,
        text,
        type: 'external',
        isCrawlable: true,
        isGenericText: false,
        rel: relList,
        isSecure: true,
      });
      return;
    }

    // B. Resolve target URL
    let resolvedUrl: URL;
    try {
      resolvedUrl = new URL(trimmedHref, baseUrl);
    } catch {
      links.push({
        href: trimmedHref,
        text,
        type: 'malformed',
        isCrawlable: false,
        isGenericText: false,
        rel: relList,
        isSecure: false,
      });
      return;
    }

    const isInternal = resolvedUrl.origin.toLowerCase() === baseOrigin;
    const isSecure = resolvedUrl.protocol === 'https:';

    // C. Check Generic Anchor Text (Google SEO guideline)
    const isGeneric = isGenericAnchor(text);
    if (isGeneric) {
      genericViolations.push({
        href: resolvedUrl.href,
        anchorText: text || '[Blank / No Text]',
        flaggedReason: 'Generic anchor text violates Google Search Essentials. Crawlers cannot infer page context from vague text.',
        suggestion: `Replace "${text || 'unlabelled link'}" with descriptive keywords representing target destination: "${resolvedUrl.pathname.split('/').filter(Boolean).pop() || 'relevant topic'}"`,
        contextSnippet: snippet,
      });
    }

    // D. Check target="_blank" without rel="noopener"
    const targetAttr = $(el).attr('target');
    if (targetAttr === '_blank' && !relList.includes('noopener') && !relList.includes('noreferrer')) {
      relList.push('(missing noopener)');
    }

    links.push({
      href: resolvedUrl.href,
      text: text || '(no anchor text)',
      type: isInternal ? 'internal' : 'external',
      isCrawlable: true,
      isGenericText: isGeneric,
      rel: relList,
      isSecure,
    });
  });

  // 2. Check for non-<a> clickable pseudo links (e.g. <div onclick>, <button data-href>)
  $('[onclick]:not(a):not(button):not(input):not(form)').each((_, el) => {
    const outerHtml = $.html(el);
    const snippet = outerHtml.length > 100 ? outerHtml.slice(0, 100) + '...' : outerHtml;
    nonCrawlableViolations.push({
      tag: (el as any).tagName || 'element',
      elementHtml: snippet,
      violation: 'onclick-without-href',
      remediation: 'Element relies on an onclick handler for navigation instead of a crawlable <a href="..."> tag. Search engines cannot discover this route.',
    });
  });

  // 3. Compute stats
  const totalLinks = links.length;
  const crawlableLinksCount = links.filter(l => l.isCrawlable).length;
  const nonCrawlableLinksCount = totalLinks - crawlableLinksCount + nonCrawlableViolations.length;
  const internalLinksCount = links.filter(l => l.type === 'internal').length;
  const externalLinksCount = links.filter(l => l.type === 'external').length;
  const genericAnchorCount = genericViolations.length;

  // 4. Calculate Google-Compliant Link Score (0-100)
  let score = 100;
  if (totalLinks > 0) {
    const crawlableRatio = crawlableLinksCount / Math.max(1, totalLinks + nonCrawlableViolations.length);
    const genericRatio = genericAnchorCount / Math.max(1, crawlableLinksCount);

    score -= Math.round((1 - crawlableRatio) * 45);
    score -= Math.round(genericRatio * 35);
    if (nonCrawlableViolations.length > 3) score -= 15;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    totalLinks,
    crawlableLinksCount,
    nonCrawlableLinksCount,
    internalLinksCount,
    externalLinksCount,
    genericAnchorCount,
    score,
    genericAnchorViolations: genericViolations,
    nonCrawlableViolations,
    links,
  };
}
