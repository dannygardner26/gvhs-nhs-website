-- Fix foreign key constraints to enable CASCADE delete
-- Run this in your Supabase SQL editor to fix the deletion issues

-- First, drop existing foreign key constraints if they exist
ALTER TABLE active_checkins DROP CONSTRAINT IF EXISTS fk_active_checkins_user_id;
ALTER TABLE session_history DROP CONSTRAINT IF EXISTS fk_session_history_user_id;
ALTER TABLE checkin_sessions DROP CONSTRAINT IF EXISTS fk_checkin_sessions_user_id;
ALTER TABLE opportunity_suggestions DROP CONSTRAINT IF EXISTS fk_opportunity_suggestions_user_id;
ALTER TABLE school_visit_signups DROP CONSTRAINT IF EXISTS fk_school_visit_signups_user_id;

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

-- Verify constraints were created
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    confdeltype AS on_delete_action
FROM pg_constraint
WHERE conrelid IN (
    SELECT oid FROM pg_class
    WHERE relname IN ('active_checkins', 'session_history', 'checkin_sessions', 'opportunity_suggestions', 'school_visit_signups')
);