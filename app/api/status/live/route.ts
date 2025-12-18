import { NextResponse } from 'next/server'
import { fetchAllStatuses, STATUS_PAGE_SOURCES } from '@/lib/status-checker'

export const revalidate = 60

export async function GET() {
  try {
    const statuses = await fetchAllStatuses()
    
    const services = Object.keys(STATUS_PAGE_SOURCES).map(slug => ({
      slug,
      name: formatName(slug),
      status: statuses[slug] || 'unknown'
    }))

    const operational = services.filter(s => s.status === 'operational').length
    const issues = services.filter(s => s.status !== 'operational').length

    return NextResponse.json({
      success: true,
      summary: {
        total: services.length,
        operational,
        issues
      },
      services,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching live status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}

function formatName(slug: string): string {
  const names: Record<string, string> = {
    discord: 'Discord',
    github: 'GitHub',
    cloudflare: 'Cloudflare',
    twitch: 'Twitch',
    reddit: 'Reddit',
    dropbox: 'Dropbox',
    vercel: 'Vercel',
    netlify: 'Netlify',
    notion: 'Notion',
    figma: 'Figma',
    zoom: 'Zoom',
    stripe: 'Stripe'
  }
  return names[slug] || slug
}
