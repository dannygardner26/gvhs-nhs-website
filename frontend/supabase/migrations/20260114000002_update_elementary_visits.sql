-- Update Elementary Visit events to be generic "All Schools"
UPDATE volunteer_events
SET title = 'Elementary School Visit (All Schools)',
    location = 'All Elementary Schools',
    description = 'Visit all local elementary schools to read with students. RSVP via Canvas or the Remind form.'
WHERE organization_id IN (SELECT id FROM volunteer_organizations WHERE slug = 'nhs-elementary');
