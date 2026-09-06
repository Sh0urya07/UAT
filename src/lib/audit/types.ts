export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export interface CoreWebVitalsMetric {
  value: number;
  unit: 's' | 'ms' | 'score';
  rating: MetricRating;
  threshold: { good: number; poor: number };
  breakdown: Record<string, number | string>;
  candidateElement?: string;
  details: string;
}

export interface GoogleSearchEssentials {
  status: number;
  isIndexable: boolean;
  hasRobotsTxt: boolean;
  robotsTxtUrl?: string;
  robotsDirectives: {
    userAgent: string;
    disallow: string[];
    allow: string[];
    sitemaps: string[];
  };
  metaRobots: string | null;
  canonicalUrl: string | null;
  isCanonicalSelfReferencing: boolean;
  canonicalStatus: 'valid' | 'mismatch' | 'missing';
  hasSitemap: boolean;
  sitemapUrl?: string;
  headingStructure: {
    h1Count: number;
    h1Texts: string[];
    h2Count: number;
    hasHierarchyIssues: boolean;
    hierarchyWarnings: string[];
  };
  structuredData: {
    hasJsonLd: boolean;
    types: string[];
    validSyntax: boolean;
    errors: string[];
  };
  mobileViewport: {
    hasTag: boolean;
    content: string | null;
    isCompliant: boolean;
  };
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
  };
  hreflang: Array<{ lang: string; href: string }>;
}

export interface GenericAnchorViolation {
  href: string;
  anchorText: string;
  flaggedReason: string;
  suggestion: string;
  contextSnippet?: string;
}

export interface NonCrawlableLinkViolation {
  tag: string;
  elementHtml: string;
  violation: 'missing-href' | 'javascript-void' | 'hash-only' | 'onclick-without-href' | 'button-as-link';
  remediation: string;
}

export interface LinkItem {
  href: string;
  text: string;
  type: 'internal' | 'external' | 'malformed' | 'non-crawlable';
  isCrawlable: boolean;
  isGenericText: boolean;
  rel: string[];
  status?: number;
  isSecure: boolean;
}

export interface LinkAuditReport {
  totalLinks: number;
  crawlableLinksCount: number;
  nonCrawlableLinksCount: number;
  internalLinksCount: number;
  externalLinksCount: number;
  genericAnchorCount: number;
  score: number;
  genericAnchorViolations: GenericAnchorViolation[];
  nonCrawlableViolations: NonCrawlableLinkViolation[];
  links: LinkItem[];
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SecurityFinding {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  cvss: number | null;
  evidence: string;
  remediation: string;
  remediationCode?: {
    nextConfig?: string;
    nginx?: string;
    apache?: string;
    headers?: Record<string, string>;
  };
}

export interface HydrationBug {
  id: string;
  component?: string;
  element: string;
  errorType: 'server-client-mismatch' | 'invalid-nesting' | 'timestamp-divergence' | 'suppressHydrationWarning-overuse';
  description: string;
  suggestedFix: string;
}

export interface BrokenDomState {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: 'duplicate-id' | 'orphaned-label' | 'missing-alt' | 'missing-button-name' | 'broken-image' | 'viewport-overflow';
  element: string;
  description: string;
  remediation: string;
}

export interface MemoryLeakHeuristics {
  domNodeCount: number;
  domNodeStatus: 'healthy' | 'warning' | 'critical';
  listenerAccumulationRisk: 'low' | 'moderate' | 'high';
  jsHeapEstimatedMb: number;
  findings: string[];
}

export interface ConsoleErrorFinding {
  type: 'error' | 'warning' | 'unhandled-rejection';
  message: string;
  source?: string;
}

export interface DeepBugReport {
  hydrationMismatches: HydrationBug[];
  brokenDomStates: BrokenDomState[];
  memoryLeakHeuristics: MemoryLeakHeuristics;
  consoleErrors: ConsoleErrorFinding[];
}

export interface ThrottlingSimulation {
  lcpMultiplier: number;
  inpMultiplier: number;
  mainThreadScriptingMs: number;
  mainThreadRenderingMs: number;
  mainThreadPaintingMs: number;
  networkWaitMs: number;
  totalLoadTimeSec: number;
  status: 'Good' | 'Needs Optimization' | 'Critical (Device Starvation)';
}

export interface PerformanceThrottlingProfile {
  id: 'desktop' | 'mid-mobile' | 'budget-2gb' | 'custom';
  name: string;
  cpuSlowdown: number;
  memoryRamGb: number;
  networkType: 'wifi' | 'fast-4g' | 'slow-4g' | '3g';
  downloadThroughputKbps: number;
  uploadThroughputKbps: number;
  latencyMs: number;
  simulation: ThrottlingSimulation;
}

export interface AuditReport {
  id: string;
  timestamp: string;
  targetUrl: string;
  finalUrl: string;
  overallScore: number;
  scores: {
    coreWebVitals: number;
    seoAndIndexability: number;
    linkCompliance: number;
    securityPosture: number;
    codeAndDomHealth: number;
  };
  coreWebVitals: {
    lcp: CoreWebVitalsMetric;
    inp: CoreWebVitalsMetric;
    cls: CoreWebVitalsMetric;
    fcp: CoreWebVitalsMetric;
    ttfb: CoreWebVitalsMetric;
  };
  searchEssentials: GoogleSearchEssentials;
  linkAudit: LinkAuditReport;
  security: {
    score: number;
    findings: SecurityFinding[];
    headersInspected: Record<string, string>;
    tlsStatus: {
      isHttps: boolean;
      hstsPreloaded: boolean;
      mixedContentDetected: boolean;
    };
  };
  deepBugs: DeepBugReport;
  mobileThrottling: PerformanceThrottlingProfile;
  screenshot?: string;
}
