// lib/status-checker.ts

export interface LiveStatusResult {
  service: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance' | 'unknown';
  lastChecked: Date;
  message?: string;
  source: 'official' | 'reports';
}

/**
 * Fetch live status from official status pages
 * Supports common status page formats: Statuspage.io, custom APIs, RSS feeds
 */
export async function checkLiveStatus(
  serviceName: string,
  statusPageUrl?: string
): Promise<LiveStatusResult> {
  
  // Default to 'unknown' if no status page configured
  if (!statusPageUrl) {
    return {
      service: serviceName,
      status: 'unknown',
      lastChecked: new Date(),
      source: 'reports'
    };
  }

  try {
    // Detect status page type and fetch accordingly
    if (statusPageUrl.includes('status.')) {
      return await checkStatuspageIo(serviceName, statusPageUrl);
    } else if (statusPageUrl.endsWith('.json')) {
      return await checkJsonApi(serviceName, statusPageUrl);
    } else {
      return await checkGenericPage(serviceName, statusPageUrl);
    }
  } catch (error) {
    console.error(`Error checking ${serviceName}:`, error);
    return {
      service: serviceName,
      status: 'unknown',
      lastChecked: new Date(),
      source: 'reports',
      message: 'Failed to fetch status'
    };
  }
}

/**
 * Check Statuspage.io based status pages (Discord, GitHub, etc.)
 */
async function checkStatuspageIo(
  serviceName: string,
  url: string
): Promise<LiveStatusResult> {
  
  // Most Statuspage.io pages have an API endpoint at /api/v2/status.json
  const apiUrl = url.replace(/\/$/, '') + '/api/v2/status.json';
  
  const response = await fetch(apiUrl, {
    headers: { 'User-Agent': 'ServiceStatusNow/1.0' },
    next: { revalidate: 60 } // Cache for 60 seconds
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  // Statuspage.io format: { status: { indicator: "none" | "minor" | "major" | "critical" } }
  const indicator = data?.status?.indicator || 'unknown';
  
  const statusMap: Record<string, LiveStatusResult['status']> = {
    'none': 'operational',
    'minor': 'degraded',
    'major': 'outage',
    'critical': 'outage',
    'maintenance': 'maintenance'
  };
  
  return {
    service: serviceName,
    status: statusMap[indicator] || 'unknown',
    lastChecked: new Date(),
    source: 'official',
    message: data?.status?.description
  };
}

/**
 * Check JSON API endpoints
 */
async function checkJsonApi(
  serviceName: string,
  url: string
): Promise<LiveStatusResult> {
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ServiceStatusNow/1.0' },
    next: { revalidate: 60 }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  // Try to extract status from common JSON formats
  const status = data?.status || data?.state || data?.indicator || 'unknown';
  
  return {
    service: serviceName,
    status: normalizeStatus(status),
    lastChecked: new Date(),
    source: 'official'
  };
}

/**
 * Generic HTML page scraping (fallback)
 */
async function checkGenericPage(
  serviceName: string,
  url: string
): Promise<LiveStatusResult> {
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ServiceStatusNow/1.0' },
    next: { revalidate: 60 }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const html = await response.text();
  
  // Simple pattern matching for common status indicators
  if (/all systems operational|everything is working|no issues/i.test(html)) {
    return {
      service: serviceName,
      status: 'operational',
      lastChecked: new Date(),
      source: 'official'
    };
  } else if (/degraded|slow|issues detected/i.test(html)) {
    return {
      service: serviceName,
      status: 'degraded',
      lastChecked: new Date(),
      source: 'official'
    };
  } else if (/outage|down|offline|major incident/i.test(html)) {
    return {
      service: serviceName,
      status: 'outage',
      lastChecked: new Date(),
      source: 'official'
    };
  }
  
  return {
    service: serviceName,
    status: 'unknown',
    lastChecked: new Date(),
    source: 'reports'
  };
}

/**
 * Normalize various status string formats to our standard
 */
function normalizeStatus(status: string): LiveStatusResult['status'] {
  const normalized = status.toLowerCase();
  
  if (normalized.includes('operational') || normalized === 'ok' || normalized === 'up') {
    return 'operational';
  } else if (normalized.includes('degraded') || normalized.includes('minor')) {
    return 'degraded';
  } else if (normalized.includes('outage') || normalized.includes('down') || normalized.includes('major')) {
    return 'outage';
  } else if (normalized.includes('maintenance')) {
    return 'maintenance';
  }
  
  return 'unknown';
}

/**
 * Batch check multiple services
 */
export async function checkMultipleServices(
  services: Array<{ name: string; statusPageUrl?: string }>
): Promise<LiveStatusResult[]> {
  
  const promises = services.map(s => checkLiveStatus(s.name, s.statusPageUrl));
  return await Promise.all(promises);
}
