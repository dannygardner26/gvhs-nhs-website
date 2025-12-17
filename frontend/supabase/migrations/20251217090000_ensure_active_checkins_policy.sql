-- Ensure RLS policy exists for active_checkins table
-- This allows the count and active queries to work

-- Enable RLS (if not already)
ALTER TABLE active_checkins ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy to ensure it exists
DROP POLICY IF EXISTS "Allow all operations on active_checkins" ON active_checkins;
CREATE POLICY "Allow all operations on active_checkins" ON active_checkins
  FOR ALL USING (true) WITH CHECK (true);
