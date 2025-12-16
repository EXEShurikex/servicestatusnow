import { supabase, Service, Report, StatusLevel, ServiceWithStatus } from './supabase'

export type { StatusLevel, ServiceWithStatus, Service, Report } from './supabase'

export function calculateStatus(
  reports15m: number,
  reports60m: number,
  baselinePerHour: number
): StatusLevel {
  if (reports60m === 0) {
    return 'operational'
  }

  if (reports60m < 3) {
    return 'unknown'
  }

  const minorThreshold = baselinePerHour * 2
  const majorThreshold = baselinePerHour * 5

  if (reports60m >= majorThreshold) {
    return 'major'
  } else if (reports60m >= minorThreshold) {
    return 'minor'
  }

  return 'operational'
}

export function getStatusLabel(status: StatusLevel): string {
  switch (status) {
    case 'operational':
      return 'No issues reported'
    case 'minor':
      return 'Some issues reported'
    case 'major':
      return 'Major outage reported'
    case 'unknown':
      return 'Not enough data'
  }
}

export function getStatusEmoji(status: StatusLevel): string {
  switch (status) {
    case 'operational':
      return '🟢'
    case 'minor':
      return '🟡'
    case 'major':
      return '🔴'
    case 'unknown':
      return '⚪'
  }
}

export async function getReportCounts(serviceId: string) {
  const now = new Date()
  const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000)
  const sixtyMinAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [reports15m, reports60m, reports24h] = await Promise.all([
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('service_id', serviceId)
      .gte('created_at', fifteenMinAgo.toISOString()),
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('service_id', serviceId)
      .gte('created_at', sixtyMinAgo.toISOString()),
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('service_id', serviceId)
      .gte('created_at', twentyFourHoursAgo.toISOString()),
  ])

  return {
    reports_15m: reports15m.count || 0,
    reports_60m: reports60m.count || 0,
    reports_24h: reports24h.count || 0,
  }
}

export async function getServiceWithStatus(slug: string): Promise<ServiceWithStatus | null> {
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!service) return null

  const counts = await getReportCounts(service.id)
  const status = calculateStatus(
    counts.reports_15m,
    counts.reports_60m,
    service.baseline_reports_per_hour
  )

  return {
    ...service,
    status,
    last_updated: new Date().toISOString(),
    ...counts,
  }
}

export async function getServicesWithStatus(serviceIds: string[]): Promise<ServiceWithStatus[]> {
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .in('id', serviceIds)

  if (!services) return []

  const servicesWithStatus = await Promise.all(
    services.map(async (service) => {
      const counts = await getReportCounts(service.id)
      const status = calculateStatus(
        counts.reports_15m,
        counts.reports_60m,
        service.baseline_reports_per_hour
      )

      return {
        ...service,
        status,
        last_updated: new Date().toISOString(),
        ...counts,
      }
    })
  )

  return servicesWithStatus
}

export async function getTrendingServices(limit: number = 12): Promise<ServiceWithStatus[]> {
  const sixtyMinAgo = new Date(Date.now() - 60 * 60 * 1000)

  const { data: recentReports } = await supabase
    .from('reports')
    .select('service_id')
    .gte('created_at', sixtyMinAgo.toISOString())

  if (!recentReports || recentReports.length === 0) {
    return []
  }

  const serviceCounts = recentReports.reduce((acc, report) => {
    acc[report.service_id] = (acc[report.service_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topServiceIds = Object.entries(serviceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([serviceId]) => serviceId)

  if (topServiceIds.length === 0) return []

  return getServicesWithStatus(topServiceIds)
}

export async function getMostCheckedServices(limit: number = 12): Promise<ServiceWithStatus[]> {
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('total_checks', { ascending: false })
    .limit(limit)

  if (!services) return []

  return getServicesWithStatus(services.map((s) => s.id))
}

export async function searchServices(query: string): Promise<Service[]> {
  if (!query || query.length < 2) return []

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
    .order('total_checks', { ascending: false })
    .limit(20)

  if (!services) return []

  const lowerQuery = query.toLowerCase()
  const exactMatches = services.filter(
    (s) =>
      s.name.toLowerCase() === lowerQuery ||
      s.slug.toLowerCase() === lowerQuery ||
      s.aliases.some((a: string) => a.toLowerCase() === lowerQuery)
  )

  const aliasMatches = services.filter(
    (s) =>
      !exactMatches.includes(s) &&
      s.aliases.some((a: string) => a.toLowerCase().includes(lowerQuery))
  )

  const partialMatches = services.filter(
    (s) => !exactMatches.includes(s) && !aliasMatches.includes(s)
  )

  return [...exactMatches, ...aliasMatches, ...partialMatches]
}

export async function getRecentReports(serviceId: string, limit: number = 50): Promise<Report[]> {
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return reports || []
}

export async function getChartData(serviceId: string) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const { data: reports } = await supabase
    .from('reports')
    .select('created_at')
    .eq('service_id', serviceId)
    .gte('created_at', twentyFourHoursAgo.toISOString())
    .order('created_at', { ascending: true })

  if (!reports) return []

  const buckets: Record<string, number> = {}
  const now = new Date()

  for (let i = 0; i < 96; i++) {
    const bucketTime = new Date(now.getTime() - i * 15 * 60 * 1000)
    const bucketKey = bucketTime.toISOString().slice(0, 16)
    buckets[bucketKey] = 0
  }

  reports.forEach((report) => {
    const reportTime = new Date(report.created_at)
    const bucketKey = reportTime.toISOString().slice(0, 16)
    const nearestBucket = Object.keys(buckets).reduce((prev, curr) => {
      return Math.abs(new Date(curr).getTime() - reportTime.getTime()) <
        Math.abs(new Date(prev).getTime() - reportTime.getTime())
        ? curr
        : prev
    })
    buckets[nearestBucket] = (buckets[nearestBucket] || 0) + 1
  })

  return Object.entries(buckets)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([time, count]) => ({
      time: new Date(time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      reports: count,
    }))
}

export async function submitReport(data: {
  serviceId: string
  issueType: string
  description?: string
  location?: string
}) {
  const { error } = await supabase.from('reports').insert({
    service_id: data.serviceId,
    issue_type: data.issueType,
    description: data.description || null,
    location: data.location || null,
  })

  if (!error) {
    await supabase
      .from('services')
      .update({ total_checks: supabase.rpc('increment') as any })
      .eq('id', data.serviceId)
  }

  return { error }
}

export async function getServicesByCategory(category: string): Promise<ServiceWithStatus[]> {
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('category', category)
    .order('total_checks', { ascending: false })

  if (!services) return []

  return getServicesWithStatus(services.map((s) => s.id))
}

export async function getAllServices(): Promise<Service[]> {
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('name', { ascending: true })

  return services || []
}

export const CATEGORIES = [
  { slug: 'social', name: 'Social' },
  { slug: 'messaging', name: 'Messaging' },
  { slug: 'email', name: 'Email' },
  { slug: 'banking', name: 'Banking' },
  { slug: 'payments', name: 'Payments' },
  { slug: 'streaming', name: 'Streaming' },
  { slug: 'gaming', name: 'Gaming' },
  { slug: 'cloud-saas', name: 'Cloud/SaaS' },
  { slug: 'shopping', name: 'Shopping' },
  { slug: 'internet-isp', name: 'Internet/ISP' },
]
