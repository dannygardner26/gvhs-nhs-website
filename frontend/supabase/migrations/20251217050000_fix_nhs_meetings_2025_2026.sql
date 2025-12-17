-- Fix NHS Meetings for 2025-2026 school year
-- All meetings should be on Wednesdays
-- Dates: Sep 10, Oct 8, Nov 12, Dec 10 (2025) and Jan 14, Feb 11, Mar 11, Apr 15, May 20 (2026)

-- Delete incorrect 2025-2026 NHS meeting events
DELETE FROM volunteer_events
WHERE title LIKE 'NHS Meeting%'
AND event_date >= '2025-09-01'
AND organization_id = (SELECT id FROM volunteer_organizations WHERE slug = 'nhs-meetings');

-- Insert correct NHS meetings for 2025-2026 school year (all Wednesdays)

-- September 10, 2025 (Wednesday)
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT id, 'NHS Meeting', 'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM', 'GVHS Auditorium', '2025-09-10', '07:15', '08:00', true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

-- October 8, 2025 (Wednesday)
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT id, 'NHS Meeting', 'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM', 'GVHS Auditorium', '2025-10-08', '07:15', '08:00', true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

-- November 12, 2025 (Wednesday)
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT id, 'NHS Meeting', 'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM', 'GVHS Auditorium', '2025-11-12', '07:15', '08:00', true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

-- December 10, 2025 (Wednesday)
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT id, 'NHS Meeting', 'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM', 'GVHS Auditorium', '2025-12-10', '07:15', '08:00', true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

-- January 14, 2026 (Wednesday)
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT id, 'NHS Meeting', 'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM', 'GVHS Auditorium', '2026-01-14', '07:15', '08:00', true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

-- February 11, 2026 (Wednesday)
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT id, 'NHS Meeting', 'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM', 'GVHS Auditorium', '2026-02-11', '07:15', '08:00', true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

-- March 11, 2026 (Wednesday)
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT id, 'NHS Meeting', 'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM', 'GVHS Auditorium', '2026-03-11', '07:15', '08:00', true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

-- April 15, 2026 (Wednesday)
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT id, 'NHS Meeting', 'Monthly NHS chapter meeting - 7:15 AM or 2:35 PM', 'GVHS Auditorium', '2026-04-15', '07:15', '08:00', true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';

-- May 20, 2026 (Wednesday) - Juniors Only
INSERT INTO volunteer_events (organization_id, title, description, location, event_date, start_time, end_time, is_active)
SELECT id, 'NHS Meeting - Juniors Only', 'Special NHS meeting for juniors only - 7:15 AM or 2:35 PM', 'GVHS Auditorium', '2026-05-20', '07:15', '08:00', true
FROM volunteer_organizations WHERE slug = 'nhs-meetings';
