/*
  # Add Icons, Upvotes, and Comments

  1. Changes to `services` table
    - Add `icon_name` (text) - Lucide icon name for the service
    - Add `website_url` (text) - Official website URL
    - Add `logo_bg_color` (text) - Background color for logo display

  2. Changes to `reports` table
    - Add `upvotes` (integer) - Count of user upvotes
    - Add `is_resolved` (boolean) - Whether issue is resolved

  3. New `report_comments` table
    - id (uuid, primary key)
    - report_id (uuid, foreign key)
    - comment_text (text)
    - created_at (timestamptz)

  4. New `status_history` table
    - id (uuid, primary key)
    - service_id (uuid, foreign key)
    - status (text)
    - report_count (integer)
    - recorded_at (timestamptz)

  5. Security
    - Public read access for all tables
    - Public insert for comments
    - No update/delete to maintain integrity
*/

-- Add new columns to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_name text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS logo_bg_color text DEFAULT '#3b82f6';

-- Add new columns to reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_resolved boolean DEFAULT false;

-- Create report_comments table
CREATE TABLE IF NOT EXISTS report_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create status_history table
CREATE TABLE IF NOT EXISTS status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  status text NOT NULL,
  report_count integer DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_report_comments_report_id ON report_comments(report_id);
CREATE INDEX IF NOT EXISTS idx_status_history_service_id ON status_history(service_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_upvotes ON reports(upvotes DESC);

-- Enable RLS
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Public read access to comments
CREATE POLICY "Public read access to report_comments"
  ON report_comments FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public insert access to comments
CREATE POLICY "Public insert access to report_comments"
  ON report_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public read access to status history
CREATE POLICY "Public read access to status_history"
  ON status_history FOR SELECT
  TO anon, authenticated
  USING (true);