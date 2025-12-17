-- Add optional link_url column to announcements table
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN announcements.link_url IS 'Optional URL link to include with the announcement';
