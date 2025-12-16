/*
  # ServiceStatusNow Database Schema

  1. New Tables
    - services: Stores tracked services (websites, apps, platforms)
      - id (uuid, primary key)
      - name (text) - Display name
      - slug (text, unique) - URL-friendly identifier
      - category (text) - Service category
      - aliases (text array) - Alternative names for search
      - baseline_reports_per_hour (integer) - Normal report volume
      - related_slugs (text array) - Related service slugs
      - total_checks (integer) - Total checks/reports counter
      - created_at (timestamptz)
    
    - reports: User-submitted outage/issue reports
      - id (uuid, primary key)
      - service_id (uuid, foreign key)
      - issue_type (text) - Type of issue
      - description (text, optional)
      - location (text, optional)
      - created_at (timestamptz)

  2. Security
    - Public read access to services
    - Public insert access to reports (anonymous)
    - No update/delete to maintain data integrity
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  aliases text[] DEFAULT '{}',
  baseline_reports_per_hour integer DEFAULT 5,
  related_slugs text[] DEFAULT '{}',
  total_checks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  issue_type text NOT NULL,
  description text,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_reports_service_created ON reports(service_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Services: Public read access
CREATE POLICY "Public read access to services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (true);

-- Reports: Public read access
CREATE POLICY "Public read access to reports"
  ON reports FOR SELECT
  TO anon, authenticated
  USING (true);

-- Reports: Public insert access (anonymous reporting)
CREATE POLICY "Public insert access to reports"
  ON reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);