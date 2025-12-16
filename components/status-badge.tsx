import { StatusLevel, getStatusLabel, getStatusEmoji } from '@/lib/status'

interface StatusBadgeProps {
  status: StatusLevel
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }

  const colorClasses = {
    operational: 'bg-green-100 text-green-800 border-green-200',
    minor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    major: 'bg-red-100 text-red-800 border-red-200',
    unknown: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses[status]}`}
    >
      <span>{getStatusEmoji(status)}</span>
      <span>{getStatusLabel(status)}</span>
    </div>
  )
}
