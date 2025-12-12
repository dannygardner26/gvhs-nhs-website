-- Add resubmitted_at column to track when students resubmit flagged/approved submissions

ALTER TABLE monthly_service_submissions
ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN monthly_service_submissions.resubmitted_at IS 'Timestamp when a previously reviewed submission was resubmitted by the student';
