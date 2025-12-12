-- Add NHS Meetings organization
INSERT INTO volunteer_organizations (name, slug, description, icon_name, color, sort_order, is_active)
VALUES (
  'NHS Meetings',
  'nhs-meetings',
  'Monthly NHS chapter meetings for all members',
  'Calendar',
  '#6366F1',
  0,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Add meeting events for 2024-2025 school year
-- Get the organization ID first
DO $$
DECLARE
  meetings_org_id UUID;
BEGIN
  SELECT id INTO meetings_org_id FROM volunteer_organizations WHERE slug = 'nhs-meetings';

  IF meetings_org_id IS NOT NULL THEN
    -- September 10, 2024
    INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
    VALUES (meetings_org_id, 'NHS Meeting', 'Monthly NHS chapter meeting', 'GVHS', '2024-09-10', '15:00', '16:00', true)
    ON CONFLICT DO NOTHING;

    -- October 8, 2024
    INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
    VALUES (meetings_org_id, 'NHS Meeting', 'Monthly NHS chapter meeting', 'GVHS', '2024-10-08', '15:00', '16:00', true)
    ON CONFLICT DO NOTHING;

    -- November 12, 2024
    INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
    VALUES (meetings_org_id, 'NHS Meeting', 'Monthly NHS chapter meeting', 'GVHS', '2024-11-12', '15:00', '16:00', true)
    ON CONFLICT DO NOTHING;

    -- December 10, 2024
    INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
    VALUES (meetings_org_id, 'NHS Meeting', 'Monthly NHS chapter meeting', 'GVHS', '2024-12-10', '15:00', '16:00', true)
    ON CONFLICT DO NOTHING;

    -- January 14, 2025
    INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
    VALUES (meetings_org_id, 'NHS Meeting', 'Monthly NHS chapter meeting', 'GVHS', '2025-01-14', '15:00', '16:00', true)
    ON CONFLICT DO NOTHING;

    -- February 11, 2025
    INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
    VALUES (meetings_org_id, 'NHS Meeting', 'Monthly NHS chapter meeting', 'GVHS', '2025-02-11', '15:00', '16:00', true)
    ON CONFLICT DO NOTHING;

    -- March 11, 2025
    INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
    VALUES (meetings_org_id, 'NHS Meeting', 'Monthly NHS chapter meeting', 'GVHS', '2025-03-11', '15:00', '16:00', true)
    ON CONFLICT DO NOTHING;

    -- April 15, 2025
    INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
    VALUES (meetings_org_id, 'NHS Meeting', 'Monthly NHS chapter meeting', 'GVHS', '2025-04-15', '15:00', '16:00', true)
    ON CONFLICT DO NOTHING;

    -- May 20, 2025 (Special - Juniors only)
    INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
    VALUES (meetings_org_id, 'NHS Meeting - Juniors Only', 'Special NHS meeting for juniors only', 'GVHS', '2025-05-20', '15:00', '16:00', true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
