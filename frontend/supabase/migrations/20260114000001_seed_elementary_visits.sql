-- Seed Elementary Visit Dates
DO $$
DECLARE
    org_id UUID;
BEGIN
    -- Get the organization ID for NHS Elementary Visits
    SELECT id INTO org_id FROM volunteer_organizations WHERE slug = 'nhs-elementary';

    IF org_id IS NOT NULL THEN
        -- Charlestown Elementary: 1/23
        INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, spots_available, is_active)
        VALUES (org_id, 'Charlestown Elementary Visit', 'Visit Charlestown Elementary to read with students.', 'Charlestown Elementary', '2025-01-23', '09:00:00', '10:30:00', 30, true)
        ON CONFLICT DO NOTHING;

        -- Sugartown Elementary: 2/20
        INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, spots_available, is_active)
        VALUES (org_id, 'Sugartown Elementary Visit', 'Visit Sugartown Elementary to read with students.', 'Sugartown Elementary', '2025-02-20', '09:00:00', '10:30:00', 30, true)
        ON CONFLICT DO NOTHING;

        -- General Wayne Elementary: 3/13
        INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, spots_available, is_active)
        VALUES (org_id, 'General Wayne Elementary Visit', 'Visit General Wayne Elementary to read with students.', 'General Wayne Elementary', '2025-03-13', '09:00:00', '10:30:00', 30, true)
        ON CONFLICT DO NOTHING;

        -- KD Markley Elementary: 4/17
        INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, spots_available, is_active)
        VALUES (org_id, 'KD Markley Elementary Visit', 'Visit KD Markley Elementary to read with students.', 'KD Markley Elementary', '2025-04-17', '09:00:00', '10:30:00', 30, true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
