-- Create table for check-in issue reports
CREATE TABLE IF NOT EXISTS checkin_issue_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    issue_type TEXT NOT NULL CHECK (issue_type IN ('missed_checkin', 'forgot_checkout', 'other')),
    details TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_checkin_issue_reports_status ON checkin_issue_reports(status);
CREATE INDEX IF NOT EXISTS idx_checkin_issue_reports_user_id ON checkin_issue_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_checkin_issue_reports_created_at ON checkin_issue_reports(created_at DESC);

-- Enable RLS
ALTER TABLE checkin_issue_reports ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts from anyone (for submitting reports)
CREATE POLICY "Allow public insert on checkin_issue_reports"
ON checkin_issue_reports
FOR INSERT
TO public
WITH CHECK (true);

-- Policy to allow select for admin viewing
CREATE POLICY "Allow public select on checkin_issue_reports"
ON checkin_issue_reports
FOR SELECT
TO public
USING (true);

-- Policy to allow updates (for admin to resolve issues)
CREATE POLICY "Allow public update on checkin_issue_reports"
ON checkin_issue_reports
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
