import Link from 'next/link'
import { ServiceWithStatus } from '@/lib/supabase'
import { ServiceIcon } from './service-icon'
import { StatusBadge } from './status-badge'
import { ArrowRight } from 'lucide-react'

interface AlternativesWidgetProps {
  alternatives: ServiceWithStatus[]
  currentServiceName: string
  isDown: boolean
}

export function AlternativesWidget({ alternatives, currentServiceName, isDown }: AlternativesWidgetProps) {
  if (!isDown || alternatives.length === 0) return null

  const operationalAlternatives = alternatives.filter((alt) => alt.status === 'operational')

  if (operationalAlternatives.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg">
          <ArrowRight className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Try These Alternatives
          </h3>
          <p className="text-sm text-gray-600">
            While {currentServiceName} is experiencing issues
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {operationalAlternatives.slice(0, 3).map((service) => (
          <Link
            key={service.id}
            href={`/status/${service.slug}`}
            className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <ServiceIcon
                iconName={service.icon_name}
                serviceName={service.name}
                bgColor={service.logo_bg_color}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {service.name}
                </h4>
                <p className="text-xs text-gray-500">{service.category}</p>
              </div>
              <StatusBadge status={service.status} size="sm" />
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        These services are currently operational and may serve as temporary alternatives
      </p>
    </div>
  )
}
