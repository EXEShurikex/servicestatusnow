// lib/status-checker.ts
// Pulls from official status pages (Discord, GitHub, Cloudflare, etc.)

export interface StatusPageResponse {
  status: {
    indicator: 'none' | 'minor' | 'major' | 'critical'
    description: string
  }
}

export interface StatusPageIncident {
  id: string
  name: string
  status: string
  impact: string
  created_at: string
  updated_at: string
  resolved_at: string | null
  shortlink: string
  incident_updates: { status: string; body: string; created_at: string }[]
  components: { name: string; status: string }[]
}

// Official status page URLs (free public APIs)
export const STATUS_PAGE_SOURCES: Record<string, { statusUrl: string; summaryUrl: string }> = {
  discord: {
    statusUrl: 'https://discordstatus.com/api/v2/status.json',
    summaryUrl: 'https://discordstatus.com/api/v2/summary.json'
  },
  github: {
    statusUrl: 'https://www.githubstatus.com/api/v2/status.json',
    summaryUrl: 'https://www.githubstatus.com/api/v2/summary.json'
  },
  cloudflare: {
    statusUrl: 'https://www.cloudflarestatus.com/api/v2/status.json',
    summaryUrl: 'https://www.cloudflarestatus.com/api/v2/summary.json'
  },
  twitch: {
    statusUrl: 'https://status.twitch.tv/api/v2/status.json',
    summaryUrl: 'https://status.twitch.tv/api/v2/summary.json'
  },
  reddit: {
    statusUrl: 'https://www.redditstatus.com/api/v2/status.json',
    summaryUrl: 'https://www.redditstatus.com/api/v2/summary.json'
  },
  dropbox: {
    statusUrl: 'https://status.dropbox.com/api/v2/status.json',
    summaryUrl: 'https://status.dropbox.com/api/v2/summary.json'
  },
  vercel: {
    statusUrl: 'https://www.vercel-status.com/api/v2/status.json',
    summaryUrl: 'https://www.vercel-status.com/api/v2/summary.json'
  },
  netlify: {
    statusUrl: 'https://www.netlifystatus.com/api/v2/status.json',
    summaryUrl: 'https://www.netlifystatus.com/api/v2/summary.json'
  },
  notion: {
    statusUrl: 'https://status.notion.so/api/v2/status.json',
    summaryUrl: 'https://status.notion.so/api/v2/summary.json'
  },
  figma: {
    statusUrl: 'https://status.figma.com/api/v2/status.json',
    summaryUrl: 'https://status.figma.com/api/v2/summary.json'
  },
  zoom: {
    statusUrl: 'https://status.zoom.us/api/v2/status.json',
    summaryUrl: 'https://status.zoom.us/api/v2/summary.json'
  },
  stripe: {
    statusUrl: 'https://status.stripe.com/api/v2/status.json',
    summaryUrl: 'https://status.stripe.com/api/v2/summary.json'
  }
}

export async function fetchServiceStatus(slug: string): Promise<StatusPageResponse | null> {
  const source = STATUS_PAGE_SOURCES[slug]
  if (!source) return null

  try {
    const response = await fetch(source.statusUrl, {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' }
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch status for ${slug}:`, error)
    return null
  }
}

export async function fetchAllStatuses(): Promise<Record<string, string>> {
  const results: Record<string, string> = {}
  
  const checks = Object.keys(STATUS_PAGE_SOURCES).map(async (slug) => {
    const status = await fetchServiceStatus(slug)
    if (status) {
      results[slug] = mapIndicatorToStatus(status.status.indicator)
    }
  })
  
  await Promise.all(checks)
  return results
}

function mapIndicatorToStatus(indicator: string): string {
  switch (indicator) {
    case 'none': return 'operational'
    case 'minor': return 'degraded'
    case 'major': return 'partial_outage'
    case 'critical': return 'major_outage'
    default: return 'operational'
  }
}
