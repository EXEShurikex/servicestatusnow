import * as Icons from 'lucide-react'

interface ServiceIconProps {
  iconName: string | null
  serviceName: string
  bgColor?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ServiceIcon({ iconName, serviceName, bgColor = '#3b82f6', size = 'md' }: ServiceIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
  }

  const Icon = iconName && iconName in Icons ? (Icons as any)[iconName] : Icons.Globe

  const initials = serviceName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105`}
      style={{ backgroundColor: bgColor }}
    >
      {Icon ? (
        <Icon className="text-white" size={iconSizes[size]} strokeWidth={2} />
      ) : (
        <span className="text-white font-bold" style={{ fontSize: iconSizes[size] / 2 }}>
          {initials}
        </span>
      )}
    </div>
  )
}
