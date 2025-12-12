-- Create monthly_service_comments table for conversation threads on flagged submissions
-- This enables back-and-forth communication between admins and students

CREATE TABLE IF NOT EXISTS monthly_service_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES monthly_service_submissions(id) ON DELETE CASCADE,
  author_type VARCHAR(20) NOT NULL CHECK (author_type IN ('admin', 'student')),
  author_id VARCHAR(50) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE monthly_service_comments ENABLE ROW LEVEL SECURITY;

-- Create policy for service role full access
CREATE POLICY "Service role full access on comments"
ON monthly_service_comments FOR ALL USING (true) WITH CHECK (true);

-- Index for fast lookups by submission
CREATE INDEX idx_service_comments_submission ON monthly_service_comments(submission_id);

-- Index for lookups by author
CREATE INDEX idx_service_comments_author ON monthly_service_comments(author_id);

-- Add comment for documentation
COMMENT ON TABLE monthly_service_comments IS 'Stores conversation thread messages between admins and students for monthly service submissions';
