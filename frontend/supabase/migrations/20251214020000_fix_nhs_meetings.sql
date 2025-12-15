-- Ensure NHS Meetings organization exists
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
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  is_active = true;

-- Delete existing NHS meeting events to avoid duplicates
DELETE FROM volunteer_events
WHERE title LIKE 'NHS Meeting%'
AND organization_id = (SELECT id FROM volunteer_organizations WHERE slug = 'nhs-meetings');

-- Insert all NHS meetings for 2024-2025 school year
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2024-09-10',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2024-10-08',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2024-11-12',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2024-12-10',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2025-01-14',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2025-02-11',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2025-03-11',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting',
  'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2025-04-15',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT
  id,
  'NHS Meeting - Juniors Only',
  'Special NHS meeting for juniors only - 7:15 AM or 2:35 PM',
  'GVHS Library',
  '2025-05-20',
  '07:15',
  '08:00',
  true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';
