import * as cheerio from 'cheerio';
import { BrokenDomState, DeepBugReport, HydrationBug, MemoryLeakHeuristics } from './types';

export function analyzeDeepBugsAndDom(
  html: string,
  consoleErrorsList: Array<{ type: 'error' | 'warning' | 'unhandled-rejection'; message: string; source?: string }> = []
): DeepBugReport {
  const $ = cheerio.load(html);

  // 1. Client/Server Hydration Mismatch Detection
  const hydrationMismatches: HydrationBug[] = [];

  // A. Check for illegal DOM nesting: <p> containing block elements (<div>, <p>, <ul>, <table>)
  // This is the #1 cause of React 18/19 hydration mismatch errors
  $('p').each((_, pEl) => {
    const hasBlockChild = $(pEl).find('div, p, ul, ol, table, form, section, article').length > 0;
    if (hasBlockChild) {
      const outer = $.html(pEl);
      const snippet = outer.length > 120 ? outer.slice(0, 120) + '...' : outer;
      hydrationMismatches.push({
        id: `hydration-nesting-${hydrationMismatches.length + 1}`,
        component: 'DOM Structure',
        element: snippet,
        errorType: 'invalid-nesting',
        description: 'Illegal HTML Nesting: Block element (<div>, <p>, <ul>) nested inside a <p> tag. Browsers auto-close the <p> early, destroying React virtual DOM alignment and triggering runtime hydration failure.',
        suggestedFix: 'Replace the outer <p> with a <div> or semantic <section>, or wrap inline elements inside <span>.',
      });
    }
  });

  // B. Check for nested interactive elements (e.g. <a> inside <a> or <button> inside <a>)
  $('a a, a button, button a').each((_, el) => {
    const outer = $.html(el);
    const snippet = outer.length > 100 ? outer.slice(0, 100) + '...' : outer;
    hydrationMismatches.push({
      id: `hydration-interactive-${hydrationMismatches.length + 1}`,
      element: snippet,
      errorType: 'server-client-mismatch',
      description: 'Nested Interactive Content: Interactive element nested inside another interactive element (e.g., <button> inside <a>). Violates HTML spec and triggers DOM tree rebuild on client hydration.',
      suggestedFix: 'Decouple the clickable actions into separate sibling elements with distinct event targets.',
    });
  });

  // C. Check for timestamp/date string markers without suppressHydrationWarning
  const htmlRaw = html;
  if (/data-react-checksum|data-server-rendered|__NEXT_DATA__/i.test(htmlRaw)) {
    // Check if dynamic time elements or dates appear without hydration suppression
    const dateMatches = htmlRaw.match(/\b(202[4-9]-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}|\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b\s+\w+\s+\d{1,2}\s+\d{4})/gi);
    if (dateMatches && !/suppressHydrationWarning/i.test(htmlRaw)) {
      hydrationMismatches.push({
        id: 'hydration-timestamp-divergence',
        element: `Localized Date: "${dateMatches[0]}"`,
        errorType: 'timestamp-divergence',
        description: 'Unprotected Dynamic Date/Time Render: Server and client renders may output divergent timestamps due to UTC vs user timezone differences, triggering a React text content mismatch warning.',
        suggestedFix: 'Add suppressHydrationWarning to the container element or defer rendering dynamic timestamps until after mount via useEffect or dynamic import (ssr: false).',
      });
    }
  }

  // 2. Broken DOM States
  const brokenDomStates: BrokenDomState[] = [];

  // A. Duplicate IDs
  const seenIds = new Map<string, number>();
  $('[id]').each((_, el) => {
    const id = $(el).attr('id');
    if (id) {
      seenIds.set(id, (seenIds.get(id) || 0) + 1);
    }
  });

  seenIds.forEach((count, id) => {
    if (count > 1) {
      brokenDomStates.push({
        id: `broken-dom-duplicate-id-${id}`,
        severity: 'high',
        type: 'duplicate-id',
        element: `id="${id}" (occurs ${count} times)`,
        description: `Duplicate ID attribute: "${id}" appears ${count} times in the document. IDs must be unique per document for accessibility and JS query stability.`,
        remediation: 'Ensure IDs are globally unique, or use CSS classes / data attributes for non-unique styling and querying.',
      });
    }
  });

  // B. Orphaned Form Labels
  $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select').each((_, el) => {
    const id = $(el).attr('id');
    const ariaLabel = $(el).attr('aria-label') || $(el).attr('aria-labelledby');
    const hasParentLabel = $(el).closest('label').length > 0;
    const hasForLabel = id ? $(`label[for="${id}"]`).length > 0 : false;

    if (!hasParentLabel && !hasForLabel && !ariaLabel) {
      const name = $(el).attr('name') || $(el).attr('type') || 'input';
      brokenDomStates.push({
        id: `broken-dom-orphan-label-${brokenDomStates.length + 1}`,
        severity: 'medium',
        type: 'orphaned-label',
        element: `<${(el as any).tagName} name="${name}">`,
        description: `Form control missing accessible label: Input element "${name}" is not associated with any <label> element or aria-label attribute.`,
        remediation: 'Wrap the input inside a <label> or provide a matching for="id" attribute, or attach aria-label="Descriptive name".',
      });
    }
  });

  // C. Images missing alt attributes
  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    const src = $(el).attr('src') || 'unknown';
    if (alt === undefined) {
      brokenDomStates.push({
        id: `broken-dom-missing-alt-${brokenDomStates.length + 1}`,
        severity: 'medium',
        type: 'missing-alt',
        element: `<img src="${src.slice(0, 50)}...">`,
        description: 'Image missing alt attribute. Screen readers cannot describe the image to visually impaired users, and search engines cannot index image context.',
        remediation: 'Provide descriptive alt text for informative images or alt="" for purely decorative elements.',
      });
    }
  });

  // D. Buttons missing accessible names
  $('button').each((_, el) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr('aria-label') || $(el).attr('aria-labelledby');
    if (!text && !ariaLabel) {
      const outer = $.html(el);
      brokenDomStates.push({
        id: `broken-dom-empty-button-${brokenDomStates.length + 1}`,
        severity: 'high',
        type: 'missing-button-name',
        element: outer.length > 80 ? outer.slice(0, 80) + '...' : outer,
        description: 'Interactive button has no accessible text name (icon button without text or aria-label).',
        remediation: 'Add aria-label="Action description" or an accessible visually hidden <span> name.',
      });
    }
  });

  // 3. Memory Leak & DOM Complexity Heuristics
  const totalDomNodes = $('*').length;
  const domDepth = getDomDepth($);
  const totalScripts = $('script').length;

  let domNodeStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (totalDomNodes > 3000 || domDepth > 32) domNodeStatus = 'critical';
  else if (totalDomNodes > 1500 || domDepth > 20) domNodeStatus = 'warning';

  let listenerRisk: 'low' | 'moderate' | 'high' = 'low';
  if (totalScripts > 40 || totalDomNodes > 2500) listenerRisk = 'high';
  else if (totalScripts > 20 || totalDomNodes > 1200) listenerRisk = 'moderate';

  const jsHeapEstimatedMb = Math.round(18 + (totalDomNodes / 100) * 0.8 + totalScripts * 1.2);

  const memoryFindings: string[] = [];
  if (totalDomNodes > 1500) {
    memoryFindings.push(`High DOM tree complexity: ${totalDomNodes} elements present. Large trees increase GC pause duration and memory overhead.`);
  }
  if (domDepth > 20) {
    memoryFindings.push(`Excessive DOM tree nesting depth (${domDepth} levels). High tree depth stresses style calculation engines and layout recalculations.`);
  }
  if (totalScripts > 25) {
    memoryFindings.push(`Heavy JavaScript footprint: ${totalScripts} script tags loaded. Multiple unmanaged third-party bundles increase the risk of detached DOM node retention.`);
  }

  const memoryLeakHeuristics: MemoryLeakHeuristics = {
    domNodeCount: totalDomNodes,
    domNodeStatus,
    listenerAccumulationRisk: listenerRisk,
    jsHeapEstimatedMb,
    findings: memoryFindings,
  };

  return {
    hydrationMismatches,
    brokenDomStates,
    memoryLeakHeuristics,
    consoleErrors: consoleErrorsList,
  };
}

function getDomDepth($: cheerio.CheerioAPI): number {
  let maxDepth = 0;
  function walk(el: any, currentDepth: number) {
    if (currentDepth > maxDepth) maxDepth = currentDepth;
    if (el.children) {
      for (const child of el.children) {
        if (child.type === 'tag') {
          walk(child, currentDepth + 1);
        }
      }
    }
  }
  const root = $('html').get(0);
  if (root) walk(root, 1);
  return maxDepth;
}
