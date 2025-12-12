-- Link existing events to their organizations based on title matching
-- This finds events with titles containing organization-related keywords and links them

-- Update NHS Elementary events
UPDATE volunteer_events
SET organization_id = (
  SELECT id FROM volunteer_organizations WHERE slug = 'nhs-elementary' LIMIT 1
)
WHERE (
  LOWER(title) LIKE '%elementary%'
  OR LOWER(title) LIKE '%nhs elementary%'
)
AND organization_id IS NULL;

-- Update Kids in Motion events
UPDATE volunteer_events
SET organization_id = (
  SELECT id FROM volunteer_organizations WHERE slug = 'kids-in-motion' LIMIT 1
)
WHERE (
  LOWER(title) LIKE '%kids in motion%'
)
AND organization_id IS NULL;

-- Update Interact Club events
UPDATE volunteer_events
SET organization_id = (
  SELECT id FROM volunteer_organizations WHERE slug = 'interact-club' LIMIT 1
)
WHERE (
  LOWER(title) LIKE '%interact%'
)
AND organization_id IS NULL;

-- Update GVCO Tech Seniors events
UPDATE volunteer_events
SET organization_id = (
  SELECT id FROM volunteer_organizations WHERE slug = 'gvco-tech-seniors' LIMIT 1
)
WHERE (
  LOWER(title) LIKE '%tech senior%'
  OR LOWER(title) LIKE '%gvco%'
)
AND organization_id IS NULL;

-- Update Social Media events
UPDATE volunteer_events
SET organization_id = (
  SELECT id FROM volunteer_organizations WHERE slug = 'social-media' LIMIT 1
)
WHERE (
  LOWER(title) LIKE '%social media%'
)
AND organization_id IS NULL;

-- Update Peer Tutoring events
UPDATE volunteer_events
SET organization_id = (
  SELECT id FROM volunteer_organizations WHERE slug = 'peer-tutoring' LIMIT 1
)
WHERE (
  LOWER(title) LIKE '%tutor%'
)
AND organization_id IS NULL;

-- Add contact_email to existing organizations that are missing it
UPDATE volunteer_organizations
SET contact_email = 'pmorabito@gvsd.org'
WHERE slug IN ('nhs-elementary', 'gvco-tech-seniors', 'social-media', 'peer-tutoring')
AND contact_email IS NULL;

UPDATE volunteer_organizations
SET contact_email = 'abillman26@student.gvsd.org'
WHERE slug = 'interact-club'
AND contact_email IS NULL;

UPDATE volunteer_organizations
SET website = 'https://kidsinmotionpa.org'
WHERE slug = 'kids-in-motion'
AND website IS NULL;
