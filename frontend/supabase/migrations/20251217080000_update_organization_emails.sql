-- Update contact emails for organizations

-- Kids in Motion email
UPDATE volunteer_organizations
SET contact_email = 'info@kidsinmotionpa.org'
WHERE slug = 'kids-in-motion';

-- NHS Elementary visits email
UPDATE volunteer_organizations
SET contact_email = 'pmorabito@gvsd.org'
WHERE slug = 'nhs-elementary';
