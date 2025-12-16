import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Service = {
  id: string
  name: string
  slug: string
  category: string
  aliases: string[]
  baseline_reports_per_hour: number
  related_slugs: string[]
  total_checks: number
  created_at: string
  icon_name: string | null
  website_url: string | null
  logo_bg_color: string
}

export type Report = {
  id: string
  service_id: string
  issue_type: string
  description: string | null
  location: string | null
  created_at: string
  upvotes: number
  is_resolved: boolean
}

export type ReportComment = {
  id: string
  report_id: string
  comment_text: string
  created_at: string
}

export type StatusHistory = {
  id: string
  service_id: string
  status: string
  report_count: number
  recorded_at: string
}

export type StatusLevel = 'operational' | 'minor' | 'major' | 'unknown'

export type ServiceWithStatus = Service & {
  status: StatusLevel
  last_updated: string
  reports_15m: number
  reports_60m: number
  reports_24h: number
}
