-- Add student_feedback column to monthly_service_submissions
-- This is the feedback visible to students, separate from admin_notes which is internal
ALTER TABLE monthly_service_submissions
ADD COLUMN IF NOT EXISTS student_feedback TEXT;

-- Add student_feedback column to isp_checkins
ALTER TABLE isp_checkins
ADD COLUMN IF NOT EXISTS student_feedback TEXT;
