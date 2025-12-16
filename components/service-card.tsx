import Link from 'next/link'
import { ServiceWithStatus } from '@/lib/supabase'
import { StatusBadge } from './status-badge'
import { ServiceIcon } from './service-icon'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ServiceCardProps {
  service: ServiceWithStatus
  showTrend?: boolean
}

export function ServiceCard({ service, showTrend = false }: ServiceCardProps) {
  const isTrending = service.reports_60m > service.baseline_reports_per_hour * 2

  return (
    <Link
      href={`/status/${service.slug}`}
      className="group block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all bg-white relative overflow-hidden"
    >
      {isTrending && showTrend && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <TrendingUp size={12} />
          Trending
        </div>
      )}

      <div className="flex items-start gap-3">
        <ServiceIcon
          iconName={service.icon_name}
          serviceName={service.name}
          bgColor={service.logo_bg_color}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {service.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {service.category}
          </p>
          <div className="mt-2">
            <StatusBadge status={service.status} size="sm" />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-gray-500">15 min</div>
          <div className="text-sm font-semibold text-gray-900">{service.reports_15m}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">1 hour</div>
          <div className="text-sm font-semibold text-gray-900">{service.reports_60m}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">24 hours</div>
          <div className="text-sm font-semibold text-gray-900">{service.reports_24h}</div>
        </div>
      </div>
    </Link>
  )
}
