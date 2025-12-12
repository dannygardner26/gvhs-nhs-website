-- Add requirements column to volunteer_events table
-- This column stores event-specific requirements as a JSONB array

ALTER TABLE volunteer_events
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN volunteer_events.requirements IS 'Array of requirement strings for the volunteer event';
