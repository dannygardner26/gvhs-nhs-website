-- Create volunteer interest submissions table
CREATE TABLE IF NOT EXISTS volunteer_interest_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL,
    nhs_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    preferred_contact TEXT DEFAULT 'email',
    status TEXT DEFAULT 'pending',
    -- NHS Elementary specific fields
    preferred_school TEXT,
    teacher_last_name TEXT,
    teacher_email TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    -- Transportation fields
    has_own_ride TEXT,
    willing_to_take_others TEXT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_volunteer_interest_event ON volunteer_interest_submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_interest_user ON volunteer_interest_submissions(nhs_user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_interest_status ON volunteer_interest_submissions(status);

-- Enable RLS
ALTER TABLE volunteer_interest_submissions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on volunteer_interest_submissions" ON volunteer_interest_submissions
    FOR ALL USING (true) WITH CHECK (true);
