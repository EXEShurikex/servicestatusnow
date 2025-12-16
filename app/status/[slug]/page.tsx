import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { StatusBadge } from '@/components/status-badge'
import { ServiceIcon } from '@/components/service-icon'
import { ReportForm } from '@/components/report-form'
import { ReportsChart } from '@/components/reports-chart'
import { UpvoteButton } from '@/components/upvote-button'
import { ReportComments } from '@/components/report-comments'
import { AlternativesWidget } from '@/components/alternatives-widget'
import { StatusHistoryComponent } from '@/components/status-history'
import { getServiceWithStatus, getRecentReports, getChartData, getServicesWithStatus, getAllServices } from '@/lib/status'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Metadata } from 'next'
import { getStatusLabel } from '@/lib/status'
import { ExternalLink, MapPin } from 'lucide-react'

export const revalidate = 60

export async function generateStaticParams() {
  const services = await getAllServices()
  return services.map((service) => ({
    slug: service.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getServiceWithStatus(params.slug)

  if (!service) {
    return {
      title: 'Service Not Found',
    }
  }

  const statusText = getStatusLabel(service.status)
  const title = `Is ${service.name} Down Right Now? Live Outage Reports | ServiceStatusNow`
  const description = `Check real-time outage reports and status updates for ${service.name}. Current status: ${statusText}. View the reports chart and see recent issues.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function StatusPage({ params }: { params: { slug: string } }) {
  const service = await getServiceWithStatus(params.slug)

  if (!service) {
    notFound()
  }

  const [recentReports, chartData, relatedServices] = await Promise.all([
    getRecentReports(service.id, 20),
    getChartData(service.id),
    service.related_slugs.length > 0
      ? (async () => {
          const { data } = await supabase
            .from('services')
            .select('*')
            .in('slug', service.related_slugs)
            .limit(6)
          return data
            ? getServicesWithStatus(data.map((s) => s.id))
            : []
        })()
      : Promise.resolve([]),
  ])

  const locationCounts: Record<string, number> = {}
  recentReports.forEach((report) => {
    if (report.location) {
      locationCounts[report.location] = (locationCounts[report.location] || 0) + 1
    }
  })
  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const isDown = service.status === 'major' || service.status === 'minor'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showSearch />

      <main className="flex-1">
        <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start gap-4 mb-6">
              <ServiceIcon
                iconName={service.icon_name}
                serviceName={service.name}
                bgColor={service.logo_bg_color}
                size="xl"
              />
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Is {service.name} down right now?
                </h1>
                {service.website_url && (
                  <a
                    href={service.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Visit official site
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <StatusBadge status={service.status} size="lg" />
              <span className="text-sm text-gray-500">
                Last updated: {formatDistanceToNow(new Date(service.last_updated), { addSuffix: true })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{service.reports_15m}</div>
                <div className="text-xs text-gray-500 mt-1">Last 15 minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{service.reports_60m}</div>
                <div className="text-xs text-gray-500 mt-1">Last 60 minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{service.reports_24h}</div>
                <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports over time (last 24 hours)</h2>
            <ReportsChart data={chartData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-8">
              {isDown && (
                <AlternativesWidget
                  alternatives={relatedServices}
                  currentServiceName={service.name}
                  isDown={isDown}
                />
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h2>
                {recentReports.length === 0 ? (
                  <p className="text-gray-500">No reports in the last 24 hours</p>
                ) : (
                  <div className="space-y-4">
                    {recentReports.slice(0, 10).map((report) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-white bg-blue-600 px-2 py-1 rounded">
                                {report.issue_type.toUpperCase()}
                              </span>
                              {report.location && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <MapPin size={12} />
                                  {report.location}
                                </span>
                              )}
                              {report.is_resolved && (
                                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                  RESOLVED
                                </span>
                              )}
                            </div>
                            {report.description && (
                              <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                            )}
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                              </span>
                              <UpvoteButton reportId={report.id} initialUpvotes={report.upvotes} />
                            </div>
                            <ReportComments reportId={report.id} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {topLocations.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Affected Locations</h2>
                  <div className="space-y-2">
                    {topLocations.map(([location, count]) => (
                      <div key={location} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{location}</span>
                        <span className="text-sm font-medium text-gray-900">{count} reports</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <ReportForm serviceId={service.id} serviceName={service.name} />

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
                <StatusHistoryComponent serviceId={service.id} />
              </div>

              {relatedServices.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Services</h3>
                  <div className="space-y-2">
                    {relatedServices.map((relatedService) => (
                      <Link
                        key={relatedService.id}
                        href={`/status/${relatedService.slug}`}
                        className="group block p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <ServiceIcon
                            iconName={relatedService.icon_name}
                            serviceName={relatedService.name}
                            bgColor={relatedService.logo_bg_color}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {relatedService.name}
                            </div>
                            <StatusBadge status={relatedService.status} size="sm" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
