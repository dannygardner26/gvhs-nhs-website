-- Remove username column and fix foreign key constraints
-- Migration created 2024-12-09

-- First, drop the user_stats view that depends on username column
DROP VIEW IF EXISTS user_stats;

-- Drop existing foreign key constraints if they exist
ALTER TABLE active_checkins DROP CONSTRAINT IF EXISTS fk_active_checkins_user_id;
ALTER TABLE session_history DROP CONSTRAINT IF EXISTS fk_session_history_user_id;
ALTER TABLE checkin_sessions DROP CONSTRAINT IF EXISTS fk_checkin_sessions_user_id;
ALTER TABLE opportunity_suggestions DROP CONSTRAINT IF EXISTS fk_opportunity_suggestions_user_id;
ALTER TABLE school_visit_signups DROP CONSTRAINT IF EXISTS fk_school_visit_signups_user_id;

-- Remove username column from users table
ALTER TABLE users DROP COLUMN IF EXISTS username;

-- Remove username column from session_history table
ALTER TABLE session_history DROP COLUMN IF EXISTS username;

-- Remove username column from checkin_sessions table
ALTER TABLE checkin_sessions DROP COLUMN IF EXISTS username;

-- Remove username column from active_checkins table
ALTER TABLE active_checkins DROP COLUMN IF EXISTS username;

-- Add proper foreign key constraints with CASCADE delete
ALTER TABLE active_checkins
ADD CONSTRAINT fk_active_checkins_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE session_history
ADD CONSTRAINT fk_session_history_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE checkin_sessions
ADD CONSTRAINT fk_checkin_sessions_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE opportunity_suggestions
ADD CONSTRAINT fk_opportunity_suggestions_user_id
FOREIGN KEY (nhs_user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE school_visit_signups
ADD CONSTRAINT fk_school_visit_signups_user_id
FOREIGN KEY (nhs_user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- Recreate user_stats view without username column (simplified)
CREATE VIEW user_stats AS
SELECT
  u.user_id,
  u.first_name,
  u.last_name,
  u.email,
  ac.checked_in_at as currently_checked_in_at,
  CASE WHEN ac.user_id IS NOT NULL THEN true ELSE false END as is_currently_checked_in
FROM users u
LEFT JOIN active_checkins ac ON u.user_id = ac.user_id;