-- Create opportunity_suggestions table for volunteer opportunity suggestions from members
CREATE TABLE IF NOT EXISTS opportunity_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nhs_user_id VARCHAR(6) NOT NULL,
  opportunity_title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  organization_name VARCHAR(200),
  contact_info VARCHAR(200),
  estimated_hours VARCHAR(100),
  preferred_location VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_suggestions_status ON opportunity_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_opportunity_suggestions_created_at ON opportunity_suggestions(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunity_suggestions_nhs_user_id ON opportunity_suggestions(nhs_user_id);

-- Enable RLS
ALTER TABLE opportunity_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
DROP POLICY IF EXISTS "Allow all operations on opportunity_suggestions" ON opportunity_suggestions;
CREATE POLICY "Allow all operations on opportunity_suggestions" ON opportunity_suggestions FOR ALL USING (true);
