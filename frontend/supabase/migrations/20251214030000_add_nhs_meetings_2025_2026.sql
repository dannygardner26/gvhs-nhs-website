-- Add NHS Meetings for 2025-2026 school year
-- Keeping existing 2024-2025 meetings for historical records

-- Insert NHS meetings for 2025-2026 school year (Second Tuesdays typically)
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2025-09-09',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings'
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2025-10-14',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings'
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2025-11-11',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings'
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2025-12-09',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings'
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2026-01-13',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings'
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2026-02-10',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings'
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2026-03-10',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings'
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2026-04-14',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings'
ON CONFLICT DO NOTHING;

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting - Juniors Only',
  'Special NHS meeting for juniors only - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2026-05-12',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings'
ON CONFLICT DO NOTHING;
