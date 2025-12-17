-- Create announcement read receipts table
CREATE TABLE IF NOT EXISTS announcement_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id VARCHAR(6) NOT NULL,
  user_name VARCHAR(100),
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_read_receipts_announcement ON announcement_read_receipts(announcement_id);
CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON announcement_read_receipts(user_id);

-- Enable RLS
ALTER TABLE announcement_read_receipts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert read receipts (authenticated users will track their reads)
CREATE POLICY "Allow insert read receipts" ON announcement_read_receipts
  FOR INSERT WITH CHECK (true);

-- Allow reading all receipts (for admin stats)
CREATE POLICY "Allow read receipts" ON announcement_read_receipts
  FOR SELECT USING (true);

-- Service role has full access
CREATE POLICY "Service role full access" ON announcement_read_receipts
  FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE announcement_read_receipts IS 'Tracks which users have viewed each announcement';
COMMENT ON COLUMN announcement_read_receipts.user_id IS '6-digit NHS user ID';
COMMENT ON COLUMN announcement_read_receipts.user_name IS 'User display name at time of reading';
