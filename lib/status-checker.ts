 libstatus-checker.ts
 Pulls from official status pages (Discord, GitHub, Cloudflare, etc.)

export interface StatusPageResponse {
  status {
    indicator 'none'  'minor'  'major'  'critical'
    description string
  }
}

export interface StatusPageIncident {
  id string
  name string
  status string
  impact string
  created_at string
  updated_at string
  resolved_at string  null
  shortlink string
  incident_updates { status string; body string; created_at string }[]
  components { name string; status string }[]
}

 Official status page URLs (free public APIs)
export const STATUS_PAGE_SOURCES Recordstring, { statusUrl string; summaryUrl string } = {
  discord {
    statusUrl 'httpsdiscordstatus.comapiv2status.json',
    summaryUrl 'httpsdiscordstatus.comapiv2summary.json'
  },
  github {
    statusUrl 'httpswww.githubstatus.comapiv2status.json',
    summaryUrl 'httpswww.githubstatus.comapiv2summary.json'
  },
  cloudflare {
    statusUrl 'httpswww.cloudflarestatus.comapiv2status.json',
    summaryUrl 'httpswww.cloudflarestatus.comapiv2summary.json'
  },
  twitch {
    statusUrl 'httpsstatus.twitch.tvapiv2status.json',
    summaryUrl 'httpsstatus.twitch.tvapiv2summary.json'
  },
  reddit {
    statusUrl 'httpswww.redditstatus.comapiv2status.json',
    summaryUrl 'httpswww.redditstatus.comapiv2summary.json'
  },
  dropbox {
    statusUrl 'httpsstatus.dropbox.comapiv2status.json',
    summaryUrl 'httpsstatus.dropbox.comapiv2summary.json'
  },
  vercel {
    statusUrl 'httpswww.vercel-status.comapiv2status.json',
    summaryUrl 'httpswww.vercel-status.comapiv2summary.json'
  },
  netlify {
    statusUrl 'httpswww.netlifystatus.comapiv2status.json',
    summaryUrl 'httpswww.netlifystatus.comapiv2summary.json'
  },
  notion {
    statusUrl 'httpsstatus.notion.soapiv2status.json',
    summaryUrl 'httpsstatus.notion.soapiv2summary.json'
  },
  figma {
    statusUrl 'httpsstatus.figma.comapiv2status.json',
    summaryUrl 'httpsstatus.figma.comapiv2summary.json'
  },
  zoom {
    statusUrl 'httpsstatus.zoom.usapiv2status.json',
    summaryUrl 'httpsstatus.zoom.usapiv2summary.json'
  },
  stripe {
    statusUrl 'httpsstatus.stripe.comapiv2status.json',
    summaryUrl 'httpsstatus.stripe.comapiv2summary.json'
  }
}

export async function fetchServiceStatus(slug string) PromiseStatusPageResponse  null {
  const source = STATUS_PAGE_SOURCES[slug]
  if (!source) return null

  try {
    const response = await fetch(source.statusUrl, {
      next { revalidate 60 },
      headers { 'Accept' 'applicationjson' }
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch status for ${slug}`, error)
    return null
  }
}

export async function fetchAllStatuses() PromiseRecordstring, string {
  const results Recordstring, string = {}
  
  const checks = Object.keys(STATUS_PAGE_SOURCES).map(async (slug) = {
    const status = await fetchServiceStatus(slug)
    if (status) {
      results[slug] = mapIndicatorToStatus(status.status.indicator)
    }
  })
  
  await Promise.all(checks)
  return results
}

function mapIndicatorToStatus(indicator string) string {
  switch (indicator) {
    case 'none' return 'operational'
    case 'minor' return 'degraded'
    case 'major' return 'partial_outage'
    case 'critical' return 'major_outage'
    default return 'operational'
  }
}