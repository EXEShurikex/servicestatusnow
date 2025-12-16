# ServiceStatusNow

A production-ready, SEO-first outage/status checker website for monitoring the availability of popular websites, apps, and online services.

## Features

### Core Features
- **Real-time Status Monitoring**: Track outages and issues for 213+ services
- **User-Generated Reports**: Anonymous reporting system with upvoting
- **Trending Detection**: Automatically identify services with elevated report volumes
- **Advanced Search**: Autocomplete search with support for service names and aliases
- **Interactive Charts**: 24-hour report visualization using Recharts
- **Category Organization**: 10 service categories for easy browsing
- **SEO Optimized**: Unique metadata, Open Graph tags, JSON-LD structured data
- **Mobile-First Design**: Responsive UI built with TailwindCSS
- **Fast Performance**: Static generation with ISR (Incremental Static Regeneration)

### Unique Features (Not Available on Competition)

**1. Company Icons & Branded Cards**
- Every service displays its official icon/logo with brand colors
- Professional DownDetector-style visual presentation
- Instant visual recognition of services

**2. Upvote System**
- Users can upvote reports to surface the most impactful issues
- Helps identify severity and validates widespread problems
- Community-driven prioritization

**3. Comments & Discussions**
- Users can comment on individual reports
- Share workarounds, updates, and additional context
- Build community knowledge around issues

**4. Smart Alternatives Widget**
- When a service is down, automatically suggests working alternatives
- Shows only operational related services
- Helps users find immediate solutions

**5. Status History Timeline**
- View historical status changes for each service
- Track patterns and recurring issues
- Understand service reliability over time

**6. Enhanced Report Cards**
- Resolved/unresolved status indicators
- Location-based issue tracking with map pins
- Trending badges on hot issues
- Time-windowed metrics (15m, 1h, 24h)

**7. Geographic Insights**
- Top affected locations display
- Helps identify regional vs global outages
- Better understanding of issue scope

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS + shadcn/ui
- **Charts**: Recharts
- **Date Formatting**: date-fns
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (database is pre-configured)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. The environment variables are already configured in `.env`

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
├── page.tsx                 # Homepage with search and trending
├── status/[slug]/          # Dynamic status pages for each service
├── popular/                # Top 100 services list
├── categories/             # Category listing page
├── category/[slug]/        # Individual category pages
├── about/                  # About page
├── sitemap.ts              # Dynamic sitemap generation
└── robots.ts               # Robots.txt configuration

components/
├── header.tsx                   # Site navigation
├── footer.tsx                   # Site footer
├── search-bar.tsx               # Autocomplete search
├── service-card.tsx             # Enhanced service card with icons
├── service-icon.tsx             # Dynamic icon component
├── status-badge.tsx             # Status indicator
├── report-form.tsx              # Issue reporting form
├── reports-chart.tsx            # 24-hour chart visualization
├── upvote-button.tsx            # Report upvoting system
├── report-comments.tsx          # Comments/discussion system
├── alternatives-widget.tsx      # Smart alternatives when service is down
└── status-history.tsx           # Status timeline component

lib/
├── supabase.ts             # Supabase client and types
└── status.ts               # Status calculation and data fetching logic
```

## Database Schema

### Services Table
Stores 213+ tracked services with brand information
- Core fields: `name`, `slug`, `category`, `aliases`, `baseline_reports_per_hour`, `related_slugs`, `total_checks`
- Brand fields: `icon_name` (Lucide icon), `logo_bg_color` (hex color), `website_url`
- Indexed on: `slug`, `category`, `name`

### Reports Table
Stores user-submitted issue reports with engagement metrics
- Core fields: `service_id`, `issue_type`, `description`, `location`, `created_at`
- Engagement fields: `upvotes` (integer), `is_resolved` (boolean)
- Indexed on: `service_id + created_at`, `upvotes` for time-series and ranking queries

### Report Comments Table
Enables discussions on individual reports
- Fields: `id`, `report_id`, `comment_text`, `created_at`
- Indexed on: `report_id`
- Allows community knowledge sharing and workarounds

### Status History Table
Tracks historical status changes for trend analysis
- Fields: `id`, `service_id`, `status`, `report_count`, `recorded_at`
- Indexed on: `service_id + recorded_at`
- Enables long-term reliability tracking

## How Status Calculation Works

The system determines service status by analyzing report volume:

1. **Data Collection**: Count reports in 15min, 60min, and 24h windows
2. **Baseline Comparison**: Compare current volume to service-specific baseline
3. **Status Assignment**:
   - **🟢 Operational**: Reports < 2x baseline
   - **🟡 Minor Issues**: Reports 2-5x baseline
   - **🔴 Major Outage**: Reports > 5x baseline
   - **⚪ Unknown**: < 3 total reports

Each service has a configurable `baseline_reports_per_hour` in the database.

## Managing Services

### Add New Services

To add services, insert records into the `services` table:

```sql
INSERT INTO services (name, slug, category, aliases, baseline_reports_per_hour, related_slugs, total_checks)
VALUES ('ServiceName', 'service-slug', 'Category', ARRAY['Alias1', 'Alias2'], 10, ARRAY['related-slug'], 0);
```

### Edit Service Data

Services can be edited directly in the Supabase dashboard or via SQL:

```sql
UPDATE services
SET baseline_reports_per_hour = 15, related_slugs = ARRAY['new-related-slug']
WHERE slug = 'service-slug';
```

## Adding Future Enhancements

The codebase is structured for easy expansion:

### Real-Time Uptime Checks
Add actual uptime monitoring in `lib/status.ts`:
```typescript
// TODO: Integrate with uptime monitoring service
// Example: Pingdom, UptimeRobot, or custom HTTP checks
export async function checkServiceUptime(url: string) {
  // Implementation here
}
```

### Database Upgrade
Switch from in-memory to full database (already using Supabase):
```typescript
// Already implemented! Using Supabase PostgreSQL
// Data persists across deployments
```

### Caching Layer
Add Redis for hot paths in `lib/status.ts`:
```typescript
// TODO: Add Redis caching
// Cache trending services, most checked services
// TTL: 60 seconds for real-time data
```

### API Endpoints
Create API routes in `app/api/` for external integrations:
```typescript
// app/api/status/[slug]/route.ts
export async function GET(request, { params }) {
  // Return JSON status data
}
```

## SEO Features

- **Unique Titles**: Each page has descriptive, keyword-rich titles
- **Meta Descriptions**: Custom descriptions for every service page
- **Open Graph**: Social media preview optimization
- **JSON-LD**: Structured data for search engines
- **Dynamic Sitemap**: Auto-generated with all 200+ service pages
- **Robots.txt**: Configured for full crawlability
- **Clean URLs**: SEO-friendly slugs (e.g., `/status/twitter`)

## Performance Optimization

- **ISR**: Pages revalidate every 60 seconds
- **Static Generation**: All service pages pre-generated at build
- **Parallel Data Fetching**: Uses Promise.all for concurrent requests
- **Indexed Queries**: Database indexes optimize common queries
- **Component Code Splitting**: Automatic Next.js optimization

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub

2. Import project in Vercel dashboard

3. Vercel will auto-detect Next.js and configure build settings

4. Deploy! The site will be live at `your-project.vercel.app`

### Environment Variables

All required environment variables are already configured in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Categories

The site organizes services into 10 categories:

1. Social Media
2. Messaging
3. Email
4. Banking
5. Payments
6. Streaming (Video & Music)
7. Gaming
8. Cloud/SaaS
9. Shopping
10. Internet/ISP

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
