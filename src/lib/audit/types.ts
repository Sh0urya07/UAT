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

export type CrawlScope = 'single-page' | 'multi-page-spider';

export interface SpiderPageNode {
  url: string;
  path: string;
  status: number;
  loadTimeMs: number;
  sizeKb: number;
  depth: number;
  securityFindingsCount: number;
  healthScore?: number;
  screenshot?: string;
  issues: string[];
}

export interface SpiderArchitectureReport {
  scope: CrawlScope;
  totalPagesCrawled: number;
  averageHealthScore: number;
  systemicSecurityScore: number;
  totalSystemicFindings: number;
  aggregateMobileLoadTimeSec: number;
  aggregateMobileStatus: 'Good' | 'Needs Optimization' | 'Critical (Too Heavy)';
  homepagePerformance: {
    lcpSec: number;
    fcpMs: number;
    totalLoadSec: number;
    score: number;
  };
  pages: SpiderPageNode[];
  routeDistribution: {
    internal: number;
    external: number;
    secureHttps: number;
  };
}

export interface ColorPaletteNode {
  hex: string;
  percentage: number;
  role: 'dominant-60' | 'secondary-30' | 'accent-10';
  emotion: string;
  archetype: string;
  autonomicEffect: 'Parasympathetic Restorative' | 'Sympathetic Arousal' | 'Neutral/Equilibrium';
}

export interface ApcaSample {
  fg: string;
  bg: string;
  ratio: number;
  apcaLc: number;
  status: 'AAA' | 'AA' | 'Fail';
  textSample: string;
}

export interface FrontendDiagnosticsReport {
  score: number;
  colorPsychology: {
    score: number;
    palette: ColorPaletteNode[];
    apcaContrast: {
      score: number;
      passingCount: number;
      failingCount: number;
      samples: ApcaSample[];
    };
    saliencyVsComfort: {
      saliencyScore: number;
      comfortScore: number;
      congruenceRating: 'High Alignment' | 'Attention Hijacked' | 'Subtle Balance';
      insight: string;
    };
    kobayashiMood: string;
  };
  typography: {
    score: number;
    fontCount: number;
    fonts: string[];
    hierarchyCompliant: boolean;
    lineHeightRatio: number;
    lineMeasureCh: number;
    issues: string[];
  };
  layoutAndMobile: {
    score: number;
    touchTargetsPassed: number;
    touchTargetsSubstandard: number;
    horizontalOverflow: boolean;
    spacingGridCompliant: boolean;
    issues: string[];
  };
  animationAndMotion: {
    score: number;
    averageDurationMs: number;
    prefersReducedMotionSupported: boolean;
    infiniteLoopsDetected: number;
    hardwareAccelerated: boolean;
    issues: string[];
  };
}

export interface AuditReport {
  id: string;
  timestamp: string;
  targetUrl: string;
  finalUrl: string;
  crawlScope?: CrawlScope;
  overallScore: number;
  scores: {
    coreWebVitals: number;
    seoAndIndexability: number;
    linkCompliance: number;
    securityPosture: number;
    codeAndDomHealth: number;
    frontendAndUx?: number;
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
  spiderArchitecture?: SpiderArchitectureReport;
  frontendDiagnostics?: FrontendDiagnosticsReport;
  screenshot?: string;
}
