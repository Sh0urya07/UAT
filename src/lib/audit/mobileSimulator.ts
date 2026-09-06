import { PerformanceThrottlingProfile, ThrottlingSimulation } from './types';

export const THROTTLING_PROFILES: Record<string, Omit<PerformanceThrottlingProfile, 'simulation'>> = {
  desktop: {
    id: 'desktop',
    name: 'High-End Desktop (Unthrottled)',
    cpuSlowdown: 1,
    memoryRamGb: 16,
    networkType: 'wifi',
    downloadThroughputKbps: 100000,
    uploadThroughputKbps: 50000,
    latencyMs: 5,
  },
  'mid-mobile': {
    id: 'mid-mobile',
    name: 'Standard Mobile (Fast 4G)',
    cpuSlowdown: 2.5,
    memoryRamGb: 6,
    networkType: 'fast-4g',
    downloadThroughputKbps: 15000,
    uploadThroughputKbps: 5000,
    latencyMs: 45,
  },
  'budget-2gb': {
    id: 'budget-2gb',
    name: 'Budget Mobile (2GB RAM / 6x CPU Throttling)',
    cpuSlowdown: 6,
    memoryRamGb: 2,
    networkType: 'slow-4g',
    downloadThroughputKbps: 1600, // 1.6 Mbps
    uploadThroughputKbps: 750,   // 750 Kbps
    latencyMs: 150,              // 150ms roundtrip delay
  },
};

export function simulateDeviceThrottling(
  profileId: 'desktop' | 'mid-mobile' | 'budget-2gb' | 'custom',
  baselineLcpSec: number,
  baselineInpMs: number,
  domNodesCount: number,
  customParams?: {
    cpuSlowdown?: number;
    memoryRamGb?: number;
    latencyMs?: number;
    downloadThroughputKbps?: number;
  }
): PerformanceThrottlingProfile {
  const baseProfile = THROTTLING_PROFILES[profileId] || THROTTLING_PROFILES['budget-2gb'];
  const cpu = customParams?.cpuSlowdown ?? baseProfile.cpuSlowdown;
  const ram = customParams?.memoryRamGb ?? baseProfile.memoryRamGb;
  const latency = customParams?.latencyMs ?? baseProfile.latencyMs;
  const downloadKbps = customParams?.downloadThroughputKbps ?? baseProfile.downloadThroughputKbps;

  // 1. Scripting, Layout, and Paint Main-Thread Execution Calculations
  const baselineScriptingMs = Math.max(80, Math.round(baselineInpMs * 0.45));
  const mainThreadScriptingMs = Math.round(baselineScriptingMs * Math.pow(cpu, 1.15) * (ram <= 2 ? 1.4 : 1.0));
  
  const baselineRenderingMs = Math.max(40, Math.round(domNodesCount * 0.08));
  const mainThreadRenderingMs = Math.round(baselineRenderingMs * cpu * (ram <= 2 ? 1.25 : 1.0));

  const mainThreadPaintingMs = Math.round(25 * (cpu > 1 ? cpu * 0.7 : 1));

  // 2. Network Latency & Transfer Wait Calculations
  const networkMultiplier = 10000 / Math.max(500, downloadKbps);
  const networkWaitMs = Math.round(latency * 3.5 + Math.min(2500, networkMultiplier * 80));

  // 3. Multipliers & Degraded Metrics
  const lcpMultiplier = Number(((cpu * 0.6 + networkMultiplier * 0.4) * (ram <= 2 ? 1.3 : 1.0)).toFixed(2));
  const inpMultiplier = Number((cpu * (ram <= 2 ? 1.45 : 1.0)).toFixed(2));

  const totalLoadTimeSec = Number(
    ((mainThreadScriptingMs + mainThreadRenderingMs + mainThreadPaintingMs + networkWaitMs + baselineLcpSec * 600) / 1000).toFixed(2)
  );

  let status: 'Good' | 'Needs Optimization' | 'Critical (Device Starvation)' = 'Good';
  if (totalLoadTimeSec > 8.0 || cpu >= 5 || ram <= 2) {
    status = 'Critical (Device Starvation)';
  } else if (totalLoadTimeSec > 3.5 || cpu > 2) {
    status = 'Needs Optimization';
  }

  const simulation: ThrottlingSimulation = {
    lcpMultiplier,
    inpMultiplier,
    mainThreadScriptingMs,
    mainThreadRenderingMs,
    mainThreadPaintingMs,
    networkWaitMs,
    totalLoadTimeSec,
    status,
  };

  return {
    id: profileId,
    name: baseProfile.name,
    cpuSlowdown: cpu,
    memoryRamGb: ram,
    networkType: baseProfile.networkType,
    downloadThroughputKbps: downloadKbps,
    uploadThroughputKbps: baseProfile.uploadThroughputKbps,
    latencyMs: latency,
    simulation,
  };
}
