-- Add is_approved column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- Create system_settings table for global config
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT -- optional, user_id of admin
);

-- Enable RLS on system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins (service role or specific logic) can modify settings
-- For now, purely managed by API (service role) to be safe, or authenticated admins.
-- Let's allow read for authenticated (needed for registration check?)
-- Actually, registration is public/anon. So we might need public read for 'require_approval' setting.

CREATE POLICY "Allow public read settings" ON system_settings
    FOR SELECT USING (true);

-- Only admins can update (we'll enforce this via Admin API which uses service role or admin check)
-- But for RLS, let's say "authenticated" can't write. 
-- We'll explicitly rely on the API to update this table.

-- Insert default setting
INSERT INTO system_settings (key, value)
VALUES ('require_approval', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;
