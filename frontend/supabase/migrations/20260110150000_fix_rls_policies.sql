-- Enable RLS
ALTER TABLE active_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop insecure policies
DROP POLICY IF EXISTS "Allow all operations on active_checkins" ON active_checkins;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;

-- Users (Restrictive)
-- Everyone can read stats (needed for leaderboard/counts) but let's restrict to authenticated only?
-- Actually, the frontend needs to read count without auth? "Current count" is public.
CREATE POLICY "Public read count" ON active_checkins FOR SELECT USING (true);
-- Only Admins can delete (checkout) others?
-- Users can insert (but we'll validate in API)
CREATE POLICY "Authenticated insert" ON active_checkins FOR INSERT TO authenticated WITH CHECK (true);
-- Only Admins can DELETE
-- We need a way to identify admins in RLS. Usually via a claim or a table lookup.
-- For now, we'll restrict DELETE to service_role (API) or authenticated (users checking out themselves).
-- Since we can't easily link UUID to 6-digit ID in SQL, we'll rely on API verification for checkout entitlement.
CREATE POLICY "Authenticated delete" ON active_checkins FOR DELETE TO authenticated USING (true);

-- Users Table
-- Users can see their own data
CREATE POLICY "Users see own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
-- Admins (service role) can do everything
