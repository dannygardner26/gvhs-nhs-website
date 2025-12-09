-- Supabase Database Schema for GVHS NHS Check-in System
-- Run this script in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores registered users
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL, -- Custom user ID/PIN (6-digit)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE, -- For account-based login
  password_hash VARCHAR(255), -- Bcrypt hashed password
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session history table - stores all check-in/check-out sessions
CREATE TABLE session_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  username VARCHAR(200) NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL,
  checked_out_at TIMESTAMPTZ,
  duration_ms BIGINT, -- Duration in milliseconds
  forced_by_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active check-ins table - tracks currently checked-in users
CREATE TABLE active_checkins (
  user_id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(200) NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_session_history_user_id ON session_history(user_id);
CREATE INDEX idx_session_history_checked_in_at ON session_history(checked_in_at);
CREATE INDEX idx_active_checkins_checked_in_at ON active_checkins(checked_in_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) - Enable for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_checkins ENABLE ROW LEVEL SECURITY;

-- Policies for public access (adjust as needed for your use case)
-- For now, allowing all operations for development
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on session_history" ON session_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on active_checkins" ON active_checkins FOR ALL USING (true);

-- Opportunity suggestions table - stores volunteer opportunity suggestions from members
CREATE TABLE opportunity_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nhs_user_id VARCHAR(6) NOT NULL, -- 6-digit NHS user ID
  opportunity_title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  organization_name VARCHAR(200),
  contact_info VARCHAR(300),
  estimated_hours VARCHAR(100),
  preferred_location VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  reviewed_by VARCHAR(50), -- NHS admin user ID
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for opportunity suggestions
CREATE INDEX idx_opportunity_suggestions_status ON opportunity_suggestions(status);
CREATE INDEX idx_opportunity_suggestions_created_at ON opportunity_suggestions(created_at);
CREATE INDEX idx_opportunity_suggestions_nhs_user_id ON opportunity_suggestions(nhs_user_id);

-- Enable RLS for opportunity suggestions
ALTER TABLE opportunity_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy for opportunity suggestions
CREATE POLICY "Allow all operations on opportunity_suggestions" ON opportunity_suggestions FOR ALL USING (true);

-- Trigger for opportunity suggestions updated_at
CREATE TRIGGER update_opportunity_suggestions_updated_at
  BEFORE UPDATE ON opportunity_suggestions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Optional: Create a view for user statistics
CREATE VIEW user_stats AS
SELECT
  u.user_id,
  u.username,
  u.first_name,
  u.last_name,
  COUNT(sh.id) as total_sessions,
  COALESCE(SUM(sh.duration_ms), 0) as total_duration_ms,
  ROUND(COALESCE(SUM(sh.duration_ms), 0) / 1000.0 / 60.0 / 60.0, 2) as total_hours,
  ac.checked_in_at as currently_checked_in_at,
  CASE WHEN ac.user_id IS NOT NULL THEN true ELSE false END as is_currently_checked_in
FROM users u
LEFT JOIN session_history sh ON u.user_id = sh.user_id AND sh.checked_out_at IS NOT NULL
LEFT JOIN active_checkins ac ON u.user_id = ac.user_id
GROUP BY u.user_id, u.username, u.first_name, u.last_name, ac.checked_in_at;