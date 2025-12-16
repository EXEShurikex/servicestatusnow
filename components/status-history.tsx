'use client'

import { useState, useEffect } from 'react'
import { supabase, StatusHistory } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { getStatusEmoji } from '@/lib/status'
import { Clock } from 'lucide-react'

interface StatusHistoryProps {
  serviceId: string
}

export function StatusHistoryComponent({ serviceId }: StatusHistoryProps) {
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [serviceId])

  const loadHistory = async () => {
    const { data } = await supabase
      .from('status_history')
      .select('*')
      .eq('service_id', serviceId)
      .order('recorded_at', { ascending: false })
      .limit(10)

    if (data) {
      setHistory(data)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading history...</div>
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Clock className="mx-auto mb-2 opacity-50" size={24} />
        <p className="text-sm">No historical data available yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {history.map((entry, index) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="text-2xl">{getStatusEmoji(entry.status as any)}</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 capitalize">
              {entry.status.replace('-', ' ')}
            </div>
            <div className="text-xs text-gray-500">
              {entry.report_count} reports • {formatDistanceToNow(new Date(entry.recorded_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
