-- Supabase Database Schema for GVHS NHS Check-in System
-- Run this script in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores registered users
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL, -- Custom user ID/PIN (6-digit, encrypted)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE, -- For account-based login
  password_hash VARCHAR(255), -- Bcrypt hashed password (encrypted)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session history table - stores all check-in/check-out sessions
CREATE TABLE session_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL, -- References users.user_id
  username VARCHAR(200) NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL,
  checked_out_at TIMESTAMPTZ,
  duration BIGINT, -- Duration in milliseconds
  forced_by_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alternative name for session_history (some APIs use this)
CREATE TABLE checkin_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  username VARCHAR(200) NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL,
  checked_out_at TIMESTAMPTZ,
  duration BIGINT,
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

-- School visit signups table - stores school visit registrations
CREATE TABLE school_visit_signups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nhs_user_id VARCHAR(6) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  grade_level VARCHAR(20) NOT NULL,
  school_name VARCHAR(200) NOT NULL,
  preferred_date VARCHAR(100),
  transportation_needed BOOLEAN DEFAULT FALSE,
  dietary_restrictions TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  additional_notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_session_history_user_id ON session_history(user_id);
CREATE INDEX idx_session_history_checked_in_at ON session_history(checked_in_at);
CREATE INDEX idx_checkin_sessions_user_id ON checkin_sessions(user_id);
CREATE INDEX idx_checkin_sessions_checked_in_at ON checkin_sessions(checked_in_at);
CREATE INDEX idx_active_checkins_checked_in_at ON active_checkins(checked_in_at);
CREATE INDEX idx_opportunity_suggestions_status ON opportunity_suggestions(status);
CREATE INDEX idx_opportunity_suggestions_created_at ON opportunity_suggestions(created_at);
CREATE INDEX idx_opportunity_suggestions_nhs_user_id ON opportunity_suggestions(nhs_user_id);
CREATE INDEX idx_school_visit_signups_status ON school_visit_signups(status);
CREATE INDEX idx_school_visit_signups_nhs_user_id ON school_visit_signups(nhs_user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_opportunity_suggestions_updated_at
  BEFORE UPDATE ON opportunity_suggestions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_school_visit_signups_updated_at
  BEFORE UPDATE ON school_visit_signups
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) - Enable for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_visit_signups ENABLE ROW LEVEL SECURITY;

-- Policies for public access (adjust as needed for your use case)
-- For now, allowing all operations for development
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on session_history" ON session_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on checkin_sessions" ON checkin_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on active_checkins" ON active_checkins FOR ALL USING (true);
CREATE POLICY "Allow all operations on opportunity_suggestions" ON opportunity_suggestions FOR ALL USING (true);
CREATE POLICY "Allow all operations on school_visit_signups" ON school_visit_signups FOR ALL USING (true);

-- Optional: Create a view for user statistics
CREATE VIEW user_stats AS
SELECT
  u.user_id,
  u.first_name,
  u.last_name,
  u.email,
  COUNT(sh.id) as total_sessions,
  COALESCE(SUM(sh.duration), 0) as total_duration_ms,
  ROUND(COALESCE(SUM(sh.duration), 0) / 1000.0 / 60.0 / 60.0, 2) as total_hours,
  ac.checked_in_at as currently_checked_in_at,
  CASE WHEN ac.user_id IS NOT NULL THEN true ELSE false END as is_currently_checked_in
FROM users u
LEFT JOIN session_history sh ON u.user_id = sh.user_id AND sh.checked_out_at IS NOT NULL
LEFT JOIN active_checkins ac ON u.user_id = ac.user_id
GROUP BY u.user_id, u.first_name, u.last_name, u.email, ac.checked_in_at;