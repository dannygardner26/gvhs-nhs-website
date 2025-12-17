-- Ensure transportation columns exist in volunteer_interest_submissions table
-- These might be missing if the table was created before the columns were added

DO $$
BEGIN
    -- Add has_own_ride column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'volunteer_interest_submissions'
        AND column_name = 'has_own_ride'
    ) THEN
        ALTER TABLE volunteer_interest_submissions ADD COLUMN has_own_ride TEXT;
    END IF;

    -- Add willing_to_take_others column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'volunteer_interest_submissions'
        AND column_name = 'willing_to_take_others'
    ) THEN
        ALTER TABLE volunteer_interest_submissions ADD COLUMN willing_to_take_others TEXT;
    END IF;
END $$;
