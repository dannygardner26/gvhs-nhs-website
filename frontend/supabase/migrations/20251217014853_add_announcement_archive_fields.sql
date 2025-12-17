-- Add archive fields to announcements table
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN announcements.is_archived IS 'Whether the announcement has been archived';
COMMENT ON COLUMN announcements.archived_at IS 'Timestamp when the announcement was archived';
